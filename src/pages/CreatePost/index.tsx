import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, TextField, Button, Grid, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import styles from './CreatePost.module.css';
import { CreatePostRequest } from '../../shared/types/post.types';
import { createPost } from '../../services/api';
import TipTapEditor from './TipTapEditor';
import { compressMultipleImages } from '../../utils/imageCompressor';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Обработка загрузки изображений
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      
      // Проверка на максимальное количество
      if (images.length + selectedFiles.length > 20) {
        setError('Максимальное количество изображений - 20');
        return;
      }
      
      setIsCompressing(true);
      
      try {
        // Сжимаем изображения перед добавлением (на 33%)
        const compressedFiles = await compressMultipleImages(selectedFiles, 0.67);
        
        // Добавляем новые файлы
        setImages(prevImages => [...prevImages, ...compressedFiles]);
        
        // Создаем превью URL для отображения
        const newPreviewUrls = compressedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
        
        // Сбрасываем ошибку, если она была
        setError('');
      } catch (err) {
        console.error('Ошибка при сжатии изображений:', err);
        setError('Не удалось обработать изображения');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Удаление изображения из предпросмотра
  const handleRemoveImage = (index: number) => {
    // Удаляем изображение из списка файлов
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    
    // Удаляем URL превью из списка URL
    const updatedPreviews = [...previewUrls];
    
    // Освобождаем URL объекта перед удалением из списка
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
  };

  // Обработка перетаскивания файлов (drag and drop)
  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      // Проверка на максимальное количество
      if (images.length + droppedFiles.length > 20) {
        setError('Максимальное количество изображений - 20');
        return;
      }
      
      setIsCompressing(true);
      
      try {
        // Сжимаем изображения перед добавлением (на 33%)
        const compressedFiles = await compressMultipleImages(droppedFiles, 0.67);
        
        // Добавляем новые файлы
        setImages(prevImages => [...prevImages, ...compressedFiles]);
        
        // Создаем превью URL для отображения
        const newPreviewUrls = compressedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
        
        // Сбрасываем ошибку, если она была
        setError('');
      } catch (err) {
        console.error('Ошибка при сжатии изображений:', err);
        setError('Не удалось обработать изображения');
      } finally {
        setIsCompressing(false);
      }
    }
  }, [images]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Отправка формы
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Валидация формы
    if (!title.trim()) {
      setError('Пожалуйста, укажите заголовок');
      return;
    }
    
    if (!content.trim()) {
      setError('Пожалуйста, добавьте содержание');
      return;
    }
    
    setIsSubmitting(true);
    
    // Формируем данные для отправки
    const postData: CreatePostRequest = {
      title: title.trim(),
      content,
      images
    };
    
    try {
      const response = await createPost(postData);
      
      // Очищаем ресурсы превью URL перед перенаправлением
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Показываем сообщение об успехе
      setSuccessMessage('Пост успешно создан!');
      setShowSuccess(true);
      
      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Ошибка при создании поста:', error);
      setError(error.message || 'Произошла ошибка при создании поста');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Очистка URL объектов при размонтировании компонента
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <Container maxWidth="lg" className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Typography variant="h4" className={styles.title}>
            Создание нового поста
          </Typography>
          <Typography variant="subtitle1" className={styles.subtitle}>
            Поделитесь своим опытом или задайте вопрос сообществу
          </Typography>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid size={12}>
            <div className={styles.formContainer}>
              <Typography variant="h5" className={styles.formTitle}>
                Информация о посте
              </Typography>

              {/* Заголовок поста */}
              <TextField
                label="Заголовок"
                variant="outlined"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.textField}
                placeholder="Введите заголовок поста"
              />

              {/* Редактор контента */}
              <Typography variant="subtitle1" className={styles.imageUploadTitle}>
                Текст поста
              </Typography>
              <div className={styles.editorContainer}>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                />
              </div>

              {/* Загрузка изображений */}
              <div className={styles.imageUploadSection}>
                <Typography variant="subtitle1" className={styles.imageUploadTitle}>
                  Изображения ({images.length}/20)
                </Typography>
                
                <div 
                  className={styles.dropzone}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {isCompressing ? (
                    <div className={styles.compressingContainer}>
                      <CircularProgress size={40} color="primary" />
                      <Typography variant="body2" sx={{ mt: 1.5 }}>
                        Сжатие изображений...
                      </Typography>
                    </div>
                  ) : (
                    <>
                      <InsertPhotoIcon className={styles.dropzoneIcon} />
                      <Typography variant="body1" className={styles.dropzoneText}>
                        Перетащите изображения сюда или нажмите для выбора
                      </Typography>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        startIcon={<CloudUploadIcon />}
                        disabled={images.length >= 20 || isCompressing}
                      >
                        Выбрать изображения
                      </Button>
                    </>
                  )}
                </div>
                
                {error && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
                
                <Typography variant="body2" className={styles.warningText}>
                  Максимальное количество изображений: 20. Все изображения будут автоматически сжаты на 33%.
                </Typography>

                {/* Предпросмотр изображений */}
                {previewUrls.length > 0 && (
                  <div className={styles.imagePreviewContainer}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className={styles.imagePreviewWrapper}>
                        <img
                          src={url}
                          alt={`превью ${index + 1}`}
                          className={styles.imagePreview}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          className={styles.imageDeleteButton}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className={styles.buttonContainer}>
                <Button 
                  variant="contained" 
                  color="inherit"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                  className={styles.cancelButton}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  disabled={isSubmitting || isCompressing}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Создание...' : 'Опубликовать'}
                </Button>
              </div>
            </div>
          </Grid>
        </Grid>
      </form>

      {/* Уведомление об успешном создании поста */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreatePost; 