import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  const { provider } = useParams<{ provider: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('Выполняется вход...');

  useEffect(() => {
    // Функция для загрузки VK ID SDK
    const loadVKIDSDK = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.VKIDSDK) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://id.vk.com/js/sdk/oauth.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Не удалось загрузить VK ID SDK'));
        
        document.body.appendChild(script);
      });
    };

    const processAuth = async () => {
      try {
        // Загружаем SDK, если он еще не загружен
        await loadVKIDSDK();
        
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const payload = searchParams.get('payload');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Проверяем наличие ошибок в параметрах
        if (error) {
          throw new Error(errorDescription || `Ошибка OAuth: ${error}`);
        }

        // Инициализируем SDK
        if (window.VKIDSDK) {
          const VKID = window.VKIDSDK;
          
          VKID.Config.init({
            app: 53543107,
            redirectUrl: window.location.origin,
          });

          // Если есть код авторизации в параметрах URL
          if (code) {
            setMessage('Обмен кода авторизации на токен...');
            
            // Определяем тип провайдера из URL
            let apiProvider: 'vk' | 'mailru' | 'ok' | null = null;
            if (provider) {
              switch (provider) {
                case 'vk':
                  apiProvider = 'vk';
                  break;
                case 'mailru':
                  apiProvider = 'mailru';
                  break;
                case 'ok':
                  apiProvider = 'ok';
                  break;
              }
            }

            if (apiProvider) {
              // Отправляем запрос к нашему API для обмена кода на токен
              await authApi.socialAuth[apiProvider](code);
              navigate('/');
              return;
            } else {
              // Стандартный обмен кода на токен через VK ID API
              const result = await VKID.Auth.exchangeCode(code);
              console.log('Обмен кода успешно выполнен:', result);
              navigate('/');
              return;
            }
          } 
          // Если есть payload в параметрах URL (для VKID SDK)
          else if (payload) {
            setMessage('Обработка данных авторизации...');
            try {
              // Декодируем payload
              const decodedPayload = JSON.parse(decodeURIComponent(payload));
              console.log('Получен payload:', decodedPayload);
              
              const { code: vkidCode, oauth_name: oauthName } = decodedPayload;
              
              // Преобразуем имя провайдера в формат нашего API
              let apiProvider: 'vk' | 'mailru' | 'ok' | null = null;
              
              switch (oauthName) {
                case 'vkid':
                  apiProvider = 'vk';
                  break;
                case 'mail_ru':
                  apiProvider = 'mailru';
                  break;
                case 'ok_ru':
                  apiProvider = 'ok';
                  break;
              }

              if (apiProvider && vkidCode) {
                // Отправляем запрос к нашему API
                await authApi.socialAuth[apiProvider](vkidCode);
                navigate('/');
                return;
              } else {
                throw new Error('В payload отсутствуют необходимые данные');
              }
            } catch (err) {
              console.error('Ошибка при обработке payload:', err);
              throw new Error('Ошибка при обработке данных авторизации');
            }
          } else {
            throw new Error('Не найдены данные для авторизации в URL');
          }
        } else {
          throw new Error('Не удалось инициализировать VK ID SDK');
        }
      } catch (err: any) {
        console.error('Ошибка при авторизации:', err);
        setError(err.message || 'Произошла ошибка при авторизации');
        setLoading(false);
      }
    };

    processAuth();
  }, [location.search, navigate, provider]);

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