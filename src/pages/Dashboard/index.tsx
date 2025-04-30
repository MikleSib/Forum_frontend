import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Tabs, Tab, Paper, Divider, Chip, InputBase } from '@mui/material';
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
import styles from './Dashboard.module.css';
import { getPosts } from '../../services/api';
import { Post } from '../../shared/types/post.types';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);

    // Загрузка постов при монтировании компонента
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsData = await getPosts();
        setPosts(postsData);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const mockTopics = [
    { id: 1, name: "Пресноводная рыбалка", count: 24 },
    { id: 2, name: "Морская рыбалка", count: 18 },
    { id: 3, name: "Снасти и оборудование", count: 15 },
    { id: 4, name: "Лодки и катера", count: 12 },
    { id: 5, name: "Рыболовные соревнования", count: 8 }
  ];

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1600px', p: 0 }}>
      {/* Хедер */}
      <Box className={styles.dashboardHeader}>
        {/* Верхняя часть шапки */}
        <div className={styles.headerContent}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <div className={styles.logoIcon}></div>
            <Box>
              <Typography variant="h3" className={styles.headerTitle}>
                Рыболовный форум
              </Typography>
              <Typography variant="body1" className={styles.headerSubtitle}>
                Сообщество увлеченных рыбалкой
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box className={styles.searchInput}>
              <SearchIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }} />
              <InputBase
                placeholder="Поиск по форуму..."
                inputProps={{ 'aria-label': 'поиск' }}
                sx={{ color: 'white' }}
              />
            </Box>
            
            {isAuth ? (
              <Button 
                variant="contained"
                className={styles.buttonProfile}
                href="/profile"
              >
                Профиль
              </Button>
            ) : (
              <Button 
                variant="contained"
                className={styles.buttonNew}
                onClick={handleLogin}
              >
                Войти
              </Button>
            )}
          </Box>
        </div>
        
        {/* Нижняя часть шапки с навигацией */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className={styles.headerNavigation}>
            <a href="#" className={`${styles.navLink} ${styles.activeNavLink}`}>
              <FeedIcon sx={{ fontSize: 18 }} />
              Главная
            </a>
            <a href="#" className={styles.navLink}>
              <NewspaperIcon sx={{ fontSize: 18 }} />
              Новости
            </a>
            <a href="#" className={styles.navLink}>
              <EmojiEventsIcon sx={{ fontSize: 18 }} />
              Соревнования
            </a>
            <a href="#" className={styles.navLink}>
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              О нас
            </a>
            <a href="#" className={styles.navLink}>
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
              Помощь
            </a>
          </div>
          
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>127</span>
              <span className={styles.statLabel}>постов</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>45</span>
              <span className={styles.statLabel}>участников</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>3</span>
              <span className={styles.newLabel}>новых сегодня</span>
            </div>
          </div>
        </Box>
      </Box>
      
      {/* Основной контент */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, gap: 3 }}>
          {/* Левая колонка */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Вкладки */}
            <Paper className={styles.tabsContainer} elevation={0}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="dashboard tabs"
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'var(--text-dark)',
                    transition: 'all 0.3s',
                    py: 2,
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
                  icon={<FeedIcon />} 
                  label="Лента" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<MapIcon />} 
                  label="Карта рыболовных мест" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<DirectionsBoatIcon />} 
                  label="Рыбалка" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Контент на вкладках */}
            <Paper className={styles.postsContainer} elevation={0}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    Последние публикации
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<TrendingUpIcon />} 
                      label="Популярные" 
                      variant="outlined" 
                      sx={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                    />
                    <Chip 
                      icon={<FiberNewIcon />} 
                      label="Новые" 
                      color="primary" 
                      sx={{ backgroundColor: 'var(--primary-color)' }}
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
                  Популярные темы
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box>
                  {mockTopics.map((topic) => (
                    <Box key={topic.id} className={styles.topicItem}>
                      <Box sx={{ flexGrow: 1 }}>
                        {topic.name}
                      </Box>
                      <Chip 
                        size="small" 
                        label={topic.count} 
                        sx={{ 
                          backgroundColor: 'var(--secondary-color)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
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
                <Chip size="small" label="Всего постов: 127" variant="outlined" />
                <Chip size="small" label="Пользователей: 45" variant="outlined" />
                <Chip size="small" label="Новых сегодня: 3" variant="outlined" />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 