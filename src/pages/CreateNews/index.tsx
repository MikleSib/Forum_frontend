import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FishingIcon from '@mui/icons-material/Phishing';
import PlaceIcon from '@mui/icons-material/Place';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { NewsCategory } from '../../shared/types/news.types';
import { adminApi } from '../../services/api';
import { userStore } from '../../shared/store/userStore';
import API_URL from '../../config/api';
import { refreshToken } from '../../services/auth';
import { SEO } from '../../components/SEO/SEO';
import { seoConfig } from '../../config/seo.config';

interface NewsContent {
  type: 'text' | 'image' | 'video';
  content: string;
  order: number;
  imageType?: 'url' | 'file';
  file?: File;
  uploadInfo?: {
    filename: string;
    size: number;
    contentType: string;
  };
}

interface EventDetails {
  discipline: string;
  place: string;
  date: string;
}

const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.NEWS);
  const [contents, setContents] = useState<NewsContent[]>([
    { type: 'text', content: '', order: 0 }
  ]);
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    discipline: '',
    place: '',
    date: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Проверяем права администратора
    if (!userStore.isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  const handleAddContent = () => {
    setContents([
      ...contents,
      { type: 'text', content: '', order: contents.length }
    ]);
  };

  const handleRemoveContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const handleContentChange = (index: number, field: keyof NewsContent, value: any) => {
    const newContents = [...contents];
    if (field === 'type' && value === 'image') {
      newContents[index] = {
        ...newContents[index],
        type: value,
        imageType: 'url',
        content: ''
      };
    } else {
      newContents[index] = {
        ...newContents[index],
        [field]: value
      };
    }
    setContents(newContents);
  };

  const handleEventDetailsChange = (field: keyof EventDetails, value: string) => {
    setEventDetails({
      ...eventDetails,
      [field]: value
    });
  };

  const handleFileChange = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла');
      }

      const data = await response.json();
      const newContents = [...contents];
      newContents[index] = {
        ...newContents[index],
        content: `${API_URL}/${data.url}`,
        file: file,
        uploadInfo: {
          filename: data.filename,
          size: data.size,
          contentType: data.content_type
        }
      };
      setContents(newContents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
    }
  };

  const prepareNewsContents = () => {
    // Если категория "События", добавляем детали события в начало текстового содержимого
    if (category === NewsCategory.EVENTS) {
      const textContentIndex = contents.findIndex(content => content.type === 'text');
      
      if (textContentIndex !== -1) {
        const eventFormatting = `
Место: ${eventDetails.place}
Дата: ${eventDetails.date}
Дисциплина: ${eventDetails.discipline}

`;
        
        const newContents = [...contents];
        newContents[textContentIndex] = {
          ...newContents[textContentIndex],
          content: eventFormatting + newContents[textContentIndex].content
        };
        
        return newContents.map((content, index) => ({
          type: content.type,
          content: content.content,
          order: index
        }));
      }
    }
    
    // Для других категорий возвращаем контент как есть
    return contents.map((content, index) => ({
      type: content.type,
      content: content.content,
      order: index
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Проверка обязательных полей для категории "События"
    if (category === NewsCategory.EVENTS) {
      if (!eventDetails.discipline || !eventDetails.place || !eventDetails.date) {
        setError('Для события необходимо заполнить все поля: дисциплина, место и дата');
        return;
      }
    }

    try {
      await createNewsWithRetry();
      setSuccess(true);
      navigate('/news');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании новости');
    }
  };
  
  // Функция для создания новости с обработкой 403 ошибки и повторной попыткой
  const createNewsWithRetry = async (isRetry = false): Promise<void> => {
    try {
      await adminApi.createNews({
        title,
        category,
        contents: prepareNewsContents()
      });
    } catch (err: any) {
      // Проверяем ошибку 403 и сообщение "Only administrators can create news"
      if (
        err.response && 
        err.response.status === 403 && 
        err.response.data?.detail === "Only administrators can create news" && 
        !isRetry
      ) {
        console.log('Получена ошибка 403, обновляем токен и повторяем запрос...');
        
        try {
          // Обновляем токен
          const tokens = await refreshToken();
          
          if (tokens && tokens.access_token) {
            // Обновляем токены в userStore
            userStore.setAuth({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              user: userStore.user!
            });
            
            // Если обновление токена успешно, повторяем запрос
            return createNewsWithRetry(true);
          } else {
            throw new Error('Не удалось обновить токен. Пожалуйста, войдите в систему заново.');
          }
        } catch (refreshError) {
          console.error('Ошибка при обновлении токена:', refreshError);
          throw new Error('Не удалось обновить токен. Пожалуйста, войдите в систему заново.');
        }
      }
      
      // Если это не 403 ошибка или уже была повторная попытка, просто пробрасываем ошибку дальше
      throw err;
    }
  };

  const renderContentInput = (content: NewsContent, index: number) => {
    if (content.type === 'image') {
      return (
        <Box sx={{ width: '100%' }}>
          <RadioGroup
            row
            value={content.imageType || 'url'}
            onChange={(e) => handleContentChange(index, 'imageType', e.target.value)}
          >
            <FormControlLabel value="url" control={<Radio />} label="По ссылке" />
            <FormControlLabel value="file" control={<Radio />} label="Загрузить файл" />
          </RadioGroup>
          
          {content.imageType === 'file' ? (
            <Box>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileChange(index, file);
                  }
                }}
                style={{ display: 'none' }}
                id={`image-upload-${index}`}
              />
              <label htmlFor={`image-upload-${index}`}>
                <Button variant="outlined" component="span">
                  Выбрать изображение
                </Button>
              </label>
              {content.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Выбран файл: {content.file.name}
                </Typography>
              )}
            </Box>
          ) : (
            <TextField
              fullWidth
              label="URL изображения"
              value={content.content}
              onChange={(e) => handleContentChange(index, 'content', e.target.value)}
              required
            />
          )}
        </Box>
      );
    }

    return (
      <TextField
        fullWidth
        label={content.type === 'text' ? 'Текст' : 'URL'}
        value={content.content}
        onChange={(e) => handleContentChange(index, 'content', e.target.value)}
        required
        multiline={content.type === 'text'}
        rows={content.type === 'text' ? 3 : 1}
      />
    );
  };

  return (
    <>
      <SEO
        title={seoConfig.createNews.title}
        description={seoConfig.createNews.description}
        keywords={seoConfig.createNews.keywords}
        canonical="https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/news/create"
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Создание новости
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Новость успешно создана! Перенаправление...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              value={category}
              label="Категория"
              onChange={(e) => setCategory(e.target.value as NewsCategory)}
              required
            >
              <MenuItem value={NewsCategory.NEWS}>Новости</MenuItem>
              <MenuItem value={NewsCategory.FISH_SPECIES}>Виды рыб</MenuItem>
              <MenuItem value={NewsCategory.EVENTS}>События</MenuItem>
            </Select>
          </FormControl>
          
          {/* Специальные поля для категории События */}
          <Collapse in={category === NewsCategory.EVENTS}>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Детали события
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PlaceIcon color="primary" sx={{ mr: 1 }} />
                <TextField
                  fullWidth
                  label="Место проведения"
                  placeholder="Например: Водохранилище Орлово"
                  value={eventDetails.place}
                  onChange={(e) => handleEventDetailsChange('place', e.target.value)}
                  required={category === NewsCategory.EVENTS}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <TextField
                  fullWidth
                  label="Дата проведения"
                  placeholder="Например: 2025-05-10"
                  value={eventDetails.date}
                  onChange={(e) => handleEventDetailsChange('date', e.target.value)}
                  required={category === NewsCategory.EVENTS}
                  helperText="Формат: ГГГГ-ММ-ДД или любой удобный формат"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FishingIcon color="primary" sx={{ mr: 1 }} />
                <TextField
                  fullWidth
                  label="Дисциплина"
                  placeholder="Например: Ловля спиннингом"
                  value={eventDetails.discipline}
                  onChange={(e) => handleEventDetailsChange('discipline', e.target.value)}
                  required={category === NewsCategory.EVENTS}
                />
              </Box>
            </Paper>
          </Collapse>

          <Typography variant="h6" gutterBottom>
            Содержимое
          </Typography>

          {contents.map((content, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Тип контента</InputLabel>
                  <Select
                    value={content.type}
                    label="Тип контента"
                    onChange={(e) => handleContentChange(index, 'type', e.target.value)}
                  >
                    <MenuItem value="text">Текст</MenuItem>
                    <MenuItem value="image">Изображение</MenuItem>
                    <MenuItem value="video">Видео</MenuItem>
                  </Select>
                </FormControl>
                {renderContentInput(content, index)}
              </Box>

              <IconButton
                color="error"
                onClick={() => handleRemoveContent(index)}
                disabled={contents.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}

          <Button 
            startIcon={<AddIcon />} 
            onClick={handleAddContent}
            sx={{ mb: 4 }}
          >
            Добавить контент
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/news')}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!title || contents.some(content => !content.content)}
            >
              Опубликовать
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
    </>
  );
};

export default CreateNews; 