import { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from '../shared/types/auth.types';
import API_URL from '../config/api';
import axios from 'axios';
import { userStore } from '../shared/store/userStore';
import { AUTH_STATUS_CHANGED } from '../components/Header';
import crypto from 'crypto-js';

// Функция для обработки HTTP ошибок с обновлением токена
export const handleErrors = async (error: any) => {
  if (axios.isAxiosError(error) && error.config) {
    // Если получили ошибку 401, пробуем обновить токен
    if (error.response?.status === 401 && 
        error.response.data?.detail && 
        (error.response.data?.detail === "Invalid token" || error.response.data?.detail === "Invalid token data")) {
      try {
        const tokens = await refreshToken();
        // Повторяем исходный запрос с новым токеном
        const newToken = tokens.access_token;
        if (!newToken) {
          throw new Error('Не удалось получить новый токен');
        }
        
        // Создаем новый запрос с обновленным токеном
        const newResponse = await axios(error.config.url || '', {
          ...error.config,
          headers: {
            ...error.config.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        return newResponse.data;
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Произошла ошибка при обращении к серверу');
  }
  return error;
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
    // Преобразуем email в нижний регистр перед отправкой
    const email = data.email.toLowerCase();
    formData.append('username', email); // Бэкенд по-прежнему ожидает поле username
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

    const response = await axios.post(`${API_URL}/auth/refresh`, 
      { refresh_token },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data) {
      const tokens = response.data;
      saveTokens(tokens);
      return tokens;
    }
    throw new Error('Не удалось обновить токен');
  } catch (error: any) {
    console.error('Ошибка при обновлении токена:', error);
    clearTokens();
    throw error;
  }
};

// Вход через социальные сети
export const socialLogin = async (provider: 'vk' | 'mailru' | 'ok', code: string): Promise<AuthResponse> => {
  try {
    // Формируем параметры запроса в зависимости от провайдера
    const payload = { code, provider };

    // Делаем запрос к серверу для обмена кода на токены
    const response = await axios.post(`${API_URL}/auth/social/${provider}`, payload);
    
    if (response.data) {
      // Сохраняем токены в localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      // Обновляем состояние в UserStore
      userStore.setAuth(response.data);
      
      // Оповещаем компоненты, что статус авторизации изменился
      window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при входе через ${provider}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Детали ошибки:', error.response.data);
    }
    throw error;
  }
};

// Функция для генерации code_verifier
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Функция для создания code_challenge из code_verifier
const createCodeChallenge = (verifier: string): string => {
  const hash = crypto.SHA256(verifier);
  return crypto.enc.Base64.stringify(hash)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Генерация URL для авторизации через VK
export const getVKAuthUrl = (): string => {
  // Генерируем code_verifier
  const codeVerifier = generateCodeVerifier();
  // Создаем code_challenge
  const codeChallenge = createCodeChallenge(codeVerifier);
  
  // Сохраняем code_verifier в localStorage
  localStorage.setItem('vk_code_verifier', codeVerifier);
  
  // ID приложения из личного кабинета VK ID
  const clientId = '53543107';
  
  // URL для возврата после авторизации
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/vk/callback`);
  
  // Запрашиваемый доступ - email обязателен для идентификации
  const scope = 'email';
  
  // Формируем URL для OAuth 2.1 с PKCE
  return `https://id.vk.com/auth?app_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;
};

// Генерация URL для авторизации через Mail.ru
export const getMailRuAuthUrl = (): string => {
  // ID приложения из личного кабинета VK ID
  const clientId = '53543107';
  
  // URL для возврата после авторизации
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/mailru/callback`);
  
  // Формируем URL для OAuth 2.0
  return `https://oauth.mail.ru/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=userinfo`;
};

// Генерация URL для авторизации через Одноклассники
export const getOKAuthUrl = (): string => {
  // ID приложения из личного кабинета VK ID
  const clientId = '53543107';
  
  // URL для возврата после авторизации
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/ok/callback`);
  
  // Формируем URL для OAuth 2.0
  return `https://connect.ok.ru/oauth/authorize?client_id=${clientId}&scope=GET_EMAIL&response_type=code&redirect_uri=${redirectUri}`;
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // Преобразуем email в нижний регистр
      const email = data.email.toLowerCase();
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email, // Бэкенд по-прежнему ожидает поле username
        password: data.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        // Проверяем наличие информации о верификации email
        if (response.data.email_verification && response.data.email_verification.required) {
          // Сохраняем токены на случай, если пользователь захочет повторно войти после подтверждения
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          
          // Добавляем информацию о верификации в ответ для обработки в компоненте Login
          return {
            ...response.data,
            requiresEmailVerification: true
          };
        }

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
    // Очищаем все связанные с авторизацией токены и данные
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth');
    // Очищаем состояние пользователя
    userStore.clear();
    
    // Оповещаем компоненты, что статус авторизации изменился
    window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));
  },
  socialAuth: {
    vk: async (code: string, deviceId?: string) => {
      // Получаем сохраненный code_verifier
      const codeVerifier = localStorage.getItem('vk_code_verifier');
      // Удаляем его из localStorage, так как он больше не нужен
      localStorage.removeItem('vk_code_verifier');

      const response = await axios.post(`${API_URL}/auth/social/vk`, null, {
        params: {
          code,
          provider: 'vk',
          device_id: deviceId,
          code_verifier: codeVerifier
        }
      });
      return response.data;
    },
    mailru: (code: string) => socialLogin('mailru', code),
    ok: (code: string) => socialLogin('ok', code),
    getVKAuthUrl,
    getMailRuAuthUrl,
    getOKAuthUrl
  }
}; 