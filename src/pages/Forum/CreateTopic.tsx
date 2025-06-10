import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button, 
  TextField, Breadcrumbs, IconButton, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent,
  Chip, OutlinedInput, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { forumApi } from '../../services/forumApi';
import { ForumCategory } from '../../shared/types/forum.types';

// Декларация типа для window._tmr
declare global {
  interface Window {
    _tmr?: any[];
  }
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateTopic: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ForumCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<ForumCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string, content?: string, category?: string, tags?: string}>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Загружаем категории при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Получаем список всех категорий
        const categoriesData = await forumApi.getCategories();
        setCategories(categoriesData);
        
        // Если указан id категории, загружаем информацию о ней
        if (categoryId) {
          const categoryData = await forumApi.getCategoryById(parseInt(categoryId));
          setCurrentCategory(categoryData);
          setSelectedCategory(categoryId);
          
          // Если есть родительская категория, загружаем информацию о ней
          if (categoryData.parent_id) {
            try {
              const parentCategory = await forumApi.getCategoryById(categoryData.parent_id);
              setParentCategory(parentCategory);
            } catch (err) {
              console.error('Ошибка при загрузке родительской категории:', err);
            }
          }
        }
        
        setFetchError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setFetchError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag) && tags.length < 5) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const validateForm = () => {
    const newErrors: {title?: string, content?: string, category?: string, tags?: string} = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Название темы обязательно';
      isValid = false;
    } else if (title.length < 5) {
      newErrors.title = 'Название темы должно содержать не менее 5 символов';
      isValid = false;
    } else if (title.length > 255) {
      newErrors.title = 'Название темы не должно превышать 255 символов';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Содержание сообщения обязательно';
      isValid = false;
    } else if (content.length < 10) {
      newErrors.content = 'Сообщение должно содержать не менее 10 символов';
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.category = 'Выберите категорию';
      isValid = false;
    }

    if (tags.length > 5) {
      newErrors.tags = 'Максимальное количество тегов: 5';
      isValid = false;
    }

    for (const tag of tags) {
      if (tag.length > 20) {
        newErrors.tags = 'Длина тега не должна превышать 20 символов';
        isValid = false;
        break;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Проверяем наличие токена доступа
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Пробуем получить новый токен через refresh
      try {
        const { refreshToken } = await import('../../services/auth');
        const refreshResult = await refreshToken();
        
        if (refreshResult && refreshResult.access_token) {
          localStorage.setItem('access_token', refreshResult.access_token);
          localStorage.setItem('refresh_token', refreshResult.refresh_token);
          
          // Обновляем store
          const { userStore } = await import('../../shared/store/userStore');
          userStore.setAuth({
            access_token: refreshResult.access_token,
            refresh_token: refreshResult.refresh_token,
            user: userStore.user!
          });
          
          setSnackbar({
            open: true,
            message: 'Токен обновлен, пробуем создать тему',
            severity: 'success'
          });
        }
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        setSnackbar({
          open: true,
          message: 'Не удалось обновить токен. Для создания темы необходимо авторизоваться',
          severity: 'error'
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Создаем новую тему через API
      const topicData = {
        title,
        content,
        category_id: parseInt(selectedCategory),
        tags
      };
      
      console.log('Отправляем данные для создания темы:', topicData);
      const createdTopic = await forumApi.createTopic(topicData);
      console.log('Получен ответ:', createdTopic);
      
      setSnackbar({
        open: true,
        message: 'Тема успешно создана!',
        severity: 'success'
      });
      
      // Отправляем метрику после успешного создания топика на форуме
      if (window._tmr) {
        window._tmr.push({ type: 'reachGoal', value: 2, id: 3658346, goal: 'CREATE_TOPIC'});
      }
      
      // После успешного создания перенаправляем на страницу категории
      setTimeout(() => {
        navigate(`/forum/category/${selectedCategory}`);
      }, 1500);
    } catch (error: any) {
      console.error('Ошибка при создании темы:', error);
      
      let errorMessage = 'Ошибка при создании темы. Пожалуйста, попробуйте еще раз.';
      
      // Если получаем ошибку авторизации, показываем сообщение, но не перенаправляем
      if (error?.response?.status === 401 || (error?.response?.data?.detail === 'Invalid token')) {
        errorMessage = 'Ошибка авторизации. Пробуем автоматически обновить токен. Пожалуйста, повторите отправку через несколько секунд.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/forum"
          sx={{ mt: 2 }}
        >
          Вернуться к форуму
        </Button>
      </Container>
    );
  }

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
          {parentCategory && (
            <Link 
              to={`/forum/category/${parentCategory.id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography color="text.primary">{parentCategory.title}</Typography>
            </Link>
          )}
          {currentCategory && (
            <Link 
              to={`/forum/category/${categoryId}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography color="text.primary">{currentCategory.title}</Typography>
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
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span role="img" aria-label={category.title}>
                        {category.icon || '📋'}
                      </span>
                      {category.title}
                    </Box>
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
            helperText={errors.title || 'Минимум 5 символов, максимум 255 символов'}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Теги (необязательно, максимум 5)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Добавить тег"
                variant="outlined"
                size="small"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={tags.length >= 5}
                sx={{ flex: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleTagAdd}
                disabled={!inputTag || tags.length >= 5}
              >
                Добавить
              </Button>
            </Box>
            {errors.tags && (
              <Typography variant="caption" color="error">
                {errors.tags}
              </Typography>
            )}
          </Box>

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
            helperText={errors.content || 'Минимум 10 символов'}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => categoryId ? navigate(`/forum/category/${categoryId}`) : navigate('/forum')}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Создание...' : 'Создать тему'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateTopic; 