import { useEffect, useLayoutEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/logo.svg',
  ogType = 'website',
  canonical,
}: SEOData) => {
  const siteTitle = 'Рыболовный форум';
  const fullTitle = `${title} | ${siteTitle}`;

  // Немедленное обновление DOM
  const updateDOM = () => {
    if (typeof document === 'undefined') return;

    // Обновляем title
    document.title = fullTitle;

    // Функция для обновления или создания мета-тега
    const updateMetaTag = (selector: string, content: string, attribute = 'name', attributeValue?: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attributeValue || selector.match(/\[(.*?)\]/)?.[1]?.split('=')[1]?.replace(/"/g, '') || '');
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Основные мета-теги
    updateMetaTag('meta[name="description"]', description);
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords);
    }

    // Open Graph
    updateMetaTag('meta[property="og:title"]', fullTitle, 'property', 'og:title');
    updateMetaTag('meta[property="og:description"]', description, 'property', 'og:description');
    updateMetaTag('meta[property="og:type"]', ogType, 'property', 'og:type');
    updateMetaTag('meta[property="og:url"]', canonical || window.location.href, 'property', 'og:url');
    updateMetaTag('meta[property="og:image"]', ogImage, 'property', 'og:image');
    updateMetaTag('meta[property="og:site_name"]', siteTitle, 'property', 'og:site_name');

    // Twitter Card
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image', 'name', 'twitter:card');
    updateMetaTag('meta[name="twitter:title"]', fullTitle, 'name', 'twitter:title');
    updateMetaTag('meta[name="twitter:description"]', description, 'name', 'twitter:description');
    updateMetaTag('meta[name="twitter:image"]', ogImage, 'name', 'twitter:image');

    // Canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }
  };

  // Немедленное выполнение
  updateDOM();

  // Синхронное обновление перед отрисовкой
  useLayoutEffect(() => {
    updateDOM();
  }, [title, description, keywords, ogImage, ogType, canonical, fullTitle, siteTitle]);

  // Асинхронное обновление для краулеров
  useEffect(() => {
    updateDOM();
    
    // Множественные попытки обновления для различных краулеров
    const delays = [0, 100, 300, 500, 1000, 2000];
    const timeouts = delays.map(delay => 
      setTimeout(() => {
        document.title = fullTitle;
        const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (descMeta) {
          descMeta.content = description;
        }
        const ogTitleMeta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
        if (ogTitleMeta) {
          ogTitleMeta.content = fullTitle;
        }
        const ogDescMeta = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
        if (ogDescMeta) {
          ogDescMeta.content = description;
        }
      }, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [title, description, fullTitle]);

  // Возвращаем данные для использования в компонентах
  return {
    fullTitle,
    description,
    keywords,
    ogImage,
    ogType,
    canonical: canonical || window.location.href,
    updateDOM
  };
}; 