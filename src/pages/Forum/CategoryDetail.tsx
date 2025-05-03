import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Breadcrumbs, Avatar, Chip, IconButton, TextField,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  CircularProgress, Alert
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

import { forumApi } from '../../services/forumApi';
import { ForumCategory, ForumTopic } from '../../shared/types/forum.types';
import { userStore } from '../../shared/store/userStore';

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
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

  const handleCreateTopic = () => {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !category) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Категория не найдена</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Навигационная цепочка и заголовок */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          <Link 
            to="/forum" 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography color="text.primary">Форум</Typography>
          </Link>
          {category?.parent_id && category.parent_title && (
            <Link 
              to={`/forum/category/${category.parent_id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography color="text.primary">{category.parent_title}</Typography>
            </Link>
          )}
          <Typography color="text.primary" fontWeight={500}>{category.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton sx={{ bgcolor: 'action.hover' }} onClick={() => navigate('/forum')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'white',
                  borderRadius: 2,
                  fontSize: '1.5rem'
                }}
              >
                {category.icon || '📋'}
              </Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {category.title}
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
              {category.description}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Поиск и сортировка */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1 }}>
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<SortIcon />}
              onClick={() => handleSortChange(sortBy === 'lastActivity' ? 'createdAt' : 'lastActivity')}
            >
              {sortBy === 'lastActivity' ? 'По последней активности' : 'По дате создания'}
            </Button>
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
                onClick={() => navigate(`/forum/category/${categoryId}/create-subcategory`)}
              >
                Создать подкатегорию
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Подкатегории, если они есть */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <Paper elevation={0} sx={{ mb: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
            Подкатегории
          </Typography>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Категория</TableCell>
                  <TableCell align="center">Темы</TableCell>
                  <TableCell align="center">Сообщения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {category.subcategories.map((subcat) => (
                  <TableRow 
                    key={subcat.id}
                    hover
                    onClick={() => navigate(`/forum/category/${subcat.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20
                          }}
                        >
                          {subcat.icon || '📋'}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {subcat.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subcat.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{subcat.topics_count}</TableCell>
                    <TableCell align="center">{subcat.messages_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Темы категории */}
      <TableContainer component={Paper} sx={{ 
        mb: 4, 
        borderRadius: 3, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}>
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
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    В этой категории пока нет тем. Будьте первым, кто создаст тему!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
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
                          {topic.created_at ? 
                            new Date(topic.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }) : ''}
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
                              {new Date(topic.last_post_date).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Статистика категории */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" color="#1565c3" sx={{ fontWeight: 600, mb: 1 }}>
              Статистика категории
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
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
          <Box>
            <Typography variant="h6" color="#1565c3" sx={{ fontWeight: 600, mb: 1 }}>
              Активные участники
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((id) => (
                <Avatar 
                  key={id}
                  src={`https://i.pravatar.cc/150?img=${id}`} 
                  alt={`Пользователь ${id}`}
                  sx={{ width: 32, height: 32 }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CategoryDetail;