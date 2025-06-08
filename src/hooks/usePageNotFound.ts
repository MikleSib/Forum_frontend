import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageNotFoundOptions {
  title?: string;
  logToAnalytics?: boolean;
  customMessage?: string;
}

export const usePageNotFound = (options: UsePageNotFoundOptions = {}) => {
  const location = useLocation();
  const {
    title = '404 — Страница не найдена',
    logToAnalytics = true,
    customMessage
  } = options;

  useEffect(() => {
    // Устанавливаем статус код 404
    const metaStatus = document.createElement('meta');
    metaStatus.setAttribute('http-equiv', 'status');
    metaStatus.setAttribute('content', '404');
    metaStatus.id = 'meta-status-404';
    document.head.appendChild(metaStatus);

    // Мета-тег для роботов
    const metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    metaRobots.setAttribute('content', 'noindex, nofollow');
    metaRobots.id = 'meta-robots-404';
    document.head.appendChild(metaRobots);

    // Устанавливаем заголовок
    const originalTitle = document.title;
    document.title = title;

    // Логирование для аналитики
    if (logToAnalytics) {
      console.warn(`404 Error: ${customMessage || 'Page not found'} - ${location.pathname}`);
      
      // Отправка в аналитические системы
      if (typeof window !== 'undefined') {
        // Google Analytics 4
        if (window.gtag) {
          window.gtag('event', 'page_not_found', {
            page_path: location.pathname,
            page_title: title,
            custom_message: customMessage
          });
        }

        // Яндекс.Метрика
        if (window.ym && window.yaCounterId) {
          window.ym(window.yaCounterId, 'reachGoal', 'PAGE_NOT_FOUND', {
            page: location.pathname,
            message: customMessage
          });
        }
      }
    }

    // Очистка при размонтировании
    return () => {
      const statusMeta = document.getElementById('meta-status-404');
      const robotsMeta = document.getElementById('meta-robots-404');
      
      if (statusMeta) document.head.removeChild(statusMeta);
      if (robotsMeta) document.head.removeChild(robotsMeta);
      
      document.title = originalTitle;
    };
  }, [location.pathname, title, logToAnalytics, customMessage]);

  return {
    pathname: location.pathname,
    search: location.search
  };
};

// Декларация типов для аналитических сервисов
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (counterId: number, method: string, goal?: string, params?: any) => void;
    yaCounterId?: number;
  }
} 