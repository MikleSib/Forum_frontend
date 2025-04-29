import { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from '../shared/types/auth.types';
import API_URL from '../config/api';

// Функция для обработки HTTP ошибок
const handleErrors = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || 'Произошла ошибка при обращении к серверу');
  }
  return response.json();
};

// Регистрация пользователя
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleErrors(response);
  } catch (error: any) {
    console.error('Ошибка при регистрации:', error);
    throw new Error(error.message || 'Не удалось зарегистрироваться');
  }
};

// Вход пользователя
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      // Если сервер вернул 500 ошибку, считаем что это неверные учетные данные
      if (response.status === 500) {
        throw new Error('Неверное имя пользователя или пароль');
      }
      throw new Error(error.detail || error.message || 'Не удалось войти');
    }

    return response.json();
  } catch (error: any) {
    console.error('Ошибка при входе:', error);
    throw new Error(error.message || 'Не удалось войти');
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