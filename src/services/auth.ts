import { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from '../shared/types/auth.types';
import API_URL from '../config/api';
import axios from 'axios';
import { userStore } from '../shared/store/userStore';

// Функция для обработки HTTP ошибок с обновлением токена
export const handleErrors = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    
    // Если получили ошибку 401, пробуем обновить токен
    if (response.status === 401 && error.detail === "Invalid token") {
      try {
        await refreshToken();
        // Повторяем исходный запрос с новым токеном
        const newToken = getAccessToken();
        if (!newToken) {
          throw new Error('Не удалось получить новый токен');
        }
        
        // Создаем новый запрос с обновленным токеном
        const newResponse = await fetch(response.url, {
          method: 'GET', // Используем GET как метод по умолчанию
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        if (!newResponse.ok) {
          const newError = await newResponse.json();
          throw new Error(newError.detail || newError.message || 'Произошла ошибка при повторном запросе');
        }
        
        return newResponse.json();
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    throw new Error(error.detail || error.message || 'Произошла ошибка при обращении к серверу');
  }
  return response.json();
};

// Регистрация пользователя
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
};

// Вход пользователя
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data) {
      userStore.setAuth(response.data);
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};

// Получение профиля пользователя
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Токен не найден');
    }

    const response = await fetch(`${API_URL}/user/get_profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleErrors(response);
  } catch (error: any) {
    console.error('Ошибка при получении профиля:', error);
    throw new Error(error.message || 'Не удалось получить профиль');
  }
};

// Сохранение токенов в localStorage
export const saveTokens = (tokens: AuthResponse) => {
  console.log('Сохраняем токены:', tokens); // Отладочная информация
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  console.log('Токены сохранены в localStorage:', {
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token')
  }); // Отладочная информация
};

// Получение access токена
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Удаление токенов
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Проверка авторизации
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Обновление токена
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      throw new Error('Refresh token не найден');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      throw new Error('Не удалось обновить токен');
    }

    const tokens = await response.json();
    saveTokens(tokens);
    return tokens;
  } catch (error: any) {
    console.error('Ошибка при обновлении токена:', error);
    clearTokens();
    throw error;
  }
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: data.username,
        password: data.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        // Проверяем наличие всех необходимых данных
        if (!response.data.access_token || !response.data.refresh_token || !response.data.user) {
          throw new Error('Неверный формат ответа от сервера');
        }

        // Сохраняем токены в localStorage
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Обновляем состояние в UserStore
        userStore.setAuth(response.data);
        
        console.log('Успешный вход:', {
          user: response.data.user,
          tokens: {
            access: response.data.access_token,
            refresh: response.data.refresh_token
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Детали ошибки:', error.response.data);
      }
      throw error;
    }
  },
  logout: () => {
    // Очищаем токены при выходе
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    userStore.clear();
  }
}; 