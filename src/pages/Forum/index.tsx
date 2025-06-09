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
import { formatRelativeDate } from '../../utils/dateUtils';
import YandexAds from '../../components/YandexAds';
import { SEO } from '../../components/SEO/SEO';
import { SchemaMarkup } from '../../components/SEO/SchemaMarkup';
import { seoConfig } from '../../config/seo.config';

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

  // Функция для получения названия категории по ID
  const getCategoryTitle = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : `Категория ${categoryId}`;
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
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и поиск */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ 
          fontWeight: 700, 
          mb: 2, 
          fontSize: { xs: '1.75rem', md: '2.125rem' },
          color: 'primary.main'
        }}>
          Форум рыболовов
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, maxWidth: '700px', mx: 'auto' }}>
          Обсуждение тем о рыбалке, обмен опытом между рыбаками и общение с единомышленниками.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
          Задавайте вопросы, делитесь советами, обсуждайте снасти и находите новых друзей среди рыболовов.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
          
          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTopic}
              fullWidth={true}
              sx={{ minHeight: { xs: '40px', sm: 'auto' } }}
            >
              Новая тема
            </Button>
            
            {userStore.isAdmin && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCategory}
                fullWidth={true}
                sx={{ minHeight: { xs: '40px', sm: 'auto' } }}
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
            fontSize: { xs: '1rem', sm: '1.25rem' }
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
                    },
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
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
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    gap: { xs: 1, sm: 2 },
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' }
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
                      <Typography variant="caption">
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
                      <Typography variant="caption">
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
          mt: 4,
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
                      },
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 2 }
                    }}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <Avatar 
                      src={topic.author_avatar} 
                      sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, alignSelf: { xs: 'center', sm: 'flex-start' } }}
                    >
                      {!topic.author_avatar && ((topic.author_username)?.[0] || '?')}
                    </Avatar>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mb: 0.5,
                        flexDirection: { xs: 'column', sm: 'row' },
                        width: '100%',
                        alignItems: { xs: 'center', sm: 'flex-start' }
                      }}>
                        <Typography variant="body2" color="primary" sx={{ 
                          fontWeight: 'medium',
                          bgcolor: { xs: 'primary.50', sm: 'transparent' },
                          px: { xs: 1, sm: 0 },
                          py: { xs: 0.25, sm: 0 },
                          borderRadius: 1
                        }}>
                          {getCategoryTitle(topic.category_id)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: { xs: 'block', sm: 'block' },
                          fontSize: '0.75rem'
                        }}>
                          {topic.author_username || 'Неизвестный'}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        textAlign: { xs: 'center', sm: 'left' },
                        mb: { xs: 1, sm: 0 },
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {topic.title}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 2, sm: 2 }, 
                        mt: 0.5, 
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        bgcolor: { xs: 'action.hover', sm: 'transparent' },
                        borderRadius: 1,
                        py: { xs: 0.5, sm: 0 }
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
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {topic.last_post_date ? formatRelativeDate(topic.last_post_date) : formatRelativeDate(topic.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{ 
                        cursor: 'pointer',
                        display: 'block',
                        textAlign: { xs: 'center', sm: 'right' },
                        mt: { xs: 1, sm: 0 },
                        alignSelf: 'center',
                        width: 'auto'
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
              <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Активных тем пока нет
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Боковая колонка с рекламой */}
      <Box sx={{ 
        width: '300px', 
        flexShrink: 0,
        display: { xs: 'none', md: 'block' }
      }}>
        {/* Рекламный блок Яндекс.РСЯ */}
        <YandexAds blockId="R-A-15369619-1" />
      </Box>
    </Container>
    </>
  );
};

export default ForumPage; 