import React, { useState } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Avatar, Grid, TextField, InputAdornment, Chip,
  Card, CardContent, CardHeader, CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

// Моковые данные для категорий форума
export const forumCategories = [
  { 
    id: 1, 
    title: 'Рыболовные снасти', 
    description: 'Обсуждение удочек, спиннингов, катушек и другого оборудования',
    topics: 124,
    posts: 1543,
    icon: '🎣'
  },
  { 
    id: 2, 
    title: 'Места для рыбалки', 
    description: 'Делимся информацией о лучших местах для рыбалки',
    topics: 89,
    posts: 967,
    icon: '🗺️'
  },
  { 
    id: 3, 
    title: 'Техника ловли', 
    description: 'Обсуждение различных техник и методов ловли рыбы',
    topics: 75,
    posts: 823,
    icon: '📊'
  },
  { 
    id: 4, 
    title: 'Наживки и приманки', 
    description: 'Всё о наживках, приманках и прикормках',
    topics: 103,
    posts: 1288,
    icon: '🪱'
  },
  { 
    id: 5, 
    title: 'Отчеты о рыбалке', 
    description: 'Поделитесь своими успехами и впечатлениями',
    topics: 201,
    posts: 2654,
    icon: '📝'
  }
];

// Моковые данные для популярных тем
export const popularTopics = [
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
    category: 'Рыболовные снасти',
    isBookmarked: true,
  },
  {
    id: 2,
    title: 'Рыбалка на Волге: лучшие места и время года',
    author: {
      id: 2,
      name: 'Михаил',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    replies: 28,
    views: 542,
    lastActivity: '2 часа назад',
    category: 'Места для рыбалки',
    isBookmarked: false,
  },
  {
    id: 3,
    title: 'Как правильно выбрать катушку для спиннинга?',
    author: {
      id: 3,
      name: 'Елена',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    replies: 42,
    views: 891,
    lastActivity: '4 часа назад',
    category: 'Рыболовные снасти',
    isBookmarked: false,
  },
  {
    id: 4,
    title: 'Уловистые приманки для щуки: личный опыт',
    author: {
      id: 4,
      name: 'Дмитрий',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    replies: 39,
    views: 723,
    lastActivity: '1 день назад',
    category: 'Наживки и приманки',
    isBookmarked: true,
  },
  {
    id: 5,
    title: 'Техника ловли карпа на бойлы',
    author: {
      id: 5,
      name: 'Сергей',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    replies: 31,
    views: 644,
    lastActivity: '2 дня назад',
    category: 'Техника ловли',
    isBookmarked: false,
  }
];

const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedTopics, setBookmarkedTopics] = useState<number[]>(
    popularTopics.filter(topic => topic.isBookmarked).map(topic => topic.id)
  );

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

  const toggleBookmark = (topicId: number) => {
    if (bookmarkedTopics.includes(topicId)) {
      setBookmarkedTopics(bookmarkedTopics.filter(id => id !== topicId));
    } else {
      setBookmarkedTopics([...bookmarkedTopics, topicId]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и поиск */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ForumIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Форум рыболовов
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Общайтесь, делитесь опытом и находите единомышленников
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
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
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCreateTopic}
                sx={{ 
                  ml: 2, 
                  height: 56, 
                  minWidth: { xs: 56, md: 180 },
                  borderRadius: 2
                }}
              >
                <AddIcon sx={{ display: { xs: 'block', md: 'inline' }, mr: { xs: 0, md: 1 } }} />
                <Typography sx={{ display: { xs: 'none', md: 'block' } }}>
                  Создать тему
                </Typography>
              </Button>
            </Box>
          </Grid>
        </Grid>
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
        
        {forumCategories.map((category, index) => (
          <React.Fragment key={category.id}>
            {index > 0 && <Divider />}
            <Box 
              sx={{ 
                p: 2, 
                '&:hover': { 
                  bgcolor: 'action.hover',
                  cursor: 'pointer'
                },
                transition: 'background-color 0.2s'
              }}
              onClick={() => handleCategoryClick(category.id)}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
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
                    <Box>
                      <Typography variant="h6" color="primary.dark">{category.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {category.topics}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        тем
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="secondary.main">
                        {category.posts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        сообщений
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </React.Fragment>
        ))}
      </Paper>

      {/* Популярные темы */}
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
            bgcolor: 'secondary.main', 
            color: 'white',
            fontWeight: 600
          }}
        >
          Популярные обсуждения
        </Typography>
        
        {popularTopics.map((topic, index) => (
          <React.Fragment key={topic.id}>
            {index > 0 && <Divider />}
            <Box 
              sx={{ 
                p: 2, 
                '&:hover': { 
                  bgcolor: 'action.hover',
                  cursor: 'pointer'
                },
                transition: 'background-color 0.2s'
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 10, md: 9 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar src={topic.author.avatar} alt={topic.author.name} />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ fontWeight: 600, color: 'secondary.dark' }}
                          onClick={() => handleTopicClick(topic.id)}
                        >
                          {topic.title}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={topic.category} 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            height: 24,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Автор: {topic.author.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CommentIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {topic.replies}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {topic.views}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 2, md: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'flex-end', 
                    alignItems: { xs: 'flex-end', md: 'center' },
                    height: '100%',
                    gap: 2
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5 
                    }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {topic.lastActivity}
                      </Typography>
                    </Box>
                    <Box 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(topic.id);
                      }}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {bookmarkedTopics.includes(topic.id) ? (
                        <BookmarkIcon color="primary" />
                      ) : (
                        <BookmarkBorderIcon />
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </React.Fragment>
        ))}
      </Paper>

      {/* Информация о форуме */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Статистика форума
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Всего тем:</Typography>
                <Typography variant="body2" fontWeight={600}>592</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Всего сообщений:</Typography>
                <Typography variant="body2" fontWeight={600}>7,275</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Участников:</Typography>
                <Typography variant="body2" fontWeight={600}>1,423</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Новых за месяц:</Typography>
                <Typography variant="body2" fontWeight={600}>82</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Правила форума
              </Typography>
              <Typography variant="body2" paragraph>
                • Уважайте других участников форума
              </Typography>
              <Typography variant="body2" paragraph>
                • Не размещайте спам и рекламу
              </Typography>
              <Typography variant="body2" paragraph>
                • Придерживайтесь тематики раздела
              </Typography>
              <Typography variant="body2">
                • Соблюдайте законодательство РФ
              </Typography>
            </CardContent>
            <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
              <Button size="small" color="primary">
                Полные правила
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Активные пользователи
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                  <Avatar 
                    key={id}
                    src={`https://i.pravatar.cc/150?img=${id}`} 
                    alt={`Пользователь ${id}`}
                    sx={{ width: 40, height: 40 }}
                  />
                ))}
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>+42</Avatar>
              </Box>
            </CardContent>
            <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
              <Button size="small" color="primary">
                Список участников
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForumPage; 