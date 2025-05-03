import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Container,
  Paper,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PetsIcon from '@mui/icons-material/Pets';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { NewsCategory, NEWS_CATEGORIES, NewsItem } from '../../shared/types/news.types';
import { newsApi } from '../../services/newsApi';
import { userStore } from '../../shared/store/userStore';

const CATEGORY_ICONS = {
  [NewsCategory.NEWS]: <NewspaperIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.GUIDES]: <MenuBookIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.FISH_SPECIES]: <PetsIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.EVENTS]: <EventIcon sx={{ color: 'primary.main' }} />
};

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(NewsCategory.NEWS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuth] = useState(!!localStorage.getItem('access_token'));
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam && Object.values(NewsCategory).includes(categoryParam as NewsCategory)) {
      setSelectedCategory(categoryParam as NewsCategory);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getNews();
        setNews(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить новости');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };

  const handleCreateNews = () => {
    navigate('/news/create');
  };

  const filteredNews = news.filter(item => item.category === selectedCategory);

  // Функция для получения превью из содержимого новости
  const getPreview = (item: NewsItem): string => {
    const textContent = item.contents.find(content => content.type === 'text');
    if (textContent) {
      return textContent.content.slice(0, 150) + '...';
    }
    return 'Нет текстового содержимого';
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        maxWidth: '1600px',
        height: '100%',
        overflow: 'hidden',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        height: '100%',
        flexDirection: { xs: 'column', md: 'row' } 
      }}>
        {/* Левая колонка */}
        <Box sx={{ 
          flex: '0 0 250px', 
          display: { xs: 'none', md: 'block' },
          overflow: 'auto'
        }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Навигация</Typography>
            <List>
              {Object.entries(NEWS_CATEGORIES).map(([category, { title }]) => (
                <ListItemButton
                  key={category}
                  selected={category === selectedCategory}
                  onClick={() => setSelectedCategory(category as NewsCategory)}
                >
                  <ListItemIcon>
                    {CATEGORY_ICONS[category as NewsCategory]}
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Центральная колонка */}
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          height: '100%'
        }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {NEWS_CATEGORIES[selectedCategory].title}
              </Typography>
              {isAuth && userStore.isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNews}
                >
                  Создать новость
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip icon={<TrendingUpIcon />} label="Популярные" onClick={() => {}} />
              <Chip icon={<FiberNewIcon />} label="Новые" onClick={() => {}} />
              <Chip icon={<AccessTimeIcon />} label="По дате" onClick={() => {}} />
            </Box>
            {loading ? (
              <Typography>Загрузка...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredNews.length === 0 ? (
              <Typography>Нет новостей в этой категории</Typography>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2
              }}>
                {filteredNews.map((item) => (
                  <Paper 
                    key={item.id}
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleNewsClick(item.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar src={item.author?.avatar}>
                        {item.author?.name?.[0]?.toUpperCase() || 'РФ'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {item.author?.name || 'Рыбный форум'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: ru })}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getPreview(item)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Правая колонка */}
        <Box sx={{ 
          flex: '0 0 300px', 
          display: { xs: 'none', md: 'block' },
          overflow: 'auto'
        }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Статистика</Typography>
            <List>
              {Object.entries(NEWS_CATEGORIES).map(([category, { title }]) => {
                const count = news.filter(item => item.category === category).length;
                return (
                  <ListItemButton 
                    key={category}
                    onClick={() => setSelectedCategory(category as NewsCategory)}
                  >
                    <ListItemIcon>
                      {CATEGORY_ICONS[category as NewsCategory]}
                    </ListItemIcon>
                    <ListItemText 
                      primary={title}
                      secondary={`${count} публикаций`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default NewsPage; 