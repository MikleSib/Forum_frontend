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
  Avatar,
  Tabs,
  Tab,
  Grid,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  SwipeableDrawer
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
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { NewsCategory, NEWS_CATEGORIES, NewsItem } from '../../shared/types/news.types';
import { newsApi } from '../../services/newsApi';
import { userStore } from '../../shared/store/userStore';
import { formatLocalDate } from '../../utils/dateUtils';
import NewsCard from '../../components/NewsCard';

// Типы сортировки
type SortType = 'newest' | 'popular';

const CATEGORY_ICONS = {
  [NewsCategory.NEWS]: <NewspaperIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.GUIDES]: <MenuBookIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.FISH_SPECIES]: <PetsIcon sx={{ color: 'primary.main' }} />,
  [NewsCategory.EVENTS]: <EventIcon sx={{ color: 'primary.main' }} />
};

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(
    // Пытаемся восстановить категорию из localStorage, если нет - используем NEWS
    localStorage.getItem('selectedNewsCategory') as NewsCategory || NewsCategory.NEWS
  );
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuth] = useState(!!localStorage.getItem('access_token'));
  // Сортировка по умолчанию - новые (newest)
  const [sortType, setSortType] = useState<SortType>('newest');
  // Состояние для поиска рыб
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Состояние для мобильного меню
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Обновляем URL при изменении категории
  useEffect(() => {
    // Сохраняем выбранную категорию в localStorage
    localStorage.setItem('selectedNewsCategory', selectedCategory);
    
    // Обновляем URL с параметром категории без перезагрузки страницы
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('category', selectedCategory);
    
    // Заменяем текущий URL без добавления в историю браузера
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [selectedCategory, navigate, location.pathname]);

  // Восстанавливаем категорию из URL при загрузке страницы
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
    // Передаем текущую категорию в URL деталей новости
    navigate(`/news/${newsId}?from=${selectedCategory}`);
  };

  const handleCreateNews = () => {
    navigate('/news/create');
  };

  // Сортировка новостей в зависимости от выбранного типа и применение поиска для рыб
  const getFilteredNews = () => {
    // Сначала фильтруем по категории
    let filtered = news.filter(item => item.category === selectedCategory);
    
    // Если это категория рыб и есть поисковый запрос, то фильтруем по названию
    if (selectedCategory === NewsCategory.FISH_SPECIES && searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Затем применяем сортировку
    if (sortType === 'newest') {
      // Сортировка по дате (новые вверху)
      return [...filtered].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      // Сортировка по популярности (по лайкам)
      return [...filtered].sort((a, b) => b.likes - a.likes);
    }
  };

  // Отсортированный и отфильтрованный список новостей
  const filteredNews = getFilteredNews();

  // Функция для получения превью из содержимого новости
  const getPreview = (item: NewsItem): string => {
    const textContent = item.contents.find(content => content.type === 'text');
    if (textContent) {
      return textContent.content.slice(0, 150) + '...';
    }
    return 'Нет текстового содержимого';
  };

  // Функция для обработки выбора категории
  const handleCategorySelect = (category: NewsCategory) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setMobileMenuOpen(false); // Закрываем меню после выбора
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
                  onClick={() => handleCategorySelect(category as NewsCategory)}
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

        {/* Мобильное меню */}
        <SwipeableDrawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpen={() => setMobileMenuOpen(true)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Навигация</Typography>
            <List>
              {Object.entries(NEWS_CATEGORIES).map(([category, { title }]) => (
                <ListItemButton
                  key={category}
                  selected={category === selectedCategory}
                  onClick={() => handleCategorySelect(category as NewsCategory)}
                >
                  <ListItemIcon>
                    {CATEGORY_ICONS[category as NewsCategory]}
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </SwipeableDrawer>

        {/* Центральная колонка */}
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          height: '100%'
        }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Кнопка бургер-меню для мобильных */}
                <IconButton 
                  sx={{ mr: 1, display: { xs: 'block', md: 'none' } }}
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6">
                  {NEWS_CATEGORIES[selectedCategory].title}
                </Typography>
              </Box>
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
            
            {/* Поле поиска для категории "Виды рыб" */}
            {selectedCategory === NewsCategory.FISH_SPECIES && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Поиск рыбы по названию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
            
            {/* Показываем элементы сортировки только для не-событий и не-видов рыб */}
            {selectedCategory !== NewsCategory.EVENTS && selectedCategory !== NewsCategory.FISH_SPECIES && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label="Популярные" 
                  onClick={() => setSortType('popular')} 
                  color={sortType === 'popular' ? 'primary' : 'default'}
                  variant={sortType === 'popular' ? 'filled' : 'outlined'}
                />
                <Chip 
                  icon={<FiberNewIcon />} 
                  label="Новые" 
                  onClick={() => setSortType('newest')} 
                  color={sortType === 'newest' ? 'primary' : 'default'}
                  variant={sortType === 'newest' ? 'filled' : 'outlined'}
                />
              </Box>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredNews.length === 0 ? (
              <Typography>
                {searchTerm.trim() 
                  ? `Нет результатов по запросу "${searchTerm}"` 
                  : `Нет новостей в категории ${NEWS_CATEGORIES[selectedCategory].title}`}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredNews.map((item) => (
                  <Grid size={{xs:12, sm:6, md:selectedCategory === NewsCategory.EVENTS ? 6 : 6}} key={item.id}>
                    <NewsCard 
                      news={item} 
                      onClick={() => handleNewsClick(item.id)} 
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>

        {/* Правая колонка */}
        <Box sx={{ 
          flex: '0 0 300px', 
          display: { xs: 'none', md: 'block' },
          overflow: 'auto'
        }}>
         
           
          
        </Box>
      </Box>
    </Container>
  );
};

export default NewsPage; 