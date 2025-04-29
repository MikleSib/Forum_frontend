import React from 'react';
import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material';
import PostCard from '../../components/PostCard';
import AddIcon from '@mui/icons-material/Add';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  // Временные данные для демонстрации
  const posts = [
    {
      title: 'Удачная рыбалка на Волге',
      content: 'Сегодня удалось поймать несколько крупных судаков. Поделюсь своим опытом и секретами успешной рыбалки на этой реке...',
      author: {
        name: 'Иван Петров',
        avatar: '/avatars/ivan.jpg'
      },
      date: '2024-04-30',
      imageUrl: '/images/fishing1.jpg'
    },
    {
      title: 'Советы по выбору снастей',
      content: 'Делюсь опытом выбора снастей для начинающих рыбаков. Какие удочки лучше выбрать, как подобрать леску и крючки...',
      author: {
        name: 'Мария Иванова',
        avatar: '/avatars/maria.jpg'
      },
      date: '2024-04-29',
      imageUrl: '/images/fishing2.jpg'
    }
  ];

  const topics = [
    'Рыбалка на Волге', 
    'Снасти для начинающих', 
    'Зимняя рыбалка', 
    'Секреты успешной рыбалки',
    'Морская рыбалка'
  ];

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
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  className={styles.buttonNew}
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
              </Box>
            </div>
          </div>
        </Grid>

        {/* Основная лента постов */}
        <Grid size={{ xs: 12, md: 8 }} className={styles.postsContainer}>
          {posts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </Grid>

        {/* Боковая панель */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className={styles.sidebarContainer}>
            <div className={styles.sidebarPanel}>
              <Typography variant="h6" className={styles.sidebarTitle}>
                Популярные темы
              </Typography>
              <Box sx={{ mt: 3 }}>
                {topics.map((topic, index) => (
                  <div key={index} className={styles.topicItem}>
                    {topic}
                  </div>
                ))}
              </Box>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 