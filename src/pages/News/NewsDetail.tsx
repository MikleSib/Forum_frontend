import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Button,
  useTheme,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { NEWS_CATEGORIES, NewsItem, NewsContent, NewsCategory } from '../../shared/types/news.types';
import { newsApi } from '../../services/newsApi';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = React.useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await newsApi.getNewsById(Number(id));
        setNews(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить новость');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const renderContent = (content: NewsContent) => {
    switch (content.type) {
      case 'text':
        return (
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1.1rem',
              lineHeight: 1.8,
              mb: 4
            }}
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        );
      case 'image':
        return (
          <Box sx={{ my: 4, borderRadius: 2, overflow: 'hidden' }}>
            <img
              src={content.content}
              alt="News content"
              style={{
                width: '100%',
                maxHeight: '600px',
                objectFit: 'contain'
              }}
            />
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ my: 4, borderRadius: 2, overflow: 'hidden' }}>
            <video
              controls
              style={{
                width: '100%',
                maxHeight: '600px'
              }}
            >
              <source src={content.content} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !news) {
    return (
      <Container>
        <Typography color="error">{error || 'Новость не найдена'}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/news')}
          sx={{ mb: 4 }}
        >
          Назад к новостям
        </Button>

        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="overline" 
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              {NEWS_CATEGORIES[news.category].title}
            </Typography>
            
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              {news.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {format(new Date(news.created_at), 'd MMMM yyyy', { locale: ru })}
            </Typography>
          </Box>

          {news.contents
            .sort((a: NewsContent, b: NewsContent) => a.order - b.order)
            .map((content: NewsContent, index: number) => (
              <Box key={index}>
                {renderContent(content)}
              </Box>
            ))}

          {news.author && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={news.author.avatar}
                alt={news.author.name}
                sx={{ 
                  width: 48,
                  height: 48,
                  mr: 2,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {news.author.name}
                </Typography>
              </Box>
            </Box>
          )}

          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ 
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 3
            }}
          >
            <IconButton 
              onClick={() => setIsLiked(!isLiked)}
              color={isLiked ? 'primary' : 'default'}
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {news.likes || 0}
            </Typography>

            <IconButton>
              <ShareIcon />
            </IconButton>

            <IconButton>
              <BookmarkBorderIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default NewsDetail; 