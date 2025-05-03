import React from 'react';
import { Paper, Typography, Box, Avatar, Chip } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { NewsItem, NewsContent } from '../shared/types/news.types';
import CachedImage from './CachedImage';

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  // Базовый URL для изображений
  const baseUrl = 'https://рыбный-форум.рф';

  // Получаем превью изображения из первого контента с типом "image"
  const getImagePreview = (): string | undefined => {
    const imageContent = news.contents.find(content => content.type === 'image');
    return imageContent?.content;
  };

  // Получаем текстовое превью
  const getTextPreview = (): string => {
    const textContent = news.contents.find(content => content.type === 'text');
    if (textContent) {
      const plainText = textContent.content.replace(/<[^>]+>/g, '');
      return plainText.length > 150 
        ? plainText.slice(0, 150) + '...' 
        : plainText;
    }
    return 'Нет текстового содержимого';
  };

  const imageUrl = getImagePreview();

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
            baseUrl={baseUrl}
            alt={news.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            placeholderSrc="/images/placeholder-image.jpg"
          />
        </Box>
      )}
      
      {/* Метаданные и заголовок */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Chip 
          label={news.category} 
          size="small" 
          sx={{ 
            alignSelf: 'flex-start', 
            mb: 1,
            backgroundColor: 'primary.light',
            color: 'primary.contrastText'
          }} 
        />
        
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.3 }}>
          {news.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
          {getTextPreview()}
        </Typography>
        
        {/* Информация об авторе и дате */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
          <Avatar 
            src={news.author?.avatar} 
            sx={{ width: 32, height: 32 }}
          >
            {news.author?.name?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={500}>
              {news.author?.name || 'Рыбный форум'}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              {format(new Date(news.created_at), 'dd MMMM yyyy', { locale: ru })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default NewsCard; 