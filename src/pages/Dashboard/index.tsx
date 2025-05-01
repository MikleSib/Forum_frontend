import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, Tabs, Tab, Paper, Divider, Chip, InputBase, Grid, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
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
      {/* Хедер */}
      <Box className={styles.dashboardHeader}>
        {/* Верхняя часть шапки */}
        <div className={styles.headerContent}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <div className={styles.logoIcon}></div>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" className={styles.headerTitle}>
                Рыболовный форум
              </Typography>
              <Typography variant="body1" className={styles.headerSubtitle}>
                Сообщество увлеченных рыбалкой
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            width: { xs: '100%', sm: 'auto' } 
          }}>
            
            {isAuth ? (
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                width: '100%',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button 
                  variant="contained"
                  className={styles.buttonNew}
                  startIcon={<AddIcon />}
                  onClick={handleCreatePost}
                >
                  Создать пост
                </Button>
                <Button 
                  variant="contained"
                  className={styles.buttonProfile}
                  href="/profile"
                >
                  Профиль
                </Button>
              </Box>
            ) : (
              <Button 
                variant="contained"
                className={styles.buttonNew}
                onClick={handleLogin}
                sx={{ width: '100%' }}
              >
                Войти
              </Button>
            )}
          </Box>
        </div>
        
        {/* Нижняя часть шапки с навигацией */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 2, md: 0 }
        }}>
          <div className={styles.headerNavigation}>
            <a 
              href="/" 
              className={`${styles.navLink} ${styles.activeNavLink}`}
              onClick={handleNavClick('/')}
            >
              <FeedIcon sx={{ fontSize: 18 }} />
              Главная
            </a>
            <a 
              href="/news" 
              className={styles.navLink}
              onClick={handleNavClick('/news')}
            >
              <NewspaperIcon sx={{ fontSize: 18 }} />
              Новости
            </a>

          </div>
          
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.posts}</span>
              <span className={styles.statLabel}>постов</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.users}</span>
              <span className={styles.statLabel}>участников</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.newToday}</span>
              <span className={styles.newLabel}>новых сегодня</span>
            </div>
          </div>
        </Box>
      </Box>
      
      {/* Основной контент */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, 
          gap: { xs: 2, md: 3 } 
        }}>
          {/* Левая колонка */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Вкладки */}
            <Paper className={styles.tabsContainer} elevation={0}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="dashboard tabs"
                variant="fullWidth"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'var(--text-dark)',
                    transition: 'all 0.3s',
                    py: { xs: 1.5, sm: 2 },
                    '&:hover': {
                      color: 'var(--primary-color)',
                      backgroundColor: 'rgba(0, 88, 122, 0.04)',
                    },
                  },
                  '& .Mui-selected': {
                    color: 'var(--primary-color) !important',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'var(--primary-color)',
                    height: 3,
                  },
                }}
              >
                <Tab 
                  icon={<FeedIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />} 
                  label="Лента" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<MapIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />} 
                  label="Карта рыболовных мест" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<DirectionsBoatIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />} 
                  label="Рыбалка" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Контент на вкладках */}
            <Paper className={styles.postsContainer} elevation={0}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  gap: { xs: 2, sm: 0 },
                  mb: 3 
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    Последние публикации
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <Chip 
                      icon={<TrendingUpIcon />} 
                      label="Популярные" 
                      variant="outlined" 
                      sx={{ 
                        color: 'var(--primary-color)', 
                        borderColor: 'var(--primary-color)',
                        flex: { xs: 1, sm: 'none' }
                      }}
                    />
                    <Chip 
                      icon={<FiberNewIcon />} 
                      label="Новые" 
                      color="primary" 
                      sx={{ 
                        backgroundColor: 'var(--primary-color)',
                        flex: { xs: 1, sm: 'none' }
                      }}
                    />
                  </Box>
                </Box>
                
                {loading ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'var(--text-dark)', opacity: 0.7 }}>
                      Загрузка постов...
                    </Typography>
                  </Box>
                ) : error ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                      {error}
                    </Typography>
                  </Box>
                ) : posts.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'var(--text-dark)', opacity: 0.7 }}>
                      Посты не найдены
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {posts.map((post) => (
                      <PostCard 
                        key={post.id}
                        title={post.title} 
                        content={post.content} 
                        author={post.author.username} 
                        date={post.created_at} 
                        imageUrl={post.images[0]}
                        comments={post.comments}
                        likes={post.likes}
                        onClick={() => handlePostClick(post.id)}
                      />
                    ))}
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ py: 15, textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 60, color: 'var(--primary-color)', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h5" align="center" sx={{ color: 'var(--text-dark)', opacity: 0.7 }}>
                    Карта рыболовных мест будет доступна в ближайшее время
                  </Typography>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ py: 15, textAlign: 'center' }}>
                  <DirectionsBoatIcon sx={{ fontSize: 60, color: 'var(--primary-color)', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h5" align="center" sx={{ color: 'var(--text-dark)', opacity: 0.7 }}>
                    Раздел "Рыбалка" находится в разработке
                  </Typography>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
          
          {/* Правая колонка (сайдбар) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className={styles.sidebarContainer}>
              <Paper className={styles.sidebarPanel} elevation={0}>
                <Typography variant="h5" className={styles.sidebarTitle}>
                  Популярные новости
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  {topics.map((topic) => (
                    <ListItem 
                      key={topic.id} 
                      disablePadding
                      sx={{ 
                        mb: 1.5,
                        '&:hover': {
                          transform: 'translateX(4px)',
                          transition: 'transform 0.2s ease-in-out'
                        }
                      }}
                    >
                      <ListItemButton 
                        onClick={() => handleTopicClick(topic.category)}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 88, 122, 0.04)',
                            borderColor: 'var(--primary-color)',
                            boxShadow: '0 2px 8px rgba(0, 88, 122, 0.1)',
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 2,
                          width: '100%'
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 88, 122, 0.08)',
                          }}>
                            {TOPIC_ICONS[topic.category]}
                          </Box>
                          <ListItemText 
                            primary={
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: 'var(--text-dark)',
                                  fontSize: '1rem'
                                }}
                              >
                                {topic.name}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                mt: 0.5
                              }}>
                                <Chip 
                                  size="small" 
                                  label={(getCategoryCount(topic.category) || 0).toString()}
                                  sx={{ 
                                    backgroundColor: getCategoryCount(topic.category) > 0 
                                      ? 'var(--secondary-color)' 
                                      : 'rgba(0, 0, 0, 0.38)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    height: 24,
                                    minWidth: 32,
                                    '& .MuiChip-label': {
                                      px: 1.5,
                                      fontSize: '0.875rem'
                                    }
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {getPublicationWord(getCategoryCount(topic.category))}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </div>
            
            <Paper className={styles.sidebarPanel} elevation={0}>
              <Typography variant="h5" className={styles.sidebarTitle}>
                Активность
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  Последняя активность
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                  Сегодня, 10:23
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip size="small" label={`Всего постов: ${stats.posts}`} variant="outlined" />
                <Chip size="small" label={`Пользователей: ${stats.users}`} variant="outlined" />
                <Chip size="small" label={`Новых сегодня: ${stats.newToday}`} variant="outlined" />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 