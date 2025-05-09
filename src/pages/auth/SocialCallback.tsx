import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/auth';
import { userStore } from '../../shared/store/userStore';
import { AUTH_STATUS_CHANGED } from '../../components/Header';

// Объявляем глобальный объект VKIDSDK
declare global {
  interface Window {
    VKIDSDK: any;
  }
}

// Компонент для обработки коллбэков от социальных сетей
const SocialCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('Выполняется вход...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log('Начало обработки авторизации...');
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const provider = location.pathname.split('/').pop(); // получаем провайдера из пути
        const state = searchParams.get('state');
        const deviceId = searchParams.get('device_id');

        console.log('Получены параметры авторизации:', {
          code,
          state,
          provider,
          deviceId
        });

        if (!code) {
          throw new Error('Код авторизации не найден');
        }

        // Проверка state, если он был сохранён
        if (provider === 'vk' && state) {
          const savedState = localStorage.getItem('vk_auth_state');
          if (state !== savedState) {
            console.warn('Несоответствие state параметра, возможная CSRF атака');
            // Можно продолжить, но лучше прервать для безопасности
            // throw new Error('Ошибка безопасности: несоответствие state параметра');
          }
          // Удаляем state после проверки
          localStorage.removeItem('vk_auth_state');
        }

        setMessage('Обмен кода авторизации на токен...');
        console.log('Отправка запроса на обмен кода...');

        try {
          // Определение метода в зависимости от провайдера
          let authMethod;
          if (provider === 'vk') {
            authMethod = authApi.socialAuth.vk(code, deviceId || undefined);
          } else if (provider === 'mailru') {
            authMethod = authApi.socialAuth.mailru(code);
          } else if (provider === 'ok') {
            authMethod = authApi.socialAuth.ok(code);
          } else {
            throw new Error('Неизвестный провайдер авторизации');
          }

          // Отправляем запрос к нашему API для обмена кода на токен
          const response = await authMethod;
          console.log('Ответ от сервера:', response);
          
          // Сохраняем токены
          if (response.access_token && response.refresh_token) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
          }

          // Обновляем состояние пользователя
          if (response.user) {
            userStore.setAuth(response);
          }

          // Оповещаем компоненты об изменении статуса авторизации
          window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));

          // После успешной авторизации сбрасываем ошибку и loading
          setError(null);
          setLoading(false);
          
          // После успешной авторизации перенаправляем на главную страницу
          console.log('Авторизация успешна, перенаправление на главную страницу...');
          navigate('/');
        } catch (apiError: any) {
          console.error('Ошибка при отправке запроса:', apiError);
          if (apiError.response?.data?.detail) {
            setError(apiError.response.data.detail);
          } else {
            setError(apiError.message || 'Ошибка при авторизации');
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Ошибка при авторизации:', err);
        setError(err.message || 'Произошла ошибка при авторизации');
        setLoading(false);
      }
    };

    processAuth();
  }, [location.search, location.pathname, navigate]);

  // Отображаем индикатор загрузки
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <CircularProgress />
          <Typography variant="h6">
            {message}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Отображаем сообщение об ошибке
  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Ошибка входа
          </Typography>
          <Typography variant="body1" align="center">
            {error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <a href="/login" style={{ textDecoration: 'none' }}>
              Вернуться на страницу входа
            </a>
          </Typography>
        </Paper>
      </Container>
    );
  }

  return null;
};

export default SocialCallback; 