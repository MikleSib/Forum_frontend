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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewsCategory } from '../../shared/types/news.types';
import { adminApi } from '../../services/api';
import { userStore } from '../../shared/store/userStore';
import API_URL from '../../config/api';

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

const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.NEWS);
  const [contents, setContents] = useState<NewsContent[]>([
    { type: 'text', content: '', order: 0 }
  ]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await adminApi.createNews({
        title,
        category,
        contents: contents.map((content, index) => ({
          type: content.type,
          content: content.content,
          order: index
        }))
      });
      
      setSuccess(true);
      navigate('/news');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании новости');
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
              <MenuItem value={NewsCategory.GUIDES}>Гайды</MenuItem>
              <MenuItem value={NewsCategory.FISH_SPECIES}>Виды рыб</MenuItem>
              <MenuItem value={NewsCategory.EVENTS}>События</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom>
            Содержимое
          </Typography>

          <Stack spacing={3} sx={{ mb: 4 }}>
            {contents.map((content, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <FormControl sx={{ width: 150 }}>
                  <InputLabel>Тип контента</InputLabel>
                  <Select
                    value={content.type}
                    label="Тип контента"
                    onChange={(e) => {
                      const newType = e.target.value as 'text' | 'image' | 'video';
                      handleContentChange(index, 'type', newType);
                    }}
                    required
                  >
                    <MenuItem value="text">Текст</MenuItem>
                    <MenuItem value="image">Изображение</MenuItem>
                    <MenuItem value="video">Видео</MenuItem>
                  </Select>
                </FormControl>

                {renderContentInput(content, index)}

                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveContent(index)}
                  disabled={contents.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddContent}
            sx={{ mb: 4 }}
          >
            Добавить контент
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
            >
              Создать новость
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/news')}
              size="large"
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateNews; 