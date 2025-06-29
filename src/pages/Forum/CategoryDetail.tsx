import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Breadcrumbs, Avatar, Chip, IconButton, TextField,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Skeleton, Pagination,
  Card, CardContent, CardActions, List, ListItem,
  ListItemText, ListItemAvatar, useTheme, useMediaQuery
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SortIcon from '@mui/icons-material/Sort';
import FolderIcon from '@mui/icons-material/Folder';

import { forumApi } from '../../services/forumApi';
import { ForumCategory, ForumTopic } from '../../shared/types/forum.types';
import { userStore } from '../../shared/store/userStore';
import { formatLocalDate, formatRelativeDate } from '../../utils/dateUtils';

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция загрузки данных категории и тем
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      // Получаем информацию о категории
      const categoryData = await forumApi.getCategoryById(parseInt(categoryId));
      
      // Если есть родительская категория, загружаем информацию о ней
      if (categoryData.parent_id) {
        try {
          const parentCategory = await forumApi.getCategoryById(categoryData.parent_id);
          categoryData.parent_title = parentCategory.title;
        } catch (err) {
          console.error('Ошибка при загрузке родительской категории:', err);
          // Даже если не удалось загрузить родительскую категорию, продолжаем работу
        }
      }
      
      setCategory(categoryData);
      
      // Получаем темы для этой категории
      const topicsResponse = await forumApi.getTopics({
        category_id: parseInt(categoryId),
        page: 1,
        page_size: 20
      });
      
      setTopics(topicsResponse.items);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных категории:', err);
      setError('Не удалось загрузить данные категории. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальном приложении здесь был бы поиск по темам
  };

  const handleBackClick = () => {
    // Если есть родительская категория, идем к ней
    if (category?.parent_id) {
      navigate(`/forum/category/${category.parent_id}`);
    } else {
      // Иначе идем на главную страницу форума
      navigate('/forum');
    }
  };

  const handleCreateTopic = () => {
    // Проверяем авторизацию пользователя
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigate('/login');
      return;
    }
    
    // В реальном приложении здесь был бы переход на страницу создания темы
    navigate(`/forum/category/${categoryId}/create-topic`);
  };

  const handleSortChange = (sortType: string) => {
    setSortBy(sortType);
    // В реальном приложении здесь была бы сортировка тем
  };

  const handleTopicClick = (topicId: number) => {
    navigate(`/forum/topic/${topicId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !category) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/forum"
          sx={{ mt: 2 }}
        >
          Вернуться к списку категорий
        </Button>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Typography variant="h5">Категория не найдена</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 }, px: { xs: 1, md: 3 } }}>
      {/* Навигационная цепочка и заголовок */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ 
            mb: 1,
            '& .MuiBreadcrumbs-separator': {
              fontSize: { xs: '0.8rem', md: '1rem' }
            }
          }}
        >
          <Link 
            to="/forum" 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography 
              color="text.primary" 
              sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}
            >
              Форум
            </Typography>
          </Link>
          {category?.parent_id && category.parent_title && (
            <Link 
              to={`/forum/category/${category.parent_id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography 
                color="text.primary"
                sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}
              >
                {category.parent_title}
              </Typography>
            </Link>
          )}
          <Typography 
            color="text.primary" 
            fontWeight={500}
            sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}
          >
            {category.title}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mt: 2, 
          gap: { xs: 1, md: 2 },
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, width: '100%' }}>
            <IconButton 
              sx={{ 
                bgcolor: 'action.hover',
                width: { xs: 36, md: 48 },
                height: { xs: 36, md: 48 }
              }} 
              onClick={handleBackClick}
            >
              <ArrowBackIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                <Box 
                  sx={{ 
                    width: { xs: 40, md: 50 }, 
                    height: { xs: 40, md: 50 }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    color: 'white',
                    borderRadius: 2,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  {category.icon || '📋'}
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '2.125rem' }
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ 
                  mt: 0.5,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                {category.description}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Поиск и сортировка */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1.5, md: 2 }, 
          mb: { xs: 2, md: 3 }, 
          borderRadius: { xs: 2, md: 3 }, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: { xs: 1.5, md: 2 }
        }}>
          <Box component="form" onSubmit={handleSearch} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Поиск по темам..."
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
            gap: { xs: 1, md: 2 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%'
          }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<SortIcon />}
              onClick={() => handleSortChange(sortBy === 'lastActivity' ? 'createdAt' : 'lastActivity')}
              fullWidth={isSmallMobile}
              sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
            >
              {isMobile 
                ? (sortBy === 'lastActivity' ? 'По активности' : 'По дате')
                : (sortBy === 'lastActivity' ? 'По последней активности' : 'По дате создания')
              }
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTopic}
              fullWidth={isSmallMobile}
              sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
            >
              Новая тема
            </Button>
            {userStore.isAdmin && (
              <Button 
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/forum/category/${categoryId}/create-subcategory`)}
                fullWidth={isSmallMobile}
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                {isMobile ? 'Подкатегория' : 'Создать подкатегорию'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Подкатегории - адаптивное отображение */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            mb: { xs: 2, md: 4 }, 
            overflow: 'hidden', 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: { xs: 2, md: 3 }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              p: { xs: 1.5, md: 2 }, 
              bgcolor: 'primary.main', 
              color: 'white', 
              fontWeight: 600,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Подкатегории
          </Typography>
          
          {/* Мобильная версия - карточки */}
          {isMobile ? (
            <Box sx={{ p: { xs: 1, md: 2 } }}>
              {category.subcategories.map((subcat) => (
                <Card 
                  key={subcat.id}
                  sx={{ 
                    mb: 1.5, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'action.hover',
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    },
                    '&:last-child': { mb: 0 }
                  }}
                  onClick={() => navigate(`/forum/category/${subcat.id}`)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          flexShrink: 0
                        }}
                      >
                        {subcat.icon || '📋'}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {subcat.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.8rem',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {subcat.description}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          p: 1
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight={600} color="primary">
                              {subcat.topics_count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Тем
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight={600} color="secondary">
                              {subcat.messages_count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Сообщений
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
                         /* Десктопная версия - аналогично основным категориям */
             <Box>
               {category.subcategories?.map((subcat, index) => (
                <React.Fragment key={subcat.id}>
                  <Box
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                      },
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      justifyContent: 'space-between'
                    }}
                    onClick={() => navigate(`/forum/category/${subcat.id}`)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      flex: 1
                    }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          flexShrink: 0
                        }}
                      >
                        {subcat.icon || '📋'}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {subcat.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subcat.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      gap: 3,
                      alignItems: 'center',
                      minWidth: '200px',
                      justifyContent: 'flex-end'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: 'primary.main',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        minWidth: '80px'
                      }}>
                        <Typography variant="h6" fontWeight="bold" fontSize="1.25rem">
                          {subcat.topics_count}
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
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        minWidth: '80px'
                      }}>
                        <Typography variant="h6" fontWeight="bold" fontSize="1.25rem">
                          {subcat.messages_count}
                        </Typography>
                        <Typography variant="caption">
                          Сообщений
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                                     {index < (category.subcategories?.length || 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Темы категории - адаптивное отображение */}
      <Paper
        elevation={0}
        sx={{ 
          mb: { xs: 2, md: 4 }, 
          borderRadius: { xs: 2, md: 3 }, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: { xs: 1.5, md: 2 }, 
            bgcolor: '#2e7d32', 
            color: 'white', 
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          Темы категории
        </Typography>
        
        {topics.length === 0 ? (
          <Box sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
              В этой категории пока нет тем. Будьте первым, кто создаст тему!
            </Typography>
          </Box>
        ) : isMobile ? (
          /* Мобильная версия - карточки */
          <Box sx={{ p: { xs: 1, md: 2 } }}>
            {topics.map((topic) => (
              <Card 
                key={topic.id}
                sx={{ 
                  mb: 1.5, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'action.hover',
                    transform: 'translateY(-1px)',
                    boxShadow: 2
                  },
                  '&:last-child': { mb: 0 },
                  bgcolor: topic.is_pinned ? 'rgba(21, 101, 195, 0.05)' : 'inherit',
                  borderLeft: topic.is_pinned ? '4px solid #1565c3' : 'none'
                }}
                onClick={() => handleTopicClick(topic.id)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar 
                      src={topic.author_avatar || undefined} 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        flexShrink: 0
                      }}
                    >
                      {!topic.author_avatar && (topic.author_username?.[0] || '?')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        {topic.is_pinned && (
                          <Chip 
                            size="small" 
                            label="Закреплено" 
                            sx={{ 
                              bgcolor: '#1565c3', 
                              color: 'white',
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600
                            }} 
                          />
                        )}
                        {topic.is_closed && (
                          <Chip 
                            size="small" 
                            label="Закрыто" 
                            sx={{ 
                              bgcolor: 'text.secondary', 
                              color: 'white',
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600
                            }} 
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          color: topic.is_closed ? 'text.secondary' : '#1565c3',
                          textDecoration: topic.is_closed ? 'line-through' : 'none',
                          opacity: topic.is_closed ? 0.7 : 1,
                          fontSize: '0.9rem',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {topic.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem', 
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <PersonIcon fontSize="small" sx={{ fontSize: '0.8rem' }} />
                        {topic.author_username || `Пользователь ${topic.author_id}`}
                        <span style={{ margin: '0 4px' }}>•</span>
                        {formatLocalDate(topic.created_at)}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        p: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CommentIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {topic.posts_count - 1 >= 0 ? topic.posts_count - 1 : 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {topic.views_count}
                          </Typography>
                        </Box>
                        {topic.last_post_date && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {formatRelativeDate(topic.last_post_date)}
                          </Typography>
                        )}
                      </Box>
                      
                      {topic.tags && topic.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {topic.tags.slice(0, 3).map((tag, index) => (
                            <Chip 
                              key={index}
                              size="small" 
                              label={tag} 
                              sx={{ 
                                bgcolor: 'rgba(21, 101, 195, 0.1)', 
                                color: '#1565c3',
                                height: 18,
                                fontSize: '0.65rem'
                              }} 
                            />
                          ))}
                          {topic.tags.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{topic.tags.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          /* Десктопная версия - таблица */
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2e7d32' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Тема</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Ответы
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Просмотры
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Последнее сообщение</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow 
                    key={topic.id} 
                    hover 
                    onClick={() => handleTopicClick(topic.id)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: topic.is_pinned ? 'rgba(21, 101, 195, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell 
                      component="th" 
                      scope="row" 
                      sx={{ 
                        pl: 2, 
                        borderLeft: topic.is_pinned ? '4px solid' : 'none',
                        borderLeftColor: '#1565c3'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {topic.is_pinned && (
                            <Chip 
                              size="small" 
                              label="Закреплено" 
                              sx={{ 
                                bgcolor: '#1565c3', 
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }} 
                            />
                          )}
                          {topic.is_closed && (
                            <Chip 
                              size="small" 
                              label="Закрыто" 
                              sx={{ 
                                bgcolor: 'text.secondary', 
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }} 
                            />
                          )}
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              color: topic.is_closed ? 'text.secondary' : '#1565c3',
                              textDecoration: topic.is_closed ? 'line-through' : 'none',
                              opacity: topic.is_closed ? 0.7 : 1
                            }}
                          >
                            {topic.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                            <Typography variant="body2" color="text.secondary">
                              {topic.author_username || `Пользователь ${topic.author_id}`}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            •
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatLocalDate(topic.created_at)}
                          </Typography>
                        </Box>
                        {topic.tags && topic.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {topic.tags.map((tag, index) => (
                              <Chip 
                                key={index}
                                size="small" 
                                label={tag} 
                                sx={{ 
                                  bgcolor: 'rgba(21, 101, 195, 0.1)', 
                                  color: '#1565c3',
                                  height: 20,
                                  fontSize: '0.7rem'
                                }} 
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {topic.posts_count - 1 >= 0 ? topic.posts_count - 1 : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {topic.views_count}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {topic.last_post_date ? (
                          <>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {topic.last_post_author_username || (topic.last_post_author_id ? `Пользователь ${topic.last_post_author_id}` : '')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatLocalDate(topic.last_post_date)}
                              </Typography>
                            </Box>
                            <Avatar 
                              src={topic.last_post_author_avatar || undefined} 
                              alt="Аватар пользователя"
                              sx={{ width: 32, height: 32 }}
                            >
                              {!topic.last_post_author_avatar && (topic.last_post_author_username?.[0] || '?')}
                            </Avatar>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Статистика категории */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: { xs: 2, md: 3 }, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: { xs: 1.5, md: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Box>
            <Typography 
              variant="h6" 
              color="#1565c3" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Статистика категории
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Тем:</Typography>
                <Typography variant="body1" fontWeight={500}>{category.topics_count}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Сообщений:</Typography>
                <Typography variant="body1" fontWeight={500}>{category.messages_count}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Участников:</Typography>
                <Typography variant="body1" fontWeight={500}>32</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CategoryDetail;