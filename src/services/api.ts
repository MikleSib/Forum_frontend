import { Post, Category, CreatePostRequest, CreatePostResponse, Comment } from '../shared/types/post.types';
import { getAccessToken, handleErrors } from './auth';

const API_URL = 'http://localhost:8000';

// Функция для добавления заголовка авторизации
const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Получение всех постов
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleErrors(response);
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    throw error;
  }
};

// Получение поста по ID
export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const response = await fetch(`${API_URL}/post/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleErrors(response);
  } catch (error) {
    console.error(`Ошибка при получении поста ${id}:`, error);
    throw error;
  }
};

// Получение списка категорий
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    return handleErrors(response);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return [];
  }
};

// Создание нового поста
export const createPost = async (postData: CreatePostRequest): Promise<CreatePostResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    });
    return handleErrors(response);
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
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

    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleErrors(response);
  } catch (error: any) {
    console.error(`Ошибка при обновлении поста ${postId}:`, error);
    return {
      success: false,
      error: error.message || 'Не удалось обновить пост'
    };
  }
};

// Удаление поста
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleErrors(response);
    return data.success;
  } catch (error) {
    console.error(`Ошибка при удалении поста ${postId}:`, error);
    return false;
  }
};

// Лайк поста
export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/post/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await handleErrors(response);
    return data.success;
  } catch (error) {
    console.error(`Ошибка при лайке поста ${postId}:`, error);
    return false;
  }
};

// Удаление лайка поста
export const unlikePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/post/${postId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleErrors(response);
    return data.success;
  } catch (error) {
    console.error(`Ошибка при удалении лайка поста ${postId}:`, error);
    return false;
  }
};

// Создание комментария
export const createComment = async (postId: string, content: string): Promise<Comment | null> => {
  try {
    const response = await fetch(`${API_URL}/post/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    });
    return handleErrors(response);
  } catch (error) {
    console.error(`Ошибка при создании комментария к посту ${postId}:`, error);
    throw error;
  }
};

// Получение комментариев поста
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await fetch(`${API_URL}/post/${postId}/comments`);
    return handleErrors(response);
  } catch (error) {
    console.error(`Ошибка при получении комментариев поста ${postId}:`, error);
    return [];
  }
};

// Обновление комментария
export const updateComment = async (commentId: string, content: string): Promise<Comment | null> => {
  try {
    const response = await fetch(`${API_URL}/comment/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    });
    return handleErrors(response);
  } catch (error) {
    console.error(`Ошибка при обновлении комментария ${commentId}:`, error);
    return null;
  }
};

// Удаление комментария
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/comment/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleErrors(response);
    return data.success;
  } catch (error) {
    console.error(`Ошибка при удалении комментария ${commentId}:`, error);
    return false;
  }
}; 