import React, { useState, useCallback } from 'react';
import { Box, Dialog, DialogActions, DialogContent, Button, Typography, Slider } from '@mui/material';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface ImageCropperProps {
  open: boolean;
  image: string;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
}

// Функция для создания изображения из canvas
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Функция для получения кадрированной области
const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Устанавливаем размеры холста (canvas) под размер кадрирования
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Рисуем кадрированную часть изображения на холсте
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Преобразуем canvas в Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Canvas is empty');
      }
    }, 'image/jpeg', 0.95); // Качество 95%
  });
};

const ImageCropper: React.FC<ImageCropperProps> = ({ open, image, onClose, onSave }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = useCallback(async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        onSave(croppedImage);
      }
    } catch (e) {
      console.error('Ошибка при кадрировании изображения:', e);
    }
  }, [croppedAreaPixels, image, onSave]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: 400, position: 'relative' }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          cropShape="round"
          showGrid={false}
        />
      </DialogContent>
      
      <Box sx={{ px: 3, pt: 2, pb: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          Масштаб
        </Typography>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="zoom-slider"
          onChange={(_, value) => setZoom(value as number)}
          sx={{
            color: '#1976d5',
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              '&:hover, &.Mui-active': {
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)'
              }
            }
          }}
        />
      </Box>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: '58px',
            textTransform: 'none',
            px: 3
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          sx={{ 
            bgcolor: '#1976d5',
            borderRadius: '58px',
            textTransform: 'none',
            px: 3
          }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropper; 