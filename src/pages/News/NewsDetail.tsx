import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  CircularProgress,
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FishingIcon from '@mui/icons-material/Phishing';
import PlaceIcon from '@mui/icons-material/Place';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { NEWS_CATEGORIES, NewsItem, NewsContent, NewsCategory } from '../../shared/types/news.types';
import { newsApi } from '../../services/newsApi';
import CachedImage from '../../components/CachedImage';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = React.useState(false);

  // Получаем категорию, из которой пришли
  const getBackUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const fromCategory = searchParams.get('from');
    
    // Если указана категория, возвращаемся в нее, иначе просто на страницу новостей
    if (fromCategory) {
      return `/news?category=${fromCategory}`;
    }
    
    // Если категория не указана в URL, проверяем localStorage
    const savedCategory = localStorage.getItem('selectedNewsCategory');
    if (savedCategory) {
      return `/news?category=${savedCategory}`;
    }
    
    // Если нигде нет информации о категории, просто возвращаемся на главную страницу новостей
    return '/news';
  };

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

  // Извлечение данных о дисциплине, месте и дате для категории "События"
  const extractEventData = (): { discipline?: string; place?: string; date?: string } => {
    if (!news || news.category !== NewsCategory.EVENTS) {
      return {};
    }
    
    // Ищем конкретные элементы массива contents для каждого типа информации
    // Согласно API, contents[1] - дисциплина, contents[2] - место, contents[3] - дата
    const disciplineContent = news.contents.find(content => content.order === 1);
    const placeContent = news.contents.find(content => content.order === 2);
    const dateContent = news.contents.find(content => content.order === 3);
    
    // Извлекаем чистый текст, удаляя emoji если они есть
    const extractCleanText = (content?: string): string => {
      if (!content) return '';
      // Удаляем emoji и ключевые слова из строки
      return content
        .replace(/🎣\s*Дисциплина:\s*/, '')
        .replace(/🌍\s*Место:\s*/, '')
        .replace(/📅\s*Дата:\s*/, '')
        .replace(/Дисциплина:\s*/, '')
        .replace(/Место:\s*/, '')
        .replace(/Дата:\s*/, '')
        .trim();
    };
    
    return {
      discipline: extractCleanText(disciplineContent?.content),
      place: extractCleanText(placeContent?.content),
      date: extractCleanText(dateContent?.content)
    };
  };

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
            <CachedImage
              src={content.content}
              alt="News content"
              style={{
                width: '100%',
                maxHeight: '600px',
                objectFit: 'contain'
              }}
              placeholderSrc="/images/placeholder-image.jpg"
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

  const eventData = extractEventData();
  const isEvent = news.category === NewsCategory.EVENTS;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(getBackUrl())}
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
          
          {/* Блок с информацией о событии (только для категории События) */}
          {isEvent && (Object.keys(eventData).length > 0) && (
            <Box 
              sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Grid container spacing={3}>
                {eventData.place && (
                  <Grid size={{xs:12, sm:4}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <PlaceIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Место
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {eventData.place}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {eventData.date && (
                  <Grid size={{xs:12, sm:4}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <DateRangeIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Дата
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {eventData.date}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {eventData.discipline && (
                  <Grid size={{xs:12, sm:4}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <FishingIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Дисциплина
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {eventData.discipline}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Отображаем контент с учетом специфики для событий */}
          {isEvent 
            ? news.contents
                .filter(content => content.order === 0) // Для событий показываем только основной контент
                .map((content: NewsContent, index: number) => (
                  <Box key={index}>
                    {renderContent(content)}
                  </Box>
                ))
            : news.contents
                .sort((a: NewsContent, b: NewsContent) => a.order - b.order)
                .map((content: NewsContent, index: number) => (
                  <Box key={index}>
                    {renderContent(content)}
                  </Box>
                ))
          }

          {/* Информация об авторе (не отображается для категории События) */}
          {news.author && !isEvent && (
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