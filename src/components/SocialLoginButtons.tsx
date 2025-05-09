import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import * as VKID from '@vkid/sdk';
import { userStore } from '../shared/store/userStore';
import { AUTH_STATUS_CHANGED } from '../components/Header';

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
    console.log('Успешная авторизация:', data);
    
    // Сохраняем токены
    if (data.access_token && data.refresh_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }

    // Обновляем состояние пользователя
    if (data.user) {
      userStore.setAuth(data);
    }

    // Оповещаем компоненты об изменении статуса авторизации
    window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));

    if (onSuccess) {
      onSuccess(data);
    } else {
      navigate('/dashboard');
    }
  };

  const handleError = (error: any) => {
    console.error('Ошибка авторизации через соцсеть:', error);
    if (onError) {
      onError(error);
    }
  };

  // Функция для генерации state
  const generateState = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Функция для генерации code_verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Функция для создания code_challenge
  const createCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    
    const bytes = new Uint8Array(hash);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
      
    return base64;
  };

  const initVKID = async () => {
    if (!containerRef.current) {
      console.error('Контейнер для кнопок не найден');
      return;
    }

    try {
      // Формируем URL для возврата
      const redirectUrl = `https://xn----9sbyncijf1ah6ec.xn--p1ai`;
      
      console.log('Используем redirect URL:', redirectUrl);

      // Генерируем state
      const state = generateState();
      localStorage.setItem('vk_auth_state', state);

      // Генерируем code_verifier и code_challenge
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await createCodeChallenge(codeVerifier);
      localStorage.setItem('vk_code_verifier', codeVerifier);

      // Инициализация SDK в соответствии с документацией
      VKID.Config.init({
        app: 53543107,
        redirectUrl: redirectUrl,
        scope: 'email',
        state: state,
        codeChallenge: codeChallenge,
      });

      // Создаем список методов авторизации
      const oAuth = new VKID.OAuthList();
      console.log('Создание списка методов авторизации...');

      // Отрисовываем кнопки авторизации
      oAuth.render({
        container: containerRef.current,
        styles: {
          borderRadius: 23,
        },
        oauthList: [VKID.OAuthName.VK, VKID.OAuthName.OK, VKID.OAuthName.MAIL]
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
        const returnedState = payload.state;

        // Проверяем state
        const savedState = localStorage.getItem('vk_auth_state');
        if (returnedState !== savedState) {
          console.error('Неверный state параметр');
          handleError(new Error('Ошибка безопасности: неверный state параметр'));
          return;
        }

        let apiProvider: 'vk' | 'mailru' | 'ok' | null = null;
        
        switch (provider) {
          case VKID.OAuthName.VK:
            apiProvider = 'vk';
            break;
          case VKID.OAuthName.MAIL:
            apiProvider = 'mailru';
            break;
          case VKID.OAuthName.OK:
            apiProvider = 'ok';
            break;
        }

        if (apiProvider) {
          authApi.socialAuth[apiProvider](code, deviceId)
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
    initVKID();
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