import React, { useState } from 'react';
import { Box, Dialog, DialogContent, IconButton, MobileStepper, useMediaQuery, useTheme } from '@mui/material';
import { Close, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { PostImage } from '../shared/types/post.types';

interface ImageGalleryProps {
  images: PostImage[];
  baseUrl?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, baseUrl = 'https://рыбный-форум.рф' }) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxSteps = images.length;

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

  // Устанавливаем разные размеры для изображений в зависимости от их количества
  const getItemStyle = (index: number) => {
    const count = images.length;
    
    if (count === 1) {
      return { gridColumn: '1 / -1', gridRow: '1 / -1', height: '500px' };
    } else if (count === 2) {
      return { height: '400px' };
    } else if (count === 3) {
      if (index === 0) {
        return { gridColumn: '1 / -1', height: '400px' };
      }
      return { height: '200px' };
    } else if (count === 4) {
      return { height: '200px' };
    } else {
      return { height: '160px' };
    }
  };

  // Отображаем не более 20 изображений и добавляем кнопку "еще" если их больше
  const visibleImages = images.slice(0, 20);
  const remainingCount = images.length - 20;

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
            <img
              src={`${baseUrl}${image.image_url}`}
              alt={`Изображение ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
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
          <img
            src={`${baseUrl}${images[activeStep].image_url}`}
            alt={`Изображение ${activeStep + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 96px)',
              objectFit: 'contain',
            }}
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