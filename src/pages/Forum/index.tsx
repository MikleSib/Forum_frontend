import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Avatar, Grid, TextField, InputAdornment, Chip,
  Card, CardContent, CardHeader, CardActions,
  CircularProgress, Alert
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { forumApi } from '../../services/forumApi';
import { ForumCategory, ForumTopic } from '../../shared/types/forum.types';
import { userStore } from '../../shared/store/userStore';

// Удаляем моковые данные и заменяем их на состояние для реальных данных
const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedTopics, setBookmarkedTopics] = useState<number[]>([]);
  
  // Состояние для хранения категорий форума
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для активных тем
  const [activeTopics, setActiveTopics] = useState<ForumTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Загружаем категории и активные темы при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Загружаем категории
        const categoriesData = await forumApi.getCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке категорий форума:', err);
        setError('Не удалось загрузить категории форума. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
      
      try {
        setTopicsLoading(true);
        // Загружаем активные темы
        const topicsData = await forumApi.getActiveTopics(5);
        setActiveTopics(topicsData);
        
        // Инициализируем закладки
        const initialBookmarks = localStorage.getItem('bookmarkedTopics');
        if (initialBookmarks) {
          setBookmarkedTopics(JSON.parse(initialBookmarks));
        }
        
        setTopicsError(null);
      } catch (err) {
        console.error('Ошибка при загрузке активных тем форума:', err);
        setTopicsError('Не удалось загрузить активные темы. Пожалуйста, попробуйте позже.');
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Сохраняем закладки в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem('bookmarkedTopics', JSON.stringify(bookmarkedTopics));
  }, [bookmarkedTopics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
    // В реальном приложении здесь будет вызов API для поиска
  };

  const handleCategoryClick = (categoryId: number) => {
    console.log('Переход к категории:', categoryId);
    navigate(`/forum/category/${categoryId}`);
  };

  const handleTopicClick = (topicId: number) => {
    console.log('Переход к теме:', topicId);
    navigate(`/forum/topic/${topicId}`);
  };

  const handleCreateTopic = () => {
    console.log('Создание новой темы');
    navigate('/forum/create-topic');
  };
  
  const handleCreateCategory = () => {
    console.log('Создание новой категории');
    navigate('/forum/create-category');
  };

  const toggleBookmark = (topicId: number) => {
    setBookmarkedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId]
    );
  };
  
  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'только что';
    } else if (diffMins < 60) {
      return `${diffMins} ${getMinutesWord(diffMins)} назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ${getHoursWord(diffHours)} назад`;
    } else if (diffDays < 7) {
      return `${diffDays} ${getDaysWord(diffDays)} назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };
  
  // Вспомогательные функции для склонения слов
  const getMinutesWord = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return 'минуту';
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'минуты';
    return 'минут';
  };
  
  const getHoursWord = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'часа';
    return 'часов';
  };
  
  const getDaysWord = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'дня';
    return 'дней';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и поиск */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Форум рыболовов
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Общайтесь, делитесь опытом и задавайте вопросы другим рыбакам
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск по форуму..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTopic}
            >
              Новая тема
            </Button>
            
            {userStore.isAdmin && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCategory}
              >
                Создать категорию
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Категории форума */}
      <Paper elevation={0} 
        sx={{ 
          mb: 4, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            fontWeight: 600
          }}
        >
          Категории форума
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <Box>
            {categories.map((category: ForumCategory, index: number) => (
              <React.Fragment key={category.id}>
                <Box
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24
                    }}
                  >
                    {category.icon || '📋'}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Тем: {category.topics_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Сообщений: {category.messages_count}
                    </Typography>
                  </Box>
                </Box>
                {index < categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            {categories.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Категории форума не найдены
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Активные темы */}
      <Paper elevation={0} 
        sx={{ 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            fontWeight: 600
          }}
        >
          Активные темы
        </Typography>
        
        {topicsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : topicsError ? (
          <Alert severity="error" sx={{ m: 2 }}>{topicsError}</Alert>
        ) : (
          <Box>
            {activeTopics.length > 0 ? (
              activeTopics.map((topic, index) => (
                <React.Fragment key={topic.id}>
                  <Box
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2
                    }}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <Avatar 
                      src={topic.last_post_author_avatar || topic.author_avatar} 
                      sx={{ width: 40, height: 40 }}
                    >
                      {!topic.last_post_author_avatar && !topic.author_avatar && ((topic.last_post_author_username || topic.author_username)?.[0] || '?')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" color="primary">
                          {topic.category_title || `Категория ${topic.category_id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {topic.last_post_author_username || topic.author_username || `Пользователь ${topic.last_post_author_id || topic.author_id}`}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {topic.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.posts_count - 1 >= 0 ? topic.posts_count - 1 : 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.views_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.last_post_date ? formatDate(topic.last_post_date) : formatDate(topic.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{ 
                        cursor: 'pointer',
                        display: { xs: 'none', md: 'block' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(topic.id);
                      }}
                    >
                      {bookmarkedTopics.includes(topic.id) ? (
                        <BookmarkIcon color="primary" />
                      ) : (
                        <BookmarkBorderIcon color="action" />
                      )}
                    </Box>
                  </Box>
                  {index < activeTopics.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Активных тем пока нет
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForumPage; 