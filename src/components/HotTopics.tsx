import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Avatar, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ForumIcon from '@mui/icons-material/Forum';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface Topic {
  id: number;
  title: string;
  author_username: string;
  author_avatar: string;
  views_count: number;
  posts_count: number;
  tags: string[];
}

const HotTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // API запрос для получения горячих тем
    fetch('https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/api/forum/active-topics?limit=5')
      .then(response => response.json())
      .then(data => {
        console.log('Данные горячих тем получены:', data);
        setTopics(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка при получении горячих тем:', error);
        // Пример данных, если API недоступен
        const testData = [
          {
            id: 8,
            title: "Мужики первый раз на рыбалке, подскажите что подойдет щас весной для Щучки?",
            author_username: "Mishatrof007@mail.ru",
            author_avatar: "/files/374211c0-838e-433e-850c-ac195b0f2ae7",
            views_count: 17,
            posts_count: 1,
            tags: ["Рыбалка", "Снасти"]
          }
        ];
        setTopics(testData);
        setLoading(false);
      });
  }, []);

  const handleTopicClick = (id: number) => {
    navigate(`/forum/topic/${id}`);
  };

  if (loading) {
    return (
      <Paper sx={{ 
        p: 2, 
        mb: 0, 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Горячие темы
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} thickness={4} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ 
        p: 2, 
        mb: 0, 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Горячие темы
          </Typography>
        </Box>
        <Typography variant="body2" color="error" sx={{ p: 2 }}>{error}</Typography>
      </Paper>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <Paper sx={{ 
        p: 2, 
        mb: 0, 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Горячие темы
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ p: 2 }}>Нет активных тем</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 2, 
      mb: 0, 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1.5, 
        pb: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Горячие темы
        </Typography>
      </Box>
      
      <List sx={{ width: '100%', p: 0 }}>
        {topics.map((topic, index) => (
          <React.Fragment key={topic.id}>
            {index > 0 && <Divider component="li" variant="middle" />}
            <ListItem 
              alignItems="flex-start" 
              onClick={() => handleTopicClick(topic.id)}
              sx={{ 
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateX(4px)'
                },
                p: 1.5,
                pl: 2
              }}
            >
              {/* Индикатор активной темы */}
              <Box sx={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                width: '4px', 
                bgcolor: 'primary.main',
                opacity: 0.7,
                borderRadius: '4px'
              }}></Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Avatar 
                    src={topic.author_avatar ? `https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai${topic.author_avatar}` : undefined}
                    alt={topic.author_username}
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      mr: 1,
                      border: '2px solid rgba(0,0,0,0.08)'
                    }}
                  >
                    {topic.author_username?.[0]}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {topic.author_username}
                  </Typography>
                  
                  {/* Иконка горячей темы при большом количестве просмотров */}
                  {topic.views_count > 10 && (
                    <Box ml="auto" display="flex" alignItems="center">
                      <WhatshotIcon sx={{ color: 'orange', fontSize: '1.1rem' }} />
                    </Box>
                  )}
                </Box>
                
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.7,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {topic.title}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary', 
                  fontSize: '0.75rem' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <VisibilityIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="caption">{topic.views_count}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ForumIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="caption">{topic.posts_count}</Typography>
                  </Box>
                </Box>
                
                {topic.tags && topic.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.7, mt: 0.8, flexWrap: 'wrap' }}>
                    {topic.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.68rem',
                          borderRadius: '4px',
                          '& .MuiChip-label': { px: 0.8 }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default HotTopics; 