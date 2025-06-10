import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Alert,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Photo as PhotoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

const CreatePhoto: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_PHOTOS = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleBack = () => {
    navigate('/');
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Поддерживаются только форматы: JPG, PNG, WebP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Размер файла не должен превышать 10MB';
    }
    return null;
  };

  const addPhotos = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newPhotos: PhotoFile[] = [];

    for (const file of fileArray) {
      if (photos.length + newPhotos.length >= MAX_PHOTOS) {
        setError(`Можно загрузить максимум ${MAX_PHOTOS} фотографий`);
        break;
      }

      const validation = validateFile(file);
      if (validation) {
        setError(validation);
        continue;
      }

      const id = Date.now().toString() + Math.random().toString(36);
      const preview = URL.createObjectURL(file);
      newPhotos.push({ id, file, preview });
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
      setError('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addPhotos(files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      addPhotos(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(photo => photo.id !== id);
      // Освобождаем память
      const photoToRemove = prev.find(photo => photo.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return filtered;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title.trim()) {
      setError('Введите название для фотографий');
      return;
    }

    if (photos.length === 0) {
      setError('Добавьте хотя бы одну фотографию');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Здесь будет отправка на бекенд
      console.log('Отправка фотографий:', {
        title: title.trim(),
        photos: photos.map(p => p.file)
      });

      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Очищаем previews
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      
      navigate('/');
    } catch (err) {
      setError('Ошибка при загрузке фотографий. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Очистка previews при размонтировании
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ 
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Заголовок с кнопкой назад */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Добавить фотографии
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Поле названия */}
            <TextField
              fullWidth
              label="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Удачная рыбалка на озере Байкал"
              margin="normal"
              variant="outlined"
              required
              sx={{ mb: 3 }}
            />

            {/* Загрузка фотографий */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Фотографии ({photos.length}/{MAX_PHOTOS})
            </Typography>

            {/* Область загрузки */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: `2px dashed ${dragOver ? '#1976d2' : '#ccc'}`,
                borderRadius: 2,
                p: 4,
                mb: 3,
                textAlign: 'center',
                backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderColor: '#1976d2'
                }
              }}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {photos.length < MAX_PHOTOS 
                  ? 'Перетащите фотографии сюда или нажмите для выбора'
                  : `Достигнуто максимальное количество фотографий (${MAX_PHOTOS})`
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Поддерживаются форматы: JPG, PNG, WebP. Максимальный размер: 10MB
              </Typography>
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={photos.length >= MAX_PHOTOS}
              />
            </Box>

            {/* Превью загруженных фотографий */}
            {photos.length > 0 && (
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 3
              }}>
                {photos.map((photo) => (
                  <Card key={photo.id} sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={photo.preview}
                      alt="Превью фотографии"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ position: 'absolute', top: 0, right: 0, p: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => removePhoto(photo.id)}
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {/* Ошибки */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Кнопки */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<PhotoIcon />}
                disabled={isSubmitting || photos.length === 0 || !title.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  padding: '10px 20px',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {isSubmitting ? 'Загрузка...' : 'Опубликовать фотографии'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
  );
};

export default CreatePhoto; 