import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button, 
  TextField, Breadcrumbs, IconButton, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { forumCategories } from './index';

const CreateTopic: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string, content?: string, category?: string}>({});

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const validateForm = () => {
    const newErrors: {title?: string, content?: string, category?: string} = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Название темы обязательно';
      isValid = false;
    } else if (title.length < 5) {
      newErrors.title = 'Название темы должно содержать не менее 5 символов';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Содержание сообщения обязательно';
      isValid = false;
    } else if (content.length < 20) {
      newErrors.content = 'Сообщение должно содержать не менее 20 символов';
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.category = 'Выберите категорию';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // В реальном приложении здесь был бы API-запрос для создания новой темы
    // Имитируем задержку запроса
    setTimeout(() => {
      console.log('Создана новая тема:', {
        title,
        content,
        categoryId: selectedCategory
      });
      
      setIsSubmitting(false);
      // После успешного создания перенаправляем на страницу категории
      navigate(`/forum/category/${selectedCategory}`);
    }, 1000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Хлебные крошки и заголовок */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Главная</Typography>
          </Link>
          <Link to="/forum" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Форум</Typography>
          </Link>
          {categoryId && (
            <Link to={`/forum/category/${categoryId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography color="text.primary">
                {forumCategories.find((c: { id: number }) => c.id === parseInt(categoryId))?.title || 'Категория'}
              </Typography>
            </Link>
          )}
          <Typography color="text.primary" fontWeight={500}>Создание темы</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton 
            sx={{ bgcolor: 'action.hover' }} 
            onClick={() => categoryId ? navigate(`/forum/category/${categoryId}`) : navigate('/forum')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Создание новой темы
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {!categoryId && (
            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.category}>
              <InputLabel id="category-select-label">Категория</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Категория"
                onChange={handleCategoryChange}
              >
                {forumCategories.map((category: { id: number, title: string }) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Название темы"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Сообщение"
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={8}
            error={!!errors.content}
            helperText={errors.content}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => categoryId ? navigate(`/forum/category/${categoryId}`) : navigate('/forum')}
            >
              Отмена
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать тему'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTopic; 