import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/auth';

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
        const state = searchParams.get('state');
        const expiresIn = searchParams.get('expires_in');
        const deviceId = searchParams.get('device_id');
        const extId = searchParams.get('ext_id');
        const type = searchParams.get('type');

        console.log('Получены параметры авторизации:', {
          code,
          state,
          expiresIn,
          deviceId,
          extId,
          type
        });

        if (!code) {
          throw new Error('Код авторизации не найден');
        }

        setMessage('Обмен кода авторизации на токен...');
        console.log('Отправка запроса на обмен кода...');

        try {
          // Отправляем запрос к нашему API для обмена кода на токен
          const response = await authApi.socialAuth.vk(code);
          console.log('Ответ от сервера:', response);
          
          // После успешной авторизации перенаправляем на главную страницу
          console.log('Авторизация успешна, перенаправление на главную страницу...');
          navigate('/');
        } catch (apiError: any) {
          console.error('Ошибка при отправке запроса:', apiError);
          throw new Error(`Ошибка при обмене кода: ${apiError.message || 'Неизвестная ошибка'}`);
        }
      } catch (err: any) {
        console.error('Ошибка при авторизации:', err);
        setError(err.message || 'Произошла ошибка при авторизации');
        setLoading(false);
      }
    };

    processAuth();
  }, [location.search, navigate]);

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