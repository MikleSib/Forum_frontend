import React from 'react';
import { Paper, Typography, Box, Avatar, Chip } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import FishingIcon from '@mui/icons-material/Phishing';
import PlaceIcon from '@mui/icons-material/Place';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { NewsItem, NewsContent, NewsCategory, NEWS_CATEGORIES } from '../shared/types/news.types';
import CachedImage from './CachedImage';
import { formatLocalDate } from '../utils/dateUtils';

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  // Получаем превью изображения из первого контента с типом "image"
  const getImagePreview = (): string | undefined => {
    const imageContent = news.contents.find(content => content.type === 'image');
    return imageContent?.content;
  };

  // Получаем текстовое превью
  const getTextPreview = (): string => {
    // Для категории "События" показываем только основной контент (order === 0)
    if (news.category === NewsCategory.EVENTS) {
      const mainContent = news.contents.find(content => content.order === 0);
      if (mainContent && mainContent.content) {
        const plainText = mainContent.content.replace(/<[^>]+>/g, '');
        return plainText.length > 150 
          ? plainText.slice(0, 150) + '...' 
          : plainText;
      }
    } else {
      // Для других категорий ищем любой текстовый контент
      const textContent = news.contents.find(content => content.type === 'text');
      if (textContent) {
        const plainText = textContent.content.replace(/<[^>]+>/g, '');
        return plainText.length > 150 
          ? plainText.slice(0, 150) + '...' 
          : plainText;
      }
    }
    return 'Нет текстового содержимого';
  };
  
  // Извлечение данных о дисциплине, месте и дате для категории "События"
  const extractEventData = (): { discipline?: string; place?: string; date?: string } => {
    if (news.category !== NewsCategory.EVENTS) {
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
  
  const imageUrl = getImagePreview();
  const eventData = extractEventData();
  const isEvent = news.category === NewsCategory.EVENTS;

  return (
    <Paper 
      sx={{ 
        p: 2,
        cursor: 'pointer',
        '&:hover': { 
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out'
        },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        position: 'relative'
      }}
      onClick={onClick}
      elevation={1}
    >
      {/* Изображение новости */}
      {imageUrl && (
        <Box sx={{ 
          position: 'relative', 
          height: 200, 
          overflow: 'hidden',
          borderRadius: 1
        }}>
          <CachedImage
            src={imageUrl}
            alt={news.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
            showSkeleton={true}
            skeletonHeight={200}
            placeholderSrc="/images/placeholder-image.svg"
          />
        </Box>
      )}
      
      {/* Метаданные и заголовок */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Показываем тег категории для всех, кроме "Виды рыб" */}
        {news.category !== NewsCategory.FISH_SPECIES && (
          <Chip 
            label={NEWS_CATEGORIES[news.category].title} 
            size="small" 
            sx={{ 
              alignSelf: 'flex-start', 
              mb: 1,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            }} 
          />
        )}
        
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3 }}>
          {news.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: isEvent ? 3 : 2, flex: 1 }}>
          {getTextPreview()}
        </Typography>
        
        {/* Компактное отображение информации о событии - внизу карточки */}
        {isEvent && (
          <Box sx={{ display: 'flex', mt: 'auto', flexWrap: 'wrap', gap: 1 }}>
            {eventData.place && (
              <Chip 
                icon={<PlaceIcon fontSize="small" />} 
                label={`Место: ${eventData.place}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            
            {eventData.date && (
              <Chip 
                icon={<DateRangeIcon fontSize="small" />} 
                label={`Дата: ${eventData.date}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            
            {eventData.discipline && (
              <Chip 
                icon={<FishingIcon fontSize="small" />} 
                label={`Дисциплина: ${eventData.discipline}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NewsCard; 