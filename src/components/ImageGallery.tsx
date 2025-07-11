import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogContent, IconButton, MobileStepper, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { Close, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { PostImage } from '../shared/types/post.types';
import CachedImage from './CachedImage';
import imageCache from '../utils/imageCache';
import { IMAGE_BASE_URL } from '../config/api';

interface ImageGalleryProps {
  images: PostImage[];
  baseUrl?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, baseUrl = IMAGE_BASE_URL }) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxSteps = images.length;

  // Предварительная загрузка изображений при монтировании компонента
  useEffect(() => {
    if (images && images.length > 0) {
      const imageUrls = images.map(img => img.image_url);
      // Предзагружаем изображения в кеш
      imageCache.preloadImages(imageUrls, baseUrl);
      
      // Устанавливаем флаг загрузки через небольшую задержку
      // чтобы дать возможность начать загрузку изображений
      const timer = setTimeout(() => {
        setIsImagesLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [images, baseUrl]);

  const handleOpen = (index: number) => {
    setActiveStep(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  // Определяем размер сетки в зависимости от количества изображений
  const getGridTemplate = () => {
    const count = images.length;
    
    if (count === 1) {
      return '1fr';
    } else if (count === 2) {
      return '1fr 1fr';
    } else if (count === 3) {
      return 'repeat(2, 1fr)';
    } else if (count === 4) {
      return 'repeat(2, 1fr)';
    } else if (count <= 6) {
      return 'repeat(3, 1fr)';
    } else {
      return 'repeat(4, 1fr)';
    }
  };

  // Устанавливаем адаптивные размеры для контейнеров изображений
  const getItemStyle = (index: number) => {
    const count = images.length;
    
    if (count === 1) {
      return { gridColumn: '1 / -1', gridRow: '1 / -1', height: 'auto', maxHeight: '500px', minHeight: '200px' };
    } else if (count === 2) {
      return { height: 'auto', maxHeight: '400px', minHeight: '200px' };
    } else if (count === 3) {
      if (index === 0) {
        return { gridColumn: '1 / -1', height: 'auto', maxHeight: '400px', minHeight: '200px' };
      }
      return { height: 'auto', maxHeight: '200px', minHeight: '150px' };
    } else if (count === 4) {
      return { height: 'auto', maxHeight: '200px', minHeight: '150px' };
    } else {
      return { height: 'auto', maxHeight: '160px', minHeight: '120px' };
    }
  };

  // Отображаем не более 20 изображений и добавляем кнопку "еще" если их больше
  const visibleImages = images.slice(0, 20);
  const remainingCount = images.length - 20;

  // Если изображения еще не загружены, показываем анимацию загрузки
  if (!isImagesLoaded && images.length > 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginY: 3,
          height: '200px',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: getGridTemplate(),
          gap: '8px',
          marginY: 3,
          borderRadius: '12px',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {visibleImages.map((image, index) => (
          <Box
            key={image.id}
            onClick={() => handleOpen(index)}
            sx={{
              ...getItemStyle(index),
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              '&:hover': {
                transform: 'scale(1.02)',
              },
              '&:hover::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
              ...(index === 19 && remainingCount > 0
                ? {
                    '&::after': {
                      content: `"+${remainingCount}"`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                    },
                  }
                : {}),
            }}
          >
            <CachedImage
              src={image.image_url}
              baseUrl={baseUrl}
              alt={`Изображение ${index + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
              showSkeleton={true}
              skeletonHeight={150}
              placeholderSrc="/placeholder-image.svg"
              imageId={image.id}
            />
          </Box>
        ))}
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            boxShadow: 'none',
          },
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            zIndex: 1,
          }}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
        
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <CachedImage
            src={images[activeStep].image_url}
            baseUrl={baseUrl}
            alt={`Изображение ${activeStep + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 96px)',
              objectFit: 'contain',
            }}
            showSkeleton={true}
            skeletonHeight={400}
            imageId={images[activeStep].id}
          />
        </DialogContent>
        
        <MobileStepper
          steps={maxSteps}
          position="bottom"
          activeStep={activeStep}
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            '.MuiMobileStepper-dot': {
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
            },
            '.MuiMobileStepper-dotActive': {
              backgroundColor: 'white',
            },
          }}
          nextButton={
            <IconButton
              onClick={handleNext}
              sx={{ color: 'white' }}
              disabled={images.length <= 1}
            >
              <KeyboardArrowRight />
            </IconButton>
          }
          backButton={
            <IconButton
              onClick={handleBack}
              sx={{ color: 'white' }}
              disabled={images.length <= 1}
            >
              <KeyboardArrowLeft />
            </IconButton>
          }
        />
      </Dialog>
    </>
  );
};

export default ImageGallery; 