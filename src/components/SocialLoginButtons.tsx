import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';

declare global {
  interface Window {
    VKIDSDK: any;
  }
}

type SocialLoginButtonsProps = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSuccess, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSuccess = (data: any) => {
    if (onSuccess) {
      onSuccess(data);
    } else {
      navigate('/');
    }
  };

  const handleError = (error: any) => {
    console.error('Ошибка авторизации через соцсеть:', error);
    if (onError) {
      onError(error);
    }
  };

  const initVKID = () => {
    if (!window.VKIDSDK) {
      console.error('VKID SDK не загружен');
      return;
    }

    if (!containerRef.current) {
      console.error('Контейнер для кнопок не найден');
      return;
    }

    const VKID = window.VKIDSDK;
    console.log('Инициализация VKID SDK...', VKID);

    try {
      // Формируем URL для возврата
      const redirectUrl = `https://xn----9sbyncijf1ah6ec.xn--p1ai`;
      
      console.log('Используем redirect URL:', redirectUrl);

      // Инициализация SDK в соответствии с документацией
      VKID.Config.init({
        app: 53543107,
        redirectUrl: redirectUrl,
        responseType: 'code',
        responseMode: 'redirect',
        source: 'lowcode',
        scope: 'email',
      });

      // Создаем список методов авторизации
      const oAuth = new VKID.OAuthList();
      console.log('Создание списка методов авторизации...');

      // Отрисовываем кнопки авторизации
      oAuth.render({
        container: containerRef.current,
        styles: {
          borderRadius: 23,
          theme: 'light',
        },
        oauthList: ['vkid', 'ok_ru', 'mail_ru']
      })
      .on('error', (error: any) => {
        console.error('Ошибка VK ID:', error);
        handleError(error);
      })
      .on('login-success', (payload: any) => {
        console.log('VK ID успешная авторизация:', payload);
        
        const code = payload.code;
        const deviceId = payload.device_id;
        const provider = payload.oauth_name;

        let apiProvider: 'vk' | 'mailru' | 'ok' | null = null;
        
        switch (provider) {
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

        if (apiProvider) {
          authApi.socialAuth[apiProvider](code)
            .then(handleSuccess)
            .catch(handleError);
        } else {
          VKID.Auth.exchangeCode(code, deviceId)
            .then(handleSuccess)
            .catch(handleError);
        }
      })
      .on('callback-closed', () => {
        console.log('Окно авторизации закрыто пользователем');
      });

      console.log('VKID SDK успешно инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации VKID SDK:', error);
      handleError(error);
    }
  };

  useEffect(() => {
    // Динамически загружаем скрипт VKID SDK
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vkid/sdk@2.5.2/dist-sdk/umd/index.js';
    script.async = true;
    script.onload = initVKID;
    script.onerror = () => {
      console.error('Ошибка при загрузке VKID SDK');
      handleError(new Error('Не удалось загрузить SDK для социальной авторизации'));
    };
    
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.querySelector('script[src="https://unpkg.com/@vkid/sdk@2.5.2/dist-sdk/umd/index.js"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        minHeight: '48px',
        margin: '20px 0'
      }}
    />
  );
};

export default SocialLoginButtons; 