import React, { useEffect, useLayoutEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage = 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/logo.svg',
  ogType = 'website',
  canonical,
}) => {
  const siteTitle = 'Рыболовный форум';
  const fullTitle = `${title} | ${siteTitle}`;

  // Функция для принудительного обновления мета-тега
  const updateMetaTag = (selector: string, content: string, property?: string) => {
    let meta = document.querySelector(selector) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute(property.includes(':') ? 'property' : 'name', property);
      }
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  // Немедленное обновление для лучшей поддержки краулеров
  if (typeof document !== 'undefined') {
    document.title = fullTitle;
    
    // Синхронно обновляем критические мета-теги
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      (descMeta as HTMLMetaElement).content = description;
    }
    
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      (ogTitleMeta as HTMLMetaElement).content = fullTitle;
    }
    
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      (ogDescMeta as HTMLMetaElement).content = description;
    }
  }

  // useLayoutEffect для синхронного выполнения перед отрисовкой
  useLayoutEffect(() => {
    // Принудительно обновляем title
    document.title = fullTitle;

    // Обновляем основные мета-теги
    updateMetaTag('meta[name="description"]', description, 'description');
    
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords, 'keywords');
    }

    // Open Graph теги
    updateMetaTag('meta[property="og:title"]', fullTitle, 'og:title');
    updateMetaTag('meta[property="og:description"]', description, 'og:description');
    updateMetaTag('meta[property="og:type"]', ogType, 'og:type');
    updateMetaTag('meta[property="og:url"]', canonical || window.location.href, 'og:url');
    updateMetaTag('meta[property="og:image"]', ogImage, 'og:image');
    updateMetaTag('meta[property="og:site_name"]', siteTitle, 'og:site_name');

    // Twitter Card теги
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image', 'twitter:card');
    updateMetaTag('meta[name="twitter:title"]', fullTitle, 'twitter:title');
    updateMetaTag('meta[name="twitter:description"]', description, 'twitter:description');
    updateMetaTag('meta[name="twitter:image"]', ogImage, 'twitter:image');

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

  }, [title, description, keywords, ogImage, ogType, canonical, fullTitle, siteTitle]);

  // Дополнительное обновление через useEffect
  useEffect(() => {
    document.title = fullTitle;
    updateMetaTag('meta[name="description"]', description, 'description');
    updateMetaTag('meta[property="og:title"]', fullTitle, 'og:title');
    updateMetaTag('meta[property="og:description"]', description, 'og:description');
    
    // Для краулеров: дополнительные попытки обновления
    const timeouts = [0, 100, 500, 1000];
    timeouts.forEach(delay => {
      setTimeout(() => {
        document.title = fullTitle;
        const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (descMeta) {
          descMeta.content = description;
        }
      }, delay);
    });
  }, [title, description, fullTitle]);

  // Возвращаем скрытые мета-теги для лучшей поддержки SSR и краулеров
  return (
    <>
      <span style={{ display: 'none' }} data-react-helmet="true">
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical || (typeof window !== 'undefined' ? window.location.href : '')} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {canonical && <link rel="canonical" href={canonical} />}
      </span>
    </>
  );
}; 