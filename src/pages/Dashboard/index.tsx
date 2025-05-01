import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, Tabs, Tab, Paper, Divider, Chip, InputBase, Grid, List, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import PostCard from '../../components/PostCard';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import FeedIcon from '@mui/icons-material/Feed';
import MapIcon from '@mui/icons-material/Map';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PetsIcon from '@mui/icons-material/Pets';
import EventIcon from '@mui/icons-material/Event';
import styles from './Dashboard.module.css';
import { getPosts } from '../../services/api';
import { Post } from '../../shared/types/post.types';
import { NewsCategory } from '../../shared/types/news.types';
import { useTheme, useMediaQuery } from '@mui/material';
import { newsApi } from '../../services/newsApi';
import logo from '../../assets/logo.svg';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      className={styles.tabPanel}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TopicItem {
  id: number;
  name: string;
  category: NewsCategory;
}

interface CategoryStats {
  news: number;
  guides: number;
  fish_species: number;
}

const TOPIC_ICONS: Record<NewsCategory, React.ReactElement> = {
  [NewsCategory.NEWS]: <NewspaperIcon sx={{ color: 'var(--primary-color)' }} />,
  [NewsCategory.GUIDES]: <MenuBookIcon sx={{ color: 'var(--primary-color)' }} />,
  [NewsCategory.FISH_SPECIES]: <PetsIcon sx={{ color: 'var(--primary-color)' }} />,
  [NewsCategory.EVENTS]: <EventIcon sx={{ color: 'var(--primary-color)' }} />
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    posts: 0,
    users: 45,
    newToday: 3
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({
    news: 0,
    guides: 0,
    fish_species: 0
  });

  const topics: TopicItem[] = [
    { id: 1, name: "Новости", category: NewsCategory.NEWS },
    { id: 2, name: "Гайды", category: NewsCategory.GUIDES },
    { id: 3, name: "Виды рыб", category: NewsCategory.FISH_SPECIES },
    { id: 4, name: "События", category: NewsCategory.EVENTS },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, statsData] = await Promise.all([
          getPosts(),
          newsApi.getCategoryStats()
        ]);
        
        setPosts(postsData);
        setCategoryStats(statsData);
        
        // Обновляем статистику постов
        setStats(prev => ({
          ...prev,
          posts: postsData.length
        }));
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);

    fetchData();
  }, []);

  // Переход на страницу создания поста
  const handleCreatePost = () => {
    navigate('/create-post');
  };

  // Переход на страницу входа
  const handleLogin = () => {
    navigate('/login');
  };

  // Переход на страницу отдельного поста
  const handlePostClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTopicClick = (category: NewsCategory) => {
    navigate(`/news?category=${category}`);
  };

  const handleNavClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const getCategoryCount = (category: NewsCategory): number => {
    switch (category) {
      case NewsCategory.NEWS:
        return categoryStats.news;
      case NewsCategory.GUIDES:
        return categoryStats.guides;
      case NewsCategory.FISH_SPECIES:
        return categoryStats.fish_species;
      case NewsCategory.EVENTS:
        return 0; // Assuming events are not counted in the stats
      default:
        return 0;
    }
  };

  const getPublicationWord = (count: number): string => {
    if (count === 1) return 'публикация';
    if (count > 1 && count < 5) return 'публикации';
    return 'публикаций';
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1600px', p: 0 }}>
      <Box sx={{ mt: 3 }}>
        {/* Основной контент */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Левая колонка */}
          <Box sx={{ flex: '0 0 250px', display: { xs: 'none', md: 'block' } }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Навигация</Typography>
              <List>
                <ListItemButton>
                  <ListItemText primary="Карта рыбных мест" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemText primary="Соревнования" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemText primary="О проекте" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemText primary="Помощь" />
                </ListItemButton>
              </List>
            </Paper>
          </Box>

          {/* Центральная колонка */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Последние публикации</Typography>
                {isAuth && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreatePost}
                  >
                    Создать пост
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
              ) : (
                <Box sx={{ width: '100%' }}>
                  {posts.map((post) => (
                    <Box key={post.id} sx={{ mb: 2 }}>
                      <PostCard
                        title={post.title}
                        content={post.content}
                        imageUrl={post.images[0]}
                        author={post.author.username}
                        date={post.created_at}
                        comments={post.comments}
                        likes={post.likes}
                        onClick={() => handlePostClick(post.id)}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Правая колонка */}
          <Box sx={{ flex: '0 0 300px', display: { xs: 'none', md: 'block' } }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Темы</Typography>
              <List>
                {topics.map((topic) => (
                  <ListItemButton 
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.category)}
                  >
                    <ListItemIcon>
                      {TOPIC_ICONS[topic.category]}
                    </ListItemIcon>
                    <ListItemText 
                      primary={topic.name}
                      secondary={`${getCategoryCount(topic.category)} ${getPublicationWord(getCategoryCount(topic.category))}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 