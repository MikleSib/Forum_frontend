import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button, TextField, Divider, 
  FormControl, InputLabel, Select, MenuItem, Breadcrumbs,
  IconButton, Alert, Snackbar, CircularProgress, SelectChangeEvent
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AddIcon from '@mui/icons-material/Add';
import { userStore } from '../../shared/store/userStore';
import { forumApi } from '../../services/forumApi';
import { ForumCategory, CreateCategoryRequest } from '../../shared/types/forum.types';

// Популярные эмодзи для иконок категорий
const POPULAR_EMOJIS = [
  '📋', '🔍', '📝', '🔔', '📰', '💬', '📢', '🎮', '🎣', '🎯',
  '🏆', '🛠️', '📚', '🏕️', '🌊', '🎣', '⛵', '🐟', '🌱', '🏂'
];

const CreateCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [parentId, setParentId] = useState<string | null>(categoryId || null);
  const [order, setOrder] = useState<number>(10);
  
  // Состояния для данных и UI
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentCategory, setParentCategory] = useState<ForumCategory | null>(null);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Состояние для валидации
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  
  // Проверяем, является ли пользователь администратором
  useEffect(() => {
    if (!userStore.isAdmin) {
      setError('У вас нет прав для создания категорий форума');
      return;
    }
    
    // Загружаем категории для выбора родительской категории
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await forumApi.getCategories();
        setCategories(data);
        
        // Если указан id родительской категории, загружаем информацию о ней
        if (categoryId) {
          try {
            const parentCategoryData = await forumApi.getCategoryById(parseInt(categoryId));
            setParentCategory(parentCategoryData);
          } catch (err) {
            console.error('Ошибка при загрузке родительской категории:', err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке категорий форума:', err);
        setError('Не удалось загрузить категории форума');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [categoryId]);
  
  // Обработчик изменения родительской категории
  const handleParentChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value;
    setParentId(value === "null" ? null : value);
  };
  
  // Обработчик выбора иконки
  const handleIconSelect = (emoji: string) => {
    setIcon(emoji);
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Название категории обязательно';
    } else if (title.length < 3) {
      newErrors.title = 'Название должно содержать не менее 3 символов';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Описание категории обязательно';
    } else if (description.length < 10) {
      newErrors.description = 'Описание должно содержать не менее 10 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем права администратора
    if (!userStore.isAdmin) {
      setSnackbar({
        open: true,
        message: 'У вас нет прав для создания категорий',
        severity: 'error'
      });
      return;
    }
    
    // Валидируем форму
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Создаем данные для запроса на создание категории
      const categoryData: CreateCategoryRequest = {
        title: title.trim(),
        description: description.trim(),
        icon,
        order,
        parent_id: parentId ? parseInt(parentId) : null
      };
      
      // Отправляем запрос на создание категории
      const createdCategory = await forumApi.createCategory(categoryData);
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Категория успешно создана!',
        severity: 'success'
      });
      
      // Сбрасываем форму
      setTitle('');
      setDescription('');
      setIcon('📋');
      
      // Перенаправляем на страницу форума после создания
      setTimeout(() => {
        navigate(parentId ? `/forum/category/${parentId}` : '/forum');
      }, 1500);
    } catch (error: any) {
      console.error('Ошибка при создании категории:', error);
      
      // Показываем уведомление об ошибке
      setSnackbar({
        open: true,
        message: 'Ошибка при создании категории. Пожалуйста, попробуйте позже.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Показываем сообщение об ошибке доступа
  if (!userStore.isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          У вас нет прав для создания категорий форума. Этот функционал доступен только администраторам.
        </Alert>
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
  
  // Показываем загрузку
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Показываем сообщение об ошибке загрузки
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
          <Typography color="text.primary" fontWeight={500}>
            {parentCategory ? 'Создание подкатегории' : 'Создание категории'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton 
            sx={{ bgcolor: 'action.hover' }} 
            onClick={() => parentCategory 
              ? navigate(`/forum/category/${parentCategory.id}`) 
              : navigate('/forum')
            }
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {parentCategory 
              ? `Создание подкатегории в категории "${parentCategory.title}"` 
              : 'Создание новой категории форума'
            }
          </Typography>
        </Box>
      </Box>

      {/* Форма создания категории */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>
          
          {/* Название категории */}
          <TextField
            label="Название категории"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title || 'Введите название категории'}
            margin="normal"
            required
          />
          
          {/* Описание категории */}
          <TextField
            label="Описание категории"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description || 'Введите описание категории'}
            margin="normal"
            multiline
            rows={3}
            required
          />
          
          {/* Выбор иконки */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Иконка категории
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {POPULAR_EMOJIS.map((emoji) => (
              <IconButton 
                key={emoji}
                onClick={() => handleIconSelect(emoji)}
                sx={{ 
                  fontSize: '1.5rem',
                  bgcolor: icon === emoji ? 'primary.light' : 'background.paper',
                  color: icon === emoji ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: icon === emoji ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: icon === emoji ? 'primary.main' : 'action.hover'
                  }
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Выбранная иконка:
            </Typography>
            <Box sx={{ 
              fontSize: '1.5rem',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.light',
              color: 'white',
              borderRadius: 1
            }}>
              {icon}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Дополнительные настройки
          </Typography>
          
          {/* Выбор родительской категории */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="parent-category-label">Родительская категория</InputLabel>
            <Select
              labelId="parent-category-label"
              value={parentId === null ? "null" : parentId}
              label="Родительская категория"
              onChange={handleParentChange}
            >
              <MenuItem value="null">Нет (создать корневую категорию)</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.icon} {category.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Порядок категории */}
          <TextField
            label="Порядок сортировки"
            type="number"
            fullWidth
            variant="outlined"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 10)}
            margin="normal"
            helperText="Категории с меньшим значением отображаются выше"
            InputProps={{ inputProps: { min: 0 } }}
          />
          
          {/* Кнопки действий */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => parentCategory 
                ? navigate(`/forum/category/${parentCategory.id}`) 
                : navigate('/forum')
              }
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            >
              {isSubmitting ? 'Создание...' : 'Создать категорию'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Уведомление */}
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

export default CreateCategory; 