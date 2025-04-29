import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import PostCard from '../../components/PostCard';
import AddIcon from '@mui/icons-material/Add';
import styles from './Dashboard.module.css';
import { getPosts } from '../../services/api';
import { Post } from '../../shared/types/post.types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);

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

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Верхняя панель */}
        <Grid size={12}>
          <div className={styles.dashboardHeader}>
            <div className={styles.headerContent}>
              <Typography variant="h4" className={styles.headerTitle}>
                Лента новостей о рыбалке
              </Typography>
              <Box>
                {isAuth ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<AddIcon />}
                      className={styles.buttonNew}
                      onClick={handleCreatePost}
                      sx={{ mr: 2 }}
                    >
                      Новый пост
                    </Button>
                    <Button 
                      variant="outlined"
                      className={styles.buttonProfile}
                      href="/profile"
                    >
                      Профиль
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary"
                    className={styles.buttonNew}
                    onClick={handleLogin}
                  >
                    Войти
                  </Button>
                )}
              </Box>
            </div>
          </div>
        </Grid>

        {/* Основная лента постов */}
        <Grid size={{ xs: 12, md: 8 }} className={styles.postsContainer}>
          {loading ? (
            <Typography variant="body1">Загрузка постов...</Typography>
          ) : error ? (
            <Typography variant="body1" color="error">{error}</Typography>
          ) : posts.length === 0 ? (
            <Typography variant="body1">Посты не найдены</Typography>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                title={post.title} 
                content={post.content} 
                author={post.author.username} 
                date={post.created_at} 
                imageUrl={post.images[0]} 
              />
            ))
          )}
        </Grid>

        {/* Боковая панель */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className={styles.sidebarContainer}>
            <div className={styles.sidebarPanel}>
              <Typography variant="h6" className={styles.sidebarTitle}>
                Популярные темы
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">Категории временно недоступны</Typography>
              </Box>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 