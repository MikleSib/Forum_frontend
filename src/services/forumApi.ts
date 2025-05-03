import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { userStore } from '../shared/store/userStore';
import { 
  ForumCategory, 
  ForumTopic, 
  ForumPost, 
  PaginatedResponse,
  CreateTopicRequest,
  CreatePostRequest,
  ForumPostImage,
  CreateCategoryRequest
} from '../shared/types/forum.types';
import { refreshToken } from './auth';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Базовый URL API
const API_URL = 'https://рыбный-форум.рф/api';

// Создаем инстанс axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для установки токена
api.interceptors.request.use((config) => {
  // Получаем токен из localStorage напрямую вместо userStore
  const token = localStorage.getItem('access_token');
  console.log('Токен в запросе форума:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем интерцептор для обработки ошибок и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    // Проверяем, что это ошибка 401 и запрос не является повторным
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.log('Получена ошибка 401, пробуем обновить токен');
      
      try {
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
        // Записываем информацию об ошибке, но НЕ перенаправляем на страницу входа
        // Просто продолжаем выполнение и возвращаем ошибку для обработки компонентом
      }
    }
    
    return Promise.reject(error);
  }
);

// API для работы с форумом
export const forumApi = {
  // Категории
  getCategories: async (): Promise<ForumCategory[]> => {
    try {
      const response = await api.get('/forum/categories');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий форума:', error);
      throw error;
    }
  },
  
  getCategoryById: async (categoryId: number): Promise<ForumCategory> => {
    try {
      const response = await api.get(`/forum/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении категории форума ${categoryId}:`, error);
      throw error;
    }
  },
  
  createCategory: async (categoryData: CreateCategoryRequest): Promise<ForumCategory> => {
    try {
      const response = await api.post('/forum/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании категории форума:', error);
      throw error;
    }
  },
  
  updateCategory: async (categoryId: number, categoryData: Partial<ForumCategory>): Promise<ForumCategory> => {
    try {
      const response = await api.put(`/forum/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении категории форума ${categoryId}:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (categoryId: number): Promise<void> => {
    try {
      await api.delete(`/forum/categories/${categoryId}`);
    } catch (error) {
      console.error(`Ошибка при удалении категории форума ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Темы
  getTopics: async (params: { 
    category_id?: number;
    author_id?: number;
    pinned?: boolean;
    page?: number;
    page_size?: number;
  } = {}): Promise<PaginatedResponse<ForumTopic>> => {
    try {
      const response = await api.get('/forum/topics', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении тем форума:', error);
      throw error;
    }
  },
  
  getTopicById: async (topicId: number): Promise<ForumTopic> => {
    try {
      const response = await api.get(`/forum/topics/${topicId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении темы форума ${topicId}:`, error);
      throw error;
    }
  },
  
  createTopic: async (topicData: CreateTopicRequest): Promise<ForumTopic> => {
    try {
      const response = await api.post('/forum/topics', topicData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании темы форума:', error);
      throw error;
    }
  },
  
  updateTopic: async (topicId: number, topicData: Partial<ForumTopic>): Promise<ForumTopic> => {
    try {
      const response = await api.put(`/forum/topics/${topicId}`, topicData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении темы форума ${topicId}:`, error);
      throw error;
    }
  },
  
  deleteTopic: async (topicId: number): Promise<void> => {
    try {
      await api.delete(`/forum/topics/${topicId}`);
    } catch (error) {
      console.error(`Ошибка при удалении темы форума ${topicId}:`, error);
      throw error;
    }
  },
  
  pinTopic: async (topicId: number): Promise<ForumTopic> => {
    try {
      const response = await api.put(`/forum/topics/${topicId}/pin`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при закреплении/откреплении темы форума ${topicId}:`, error);
      throw error;
    }
  },
  
  closeTopic: async (topicId: number): Promise<ForumTopic> => {
    try {
      const response = await api.put(`/forum/topics/${topicId}/close`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при закрытии/открытии темы форума ${topicId}:`, error);
      throw error;
    }
  },
  
  // Сообщения
  getPosts: async (params: {
    topic_id: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ForumPost>> => {
    try {
      const response = await api.get('/forum/posts', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообщений форума:', error);
      throw error;
    }
  },
  
  getPostById: async (postId: number): Promise<ForumPost> => {
    try {
      const response = await api.get(`/forum/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  createPost: async (postData: CreatePostRequest): Promise<ForumPost> => {
    try {
      // Консоль для отладки - проверим, что приходят изображения
      console.log('postData в createPost:', postData);
      console.log('Изображения для загрузки:', postData.images);
      
      // Массив для хранения информации о загруженных изображениях
      const uploadedImages = [];
      
      // Если есть изображения, сначала загружаем их
      if (postData.images && postData.images.length > 0) {
        console.log('Начинаем загрузку', postData.images.length, 'изображений');
        
        // Загружаем каждое изображение отдельно
        for (const imageFile of postData.images) {
          console.log('Загружаем файл:', imageFile.name, imageFile.type, imageFile.size);
          
          const formData = new FormData();
          
          // Добавляем файл
          formData.append('file', imageFile);
          
          // Выводим для отладки содержимое FormData (только для современных браузеров)
          console.log('FormData содержит файл:', imageFile.name);
          
          try {
            // Отправляем запрос на загрузку изображения без Content-Type заголовка
            const uploadResponse = await api.post('/forum/posts/upload_image', formData, {
              headers: {
                // Удаляем заголовок Content-Type, чтобы браузер сам добавил правильный с boundary
                'Content-Type': undefined
              }
            });
            
            console.log('Ответ сервера:', uploadResponse.data);
            
            // Добавляем информацию о загруженном изображении
            if (uploadResponse.data && uploadResponse.data.image_url) {
              uploadedImages.push({
                image_url: uploadResponse.data.image_url,
                thumbnail_url: uploadResponse.data.thumbnail_url || uploadResponse.data.image_url,
                size: uploadResponse.data.size || imageFile.size,
                dimensions: uploadResponse.data.dimensions || '',
                filename: uploadResponse.data.filename || imageFile.name,
                content_type: uploadResponse.data.content_type || imageFile.type
              });
            } else {
              console.error('Ошибка при загрузке изображения: неверный формат ответа', uploadResponse.data);
            }
          } catch (error: any) {
            console.error('Ошибка при загрузке изображения:', error);
            if (error.response) {
              console.error('Детали ошибки:', error.response.data);
            }
          }
        }
      }
      
      console.log('Загружено изображений:', uploadedImages.length);
      
      // Теперь создаем пост с URL загруженных изображений
      const response = await api.post('/forum/posts', {
        topic_id: postData.topic_id,
        content: postData.content,
        quoted_post_id: postData.quoted_post_id,
        images: uploadedImages // Добавляем массив с загруженными изображениями
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании сообщения форума:', error);
      throw error;
    }
  },
  
  uploadPostImages: async (postId: number, images: File[]): Promise<ForumPostImage[]> => {
    try {
      const formData = new FormData();
      
      // Добавляем ID поста
      formData.append('post_id', postId.toString());
      
      // Добавляем изображения правильно - каждое под ключом 'file' (не files)
      images.forEach((image) => {
        formData.append('file', image);
      });
      
      // Отправляем запрос на загрузку изображений без явного указания Content-Type
      // Браузер автоматически добавит правильные заголовки с boundary для multipart/form-data
      const response = await api.post('/forum/posts/upload_image', formData);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке изображений к сообщению:', error);
      throw error;
    }
  },
  
  updatePost: async (postId: number, content: string): Promise<ForumPost> => {
    try {
      const response = await api.put(`/forum/posts/${postId}`, { content });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  deletePost: async (postId: number): Promise<void> => {
    try {
      await api.delete(`/forum/posts/${postId}`);
    } catch (error) {
      console.error(`Ошибка при удалении сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  likePost: async (postId: number): Promise<any> => {
    try {
      const response = await api.post(`/forum/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при лайке сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  dislikePost: async (postId: number): Promise<any> => {
    try {
      const response = await api.post(`/forum/posts/${postId}/dislike`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при дизлайке сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  deleteReaction: async (postId: number): Promise<any> => {
    try {
      const response = await api.delete(`/forum/posts/${postId}/reactions`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении реакции сообщения форума ${postId}:`, error);
      throw error;
    }
  },
  
  // Получение активных тем
  getActiveTopics: async (limit: number = 5): Promise<ForumTopic[]> => {
    try {
      const response = await api.get(`/forum/active-topics?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении активных тем форума:', error);
      throw error;
    }
  }
}; 