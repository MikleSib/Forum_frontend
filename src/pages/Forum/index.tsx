import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Avatar, Grid, TextField, InputAdornment, Chip,
  Card, CardContent, CardHeader, CardActions,
  CircularProgress, Alert, useTheme, useMediaQuery, IconButton
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
import { formatRelativeDate } from '../../utils/dateUtils';
import YandexAds from '../../components/YandexAds';
import { SEO } from '../../components/SEO/SEO';
import { SchemaMarkup } from '../../components/SEO/SchemaMarkup';
import { seoConfig } from '../../config/seo.config';

// Удаляем моковые данные и заменяем их на состояние для реальных данных
const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Функция для получения названия категории по ID
  const getCategoryTitle = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : `Категория ${categoryId}`;
  };

  // Функция для генерации цветного градиента для аватара
  const generateGradientColor = (userId: number, username: string) => {
    // Используем комбинацию ID и имени для создания уникального хеша
    const hash = userId.toString() + (username || 'user');
    let hashValue = 0;
    
    // Простая хеш-функция для преобразования строки в число
    for (let i = 0; i < hash.length; i++) {
      hashValue = ((hashValue << 5) - hashValue) + hash.charCodeAt(i);
      hashValue = hashValue & hashValue; // Convert to 32bit integer
    }
    
    // Массив с парами цветов для градиентов
    const gradients = [
      ['#1976d2', '#64b5f6'], // Синий
      ['#388e3c', '#81c784'], // Зеленый
      ['#d32f2f', '#e57373'], // Красный
      ['#7b1fa2', '#ba68c8'], // Фиолетовый
      ['#f57c00', '#ffb74d'], // Оранжевый
      ['#0097a7', '#4dd0e1'], // Циан
      ['#5d4037', '#a1887f'], // Коричневый
      ['#616161', '#bdbdbd'], // Серый
      ['#827717', '#c0ca33'], // Лаймовый
      ['#c2185b', '#f06292']  // Розовый
    ];
    
    // Выбираем градиент на основе хеша
    const index = Math.abs(hashValue) % gradients.length;
    const [color1, color2] = gradients[index];
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

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
    // Проверяем авторизацию пользователя
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigate('/login');
      return;
    }
    
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

  const isAuth = !!localStorage.getItem('access_token');

  return (
    <>
      <SEO
        title={seoConfig.forum.title}
        description={seoConfig.forum.description}
        keywords={seoConfig.forum.keywords}
        canonical="https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/forum"
      />
      <SchemaMarkup
        type="WebPage"
        data={{
          name: 'Форум рыболовов',
          description: seoConfig.forum.description,
          url: 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/forum'
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      {/* Заголовок и поиск */}
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main', 
            mb: 1,
            fontSize: { xs: '1.8rem', md: '3rem' }
          }}
        >
          🎣 Форум рыболовов
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          Обсуждение рыбалки, обмен опытом и советы от профессионалов
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 1.5, md: 2 }, 
          mt: 2, 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center'
        }}>
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: '200px', width: { xs: '100%', sm: 'auto' } }}>
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
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 1 }, 
            flexDirection: { xs: 'column', sm: 'row' }, 
            width: { xs: '100%', sm: 'auto' } 
          }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTopic}
              fullWidth={isSmallMobile}
              sx={{ 
                minHeight: { xs: '44px', sm: 'auto' },
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
              title={!isAuth ? 'Войдите, чтобы создать тему' : 'Создать новую тему'}
            >
              {!isAuth ? 'Войти и создать тему' : 'Новая тема'}
            </Button>
            
            {userStore.isAdmin && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCategory}
                fullWidth={isSmallMobile}
                sx={{ 
                  minHeight: { xs: '44px', sm: 'auto' },
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                {isMobile ? 'Категория' : 'Создать категорию'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Категории форума */}
      <Paper elevation={0} 
        sx={{ 
          mb: { xs: 3, md: 4 }, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            bgcolor: 'primary.main', 
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textAlign: 'center'
          }}
        >
          Категории форума
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 3, sm: 4 } }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: { xs: 1.5, sm: 2 } }}>{error}</Alert>
        ) : (
          <Box>
            {categories.map((category: ForumCategory, index: number) => (
              <React.Fragment key={category.id}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: isMobile ? 'none' : 'translateY(-2px)',
                    },
                    '&:active': isMobile ? {
                      bgcolor: 'action.selected',
                      transform: 'scale(0.98)',
                    } : {},
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between'
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 }, 
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: 20, sm: 24 },
                        flexShrink: 0
                      }}
                    >
                      {category.icon || '📋'}
                    </Box>
                    <Box sx={{ 
                      flex: 1,
                      width: { xs: '100%', sm: 'auto' },
                      mb: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        mb: 0.5
                      }}>
                        {category.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 2, sm: 1 },
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'row' },
                    gap: { xs: 1, sm: 3 },
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    bgcolor: { xs: 'action.hover', sm: 'transparent' },
                    borderRadius: { xs: 1, sm: 0 },
                    p: { xs: 1, sm: 0 },
                    minWidth: { xs: 'auto', sm: '200px' }
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'primary.main',
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.5, sm: 1 },
                      borderRadius: 1,
                      minWidth: { xs: '70px', sm: '80px' }
                    }}>
                      <Typography variant="h6" fontWeight="bold" fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                        {category.topics_count}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Тем
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'secondary.main',
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.5, sm: 1 },
                      borderRadius: 1,
                      minWidth: { xs: '70px', sm: '80px' }
                    }}>
                      <Typography variant="h6" fontWeight="bold" fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                        {category.messages_count}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Сообщений
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            {categories.length === 0 && (
              <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
          mt: { xs: 3, md: 4 },
          mb: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            bgcolor: 'primary.main', 
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textAlign: 'center'
          }}
        >
          Активные темы форума
        </Typography>
        
        {topicsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 3, sm: 4 } }}>
            <CircularProgress size={32} />
          </Box>
        ) : topicsError ? (
          <Alert severity="error" sx={{ m: { xs: 1.5, sm: 2 } }}>{topicsError}</Alert>
        ) : (
          <Box>
            {activeTopics.length > 0 ? (
              activeTopics.map((topic, index) => (
                <React.Fragment key={topic.id}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: isMobile ? 'none' : 'translateY(-2px)',
                      },
                      '&:active': isMobile ? {
                        bgcolor: 'action.selected',
                        transform: 'scale(0.98)',
                      } : {},
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 2 }
                    }}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1.5, sm: 2 }, 
                      width: { xs: '100%', sm: 'auto' } 
                    }}>
                      <Avatar 
                        src={topic.author_avatar} 
                        sx={{ 
                          width: { xs: 36, sm: 40 }, 
                          height: { xs: 36, sm: 40 }, 
                          alignSelf: { xs: 'flex-start', sm: 'center' },
                          background: !topic.author_avatar 
                            ? generateGradientColor(topic.author_id, topic.author_username || '')
                            : undefined,
                          color: 'white',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {!topic.author_avatar && ((topic.author_username)?.[0] || '?')}
                      </Avatar>
                      <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          mb: 0.5,
                          flexDirection: { xs: 'column', sm: 'row' },
                          width: '100%',
                          alignItems: { xs: 'flex-start', sm: 'center' }
                        }}>
                          <Typography variant="body2" color="primary" sx={{ 
                            fontWeight: 'medium',
                            bgcolor: { xs: 'primary.50', sm: 'transparent' },
                            px: { xs: 1, sm: 0 },
                            py: { xs: 0.25, sm: 0 },
                            borderRadius: 1,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}>
                            {getCategoryTitle(topic.category_id)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: { xs: 'block', sm: 'block' },
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
                            {topic.author_username || 'Неизвестный'}
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          textAlign: { xs: 'left', sm: 'left' },
                          mb: { xs: 1, sm: 0.5 },
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 2, sm: 1 },
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {topic.title}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 2, sm: 2 }, 
                      mt: { xs: 0.5, sm: 0 }, 
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'space-between', sm: 'flex-end' },
                      bgcolor: { xs: 'action.hover', sm: 'transparent' },
                      borderRadius: 1,
                      py: { xs: 0.5, sm: 0 },
                      px: { xs: 1, sm: 0 },
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: '200px' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CommentIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {topic.posts_count - 1 >= 0 ? topic.posts_count - 1 : 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VisibilityIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {topic.views_count}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {formatRelativeDate(topic.created_at)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(topic.id);
                        }}
                        sx={{ 
                          p: 0.5,
                          color: bookmarkedTopics.includes(topic.id) ? 'primary.main' : 'action.disabled' 
                        }}
                      >
                        {bookmarkedTopics.includes(topic.id) ? (
                          <BookmarkIcon fontSize="small" />
                        ) : (
                          <BookmarkBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                  {index < activeTopics.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Активные темы не найдены
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

    
    </Container>
    </>
  );
};

export default ForumPage; 