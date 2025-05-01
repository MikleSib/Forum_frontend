import { Post, Category, CreatePostRequest, CreatePostResponse, Comment } from '../shared/types/post.types';
import { refreshToken } from './auth';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { userStore } from '../shared/store/userStore';
import API_URL from '../config/api';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Создаем инстанс axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для установки токена
api.interceptors.request.use((config) => {
  const token = userStore.accessToken;
  console.log('Токен в запросе:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    // Проверяем, что это ошибка 401 и запрос не является повторным
    if (error.response?.status === 401 && 
        error.response?.data && 
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        error.response.data.detail === "Invalid token" && 
        originalRequest &&
        !originalRequest._retry) {
      
      try {
        console.log('Получена ошибка Invalid token, пробуем обновить токен');
        // Помечаем запрос как повторный
        originalRequest._retry = true;
        
        // Пробуем обновить токен
        const tokens = await refreshToken();
        console.log('Получены новые токены:', tokens);
        
        // Сохраняем новые токены в localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        console.log('Токены сохранены в localStorage');
        
        // Сохраняем новые токены в store
        userStore.setAuth({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          user: userStore.user!
        });
        console.log('Токены сохранены в userStore');
        
        // Обновляем токен в заголовке оригинального запроса
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
          console.log('Новый токен установлен в заголовок запроса:', tokens.access_token);
        }
        
        // Повторяем оригинальный запрос с новым токеном
        console.log('Повторяем оригинальный запрос с новым токеном');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        // Если не удалось обновить токен, очищаем данные авторизации
        userStore.clear();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Перенаправляем на страницу входа
        window.location.href = '/login';
        throw refreshError;
      }
    }
    
    return Promise.reject(error);
  }
);

// Админские методы
export const adminApi = {
  deletePost: async (postId: number): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Недостаточно прав для выполнения операции');
    }
    await api.delete(`/post/${postId}/admin`);
  },

  deleteComment: async (commentId: number): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Недостаточно прав для выполнения операции');
    }
    await api.delete(`/comment/${commentId}/admin`);
  },

  createNews: async (newsData: any): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Недостаточно прав для выполнения операции');
    }
    await api.post('/news/', newsData);
  }
};

// Получение всех постов
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get('/posts');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    throw error;
  }
};

// Получение поста по ID
export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const response = await api.get(`/post/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении поста ${id}:`, error);
    throw error;
  }
};

// Получение списка категорий
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return [];
  }
};

// Создание нового поста
export const createPost = async (postData: CreatePostRequest): Promise<CreatePostResponse | null> => {
  try {
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    
    // Добавляем изображения
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    // Добавляем категорию, если она есть
    if (postData.category_id) {
      formData.append('category_id', postData.category_id.toString());
    }

    const response = await api.post('/post/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Детали ошибки:', error.response.data);
    }
    throw error;
  }
};

// Обновление поста
export const updatePost = async (postId: string, postData: Partial<CreatePostRequest>): Promise<CreatePostResponse> => {
  try {
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    
    if (postData.title) formData.append('title', postData.title);
    if (postData.content) formData.append('content', postData.content);
    
    // Добавляем изображения, если они есть
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.patch(`/post/${postId}`, formData);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при обновлении поста ${postId}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Не удалось обновить пост'
    };
  }
};

// Удаление поста
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/post/${postId}`);
    const data = response.data;
    return data.success;
  } catch (error) {
    console.error(`Ошибка при удалении поста ${postId}:`, error);
    return false;
  }
};

// Лайк поста
export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await api.post(`/post/${postId}/like`);
    return true;
  } catch (error) {
    console.error(`Ошибка при лайке поста ${postId}:`, error);
    return false;
  }
};

// Удаление лайка поста
export const unlikePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/post/${postId}/like`);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении лайка поста ${postId}:`, error);
    return false;
  }
};

// Создание комментария
export const createComment = async (postId: string, content: string): Promise<Comment | null> => {
  try {
    const response = await api.post(`/post/${postId}/comment`, { content });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при создании комментария к посту ${postId}:`, error);
    throw error;
  }
};

// Получение комментариев поста
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/post/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении комментариев поста ${postId}:`, error);
    return [];
  }
};

// Обновление комментария
export const updateComment = async (commentId: string, content: string): Promise<Comment | null> => {
  try {
    const response = await api.patch(`/comment/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении комментария ${commentId}:`, error);
    return null;
  }
};

// Удаление комментария
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/comment/${commentId}/admin`);
    const data = response.data;
    return data.success;
  } catch (error) {
    console.error(`Ошибка при удалении комментария ${commentId}:`, error);
    return false;
  }
}; 