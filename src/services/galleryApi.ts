import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config/api';
import { refreshToken } from './auth';
import { userStore } from '../shared/store/userStore';

// Интерфейс для запроса с флагом повторной попытки
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Интерфейсы
export interface GalleryImage {
  id?: number;
  image_url: string;
  thumbnail_url: string;
  size: number;
  order_index: number;
}

export interface GalleryAuthor {
  id: number;
  username: string;
  avatar?: string;
}

export interface Gallery {
  id: number;
  title: string;
  description?: string;
  author_id: number;
  author_username: string;
  author?: GalleryAuthor;
  created_at: string;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  images_count: number;
  preview_image?: {
    image_url: string;
    thumbnail_url: string;
  };
  images?: GalleryImage[];
}

export interface GalleryComment {
  id: number;
  content: string;
  author_id: number;
  author_username: string;
  author_avatar?: string;
  created_at: string;
}

export interface CreateGalleryData {
  title: string;
  description?: string;
  images: {
    image_url: string;
    thumbnail_url: string;
    size: number;
    order_index: number;
  }[];
}

export interface GalleryListResponse {
  items: Gallery[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CommentsResponse {
  items: GalleryComment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Получение токена из localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Создание экземпляра axios с базовым URL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки 401 ошибок и обновления токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    // Проверяем, что это ошибка 401 и запрос не является повторным
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      try {
        console.log('Gallery API: Получена ошибка 401, пробуем обновить токен');
        // Помечаем запрос как повторный
        originalRequest._retry = true;
        
        // Пробуем обновить токен
        const tokens = await refreshToken();
        console.log('Gallery API: Получены новые токены');
        
        // Сохраняем новые токены в localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        // Сохраняем новые токены в store
        userStore.setAuth({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          user: userStore.user!
        });
        
        // Обновляем токен в заголовке оригинального запроса
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
        
        // Повторяем оригинальный запрос с новым токеном
        console.log('Gallery API: Повторяем запрос с новым токеном');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Gallery API: Ошибка при обновлении токена:', refreshError);
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

// API методы
export const galleryApi = {
  // Получение списка галерей (без токена)
  async getGalleries(
    page: number = 1, 
    pageSize: number = 12,
    sortBy: 'newest' | 'popular' | 'most_commented' = 'newest'
  ): Promise<GalleryListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Добавляем сортировку в зависимости от типа
    switch (sortBy) {
      case 'popular':
        params.append('sort_by', 'likes_count');
        params.append('sort_order', 'desc');
        break;
      case 'most_commented':
        params.append('sort_by', 'comments_count');
        params.append('sort_order', 'desc');
        break;
      case 'newest':
      default:
        params.append('sort_by', 'created_at');
        params.append('sort_order', 'desc');
        break;
    }

    const response = await axios.get(`${API_URL}/galleries?${params.toString()}`);
    return response.data;
  },

  // Получение детальной информации о галерее (увеличивает счетчик просмотров)
  async getGallery(id: number): Promise<Gallery> {
    const response = await axios.get(`${API_URL}/galleries/${id}`);
    return response.data;
  },

  // Создание галереи (требует токен)
  async createGallery(data: CreateGalleryData): Promise<Gallery> {
    const response = await apiClient.post('/galleries', data);
    return response.data;
  },

  // Получение комментариев к галерее
  async getComments(
    galleryId: number, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<CommentsResponse> {
    const response = await axios.get(
      `${API_URL}/galleries/${galleryId}/comments?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  // Добавление комментария (требует токен)
  async addComment(galleryId: number, content: string): Promise<GalleryComment> {
    const response = await apiClient.post(`/galleries/${galleryId}/comments`, {
      content
    });
    return response.data;
  },

  // Лайк галереи (требует токен)
  async likeGallery(galleryId: number): Promise<{ message: string }> {
    const response = await apiClient.post(`/galleries/${galleryId}/like`);
    return response.data;
  },

  // Дизлайк галереи (требует токен)
  async dislikeGallery(galleryId: number): Promise<{ message: string }> {
    const response = await apiClient.post(`/galleries/${galleryId}/dislike`);
    return response.data;
  },

  // Удаление реакции (требует токен)
  async removeReaction(galleryId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/galleries/${galleryId}/reactions`);
    return response.data;
  },

  // Загрузка изображений (для создания галереи)
  async uploadImages(files: File[]): Promise<GalleryImage[]> {
    const uploadedImages: GalleryImage[] = [];
    
    // Загружаем изображения по одному
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('order_index', i.toString());

      const response = await apiClient.post('/galleries/upload_image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      uploadedImages.push({
        ...response.data,
        order_index: i
      });
    }
    
    return uploadedImages;
  }
};

export default galleryApi; 