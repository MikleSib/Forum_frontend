import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Breadcrumbs, Avatar, Chip, IconButton, TextField,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow
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

// Данные для моделирования категорий форума из родительского компонента
import { forumCategories } from './index';

// Моковые данные для тем в категории
export const topicsData = [
  {
    id: 1,
    title: 'Лучшие спиннинги для начинающих',
    author: {
      id: 1,
      name: 'Александр',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    replies: 34,
    views: 678,
    lastActivity: '15 минут назад',
    lastReplyAuthor: {
      id: 5,
      name: 'Сергей',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    createdAt: '2 дня назад',
    isPinned: true,
    isClosed: false,
    tags: ['Начинающим', 'Снаряжение']
  },
  {
    id: 2,
    title: 'Карбоновые удилища: за и против',
    author: {
      id: 2,
      name: 'Михаил',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    replies: 28,
    views: 542,
    lastActivity: '2 часа назад',
    lastReplyAuthor: {
      id: 3,
      name: 'Елена',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    createdAt: '3 дня назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Обзор']
  },
  {
    id: 3,
    title: 'Как выбрать катушку для спиннинга?',
    author: {
      id: 3,
      name: 'Елена',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    replies: 42,
    views: 891,
    lastActivity: '4 часа назад',
    lastReplyAuthor: {
      id: 4,
      name: 'Дмитрий',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    createdAt: '5 дней назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Вопрос']
  },
  {
    id: 4,
    title: 'Обзор новинок спиннингов 2023 года',
    author: {
      id: 4,
      name: 'Дмитрий',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    replies: 39,
    views: 723,
    lastActivity: '1 день назад',
    lastReplyAuthor: {
      id: 1,
      name: 'Александр',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    createdAt: '7 дней назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Обзор', 'Новинки']
  },
  {
    id: 5,
    title: 'Ремонт спиннинга своими руками',
    author: {
      id: 5,
      name: 'Сергей',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    replies: 31,
    views: 644,
    lastActivity: '2 дня назад',
    lastReplyAuthor: {
      id: 2,
      name: 'Михаил',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    createdAt: '10 дней назад',
    isPinned: false,
    isClosed: true,
    tags: ['Снаряжение', 'Своими руками', 'Ремонт']
  },
  {
    id: 6,
    title: 'Как правильно хранить снасти в межсезонье',
    author: {
      id: 6,
      name: 'Анна',
      avatar: 'https://i.pravatar.cc/150?img=6'
    },
    replies: 25,
    views: 512,
    lastActivity: '3 дня назад',
    lastReplyAuthor: {
      id: 3,
      name: 'Елена',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    createdAt: '2 недели назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Хранение', 'Совет']
  },
  {
    id: 7,
    title: 'Дешевые спиннинги, которые стоят своих денег',
    author: {
      id: 7,
      name: 'Игорь',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    replies: 47,
    views: 902,
    lastActivity: '1 день назад',
    lastReplyAuthor: {
      id: 5,
      name: 'Сергей',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    createdAt: '3 недели назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Бюджетное', 'Обзор']
  },
  {
    id: 8,
    title: 'Помогите выбрать первый спиннинг',
    author: {
      id: 8,
      name: 'Артем',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    replies: 38,
    views: 671,
    lastActivity: '5 часов назад',
    lastReplyAuthor: {
      id: 1,
      name: 'Александр',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    createdAt: '4 дня назад',
    isPinned: false,
    isClosed: false,
    tags: ['Снаряжение', 'Вопрос', 'Начинающим']
  }
];

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [category, setCategory] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    if (categoryId) {
      const foundCategory = forumCategories.find(c => c.id === parseInt(categoryId));
      if (foundCategory) {
        setCategory(foundCategory);
        // В реальном приложении здесь был бы API-запрос для получения тем в категории
        // Имитируем загрузку данных
        setTopics(topicsData);
      }
    }
  }, [categoryId]);

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

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Загрузка...</Typography>
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
                {category.icon}
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
          </Box>
        </Box>
      </Paper>

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
            <TableRow sx={{ bgcolor: 'primary.main' }}>
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
                    bgcolor: topic.isPinned ? 'rgba(46, 125, 50, 0.05)' : 'inherit'
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      pl: 2, 
                      borderLeft: topic.isPinned ? '4px solid' : 'none',
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {topic.isPinned && (
                          <Chip 
                            size="small" 
                            label="Закреплено" 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }} 
                          />
                        )}
                        {topic.isClosed && (
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
                            color: topic.isClosed ? 'text.secondary' : 'secondary.dark',
                            textDecoration: topic.isClosed ? 'line-through' : 'none',
                            opacity: topic.isClosed ? 0.7 : 1
                          }}
                        >
                          {topic.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic.author.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          •
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {topic.createdAt}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {topic.tags.map((tag: string, index: number) => (
                          <Chip 
                            key={index}
                            size="small" 
                            label={tag} 
                            sx={{ 
                              bgcolor: 'action.hover', 
                              height: 20,
                              fontSize: '0.7rem'
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {topic.replies}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {topic.views}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {topic.lastReplyAuthor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {topic.lastActivity}
                        </Typography>
                      </Box>
                      <Avatar 
                        src={topic.lastReplyAuthor.avatar} 
                        alt={topic.lastReplyAuthor.name}
                        sx={{ width: 32, height: 32 }}
                      />
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
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
              Статистика категории
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Тем:</Typography>
                <Typography variant="body1" fontWeight={500}>{category.topics}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Сообщений:</Typography>
                <Typography variant="body1" fontWeight={500}>{category.posts}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Участников:</Typography>
                <Typography variant="body1" fontWeight={500}>32</Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>
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