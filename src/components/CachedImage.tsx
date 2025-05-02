import React, { useState, useEffect } from 'react';
import imageCache from '../utils/imageCache';

// Стандартное изображение при ошибке загрузки
const DEFAULT_ERROR_IMAGE = '/placeholder-error.jpg';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  baseUrl?: string;
  placeholderSrc?: string;
  errorSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
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
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!src) {
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Получаем изображение из кеша или загружаем его
        const cachedSrc = await imageCache.getImage(src, baseUrl);
        
        if (isMounted) {
          setImageSrc(cachedSrc);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
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
    
    return () => {
      isMounted = false;
    };
  }, [src, baseUrl, errorSrc, onError]);

  const handleLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    
    if (errorSrc) {
      setImageSrc(errorSrc);
    }
    
    if (onError) {
      onError();
    }
  };

  // Если нет источника изображения и нет плейсхолдера
  if (!imageSrc && !placeholderSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        ...(isLoading && { filter: 'blur(5px)' }),
        transition: 'filter 0.3s ease-in-out',
      }}
      {...props}
    />
  );
};

export default CachedImage; 