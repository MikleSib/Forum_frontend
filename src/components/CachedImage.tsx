import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import imageCache from '../utils/imageCache';
import { IMAGE_CACHE_OPTIONS } from '../config/api';
import ImageSkeleton from './ImageSkeleton';

// Стандартное изображение при ошибке загрузки
const DEFAULT_ERROR_IMAGE = '/placeholder-error.svg';

// Проверка поддержки Cache API
const isCacheAPISupported = 'caches' in window;

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  baseUrl?: string;
  placeholderSrc?: string;
  errorSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  imageId?: number | string;
  showSkeleton?: boolean;
  skeletonHeight?: number;
}

/**
 * Компонент для отображения изображений с кешированием
 */
const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  baseUrl = '',
  placeholderSrc,
  errorSrc = DEFAULT_ERROR_IMAGE,
  onLoad,
  onError,
  imageId,
  showSkeleton = true,
  skeletonHeight = 200,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const isMounted = useRef(true);
  const prevSrc = useRef<string | null>(null);
  const uniqueRequestId = useRef<string>(Math.random().toString(36).substring(2, 15));

  // Добавляем ключ к URL для предотвращения кеширования браузером
  const getUniqueUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('?')) {
      return `${url}&_uid=${uniqueRequestId.current}&t=${Date.now()}`;
    } else {
      return `${url}?_uid=${uniqueRequestId.current}&t=${Date.now()}`;
    }
  };

  useEffect(() => {
    // Устанавливаем флаг размонтирования
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Если источник не изменился, не загружаем изображение повторно
    if (prevSrc.current === src) {
      return;
    }
    
    prevSrc.current = src;
    
    const loadImage = async () => {
      if (!src) {
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Добавляем уникальный идентификатор изображения в URL, если он есть
        // Внимание: мы не добавляем дополнительные параметры тут, т.к. они приведут к неправильной работе кеша
        const imageUrlWithId = imageId ? `${src}?id=${imageId}` : src;
        
        // Полный URL изображения (с учетом baseUrl, если он указан)
        const fullUrl = baseUrl ? `${baseUrl}${imageUrlWithId}` : imageUrlWithId;
        
        console.log(`%c[CachedImage] Загрузка изображения: ${fullUrl}, ID: ${imageId}`, 'background: #795548; color: white; padding: 2px 5px; border-radius: 2px;');
        
        // Получаем изображение из кеша с помощью нашего imageCache сервиса
        // Он уже содержит логику работы с Cache Storage, IndexedDB и т.д.
        const cachedSrc = await imageCache.getImage(imageUrlWithId, baseUrl);
        
        if (isMounted.current) {
          setImageSrc(cachedSrc);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Ошибка при загрузке изображения:', error);
          setIsLoading(false);
          setHasError(true);
          
          if (errorSrc) {
            setImageSrc(errorSrc);
          }
          
          if (onError) {
            onError();
          }
        }
      }
    };
    
    loadImage();
  }, [src, baseUrl, errorSrc, onError, imageId]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    console.error(`[CachedImage] Ошибка загрузки изображения: ${imageSrc}`);
    
    if (errorSrc) {
      setImageSrc(errorSrc);
    }
    
    if (onError) {
      onError();
    }
  };

  // Если показываем skeleton во время загрузки
  if (isLoading && showSkeleton && !hasError) {
    return (
      <ImageSkeleton 
        width="100%" 
        height={skeletonHeight} 
        borderRadius={props.style?.borderRadius || 1}
      />
    );
  }

  // Если нет источника изображения и нет плейсхолдера
  if (!imageSrc && !placeholderSrc) {
    return showSkeleton ? (
      <ImageSkeleton 
        width="100%" 
        height={skeletonHeight} 
        borderRadius={props.style?.borderRadius || 1}
      />
    ) : null;
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          ...props.style,
        }}
        {...props}
      />
      {isLoading && imageSrc && showSkeleton && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ImageSkeleton 
            width="100%" 
            height="100%" 
            borderRadius={props.style?.borderRadius || 1}
          />
        </Box>
      )}
    </Box>
  );
};

export default CachedImage; 