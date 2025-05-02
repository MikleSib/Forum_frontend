import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { PostImage, Post } from '../shared/types/post.types';
import styles from '../pages/Dashboard/Dashboard.module.css';

interface PostCardPropsDetailed {
  title: string;
  content: string;
  imageUrl?: PostImage;
  author: string;
  date: string;
  comments?: any[];
  likes?: any[];
  onClick?: () => void;
  post?: never;
}

interface PostCardPropsUnified {
  post: Post;
  onClick?: () => void;
  title?: never;
  content?: never;
  imageUrl?: never;
  author?: never;
  date?: never;
  comments?: never;
  likes?: never;
}

type PostCardProps = PostCardPropsDetailed | PostCardPropsUnified;

const StyledCard = styled(Card)(() => ({
  overflow: 'hidden',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  background: 'var(--card-bg)',
  border: '1px solid #eef2f6',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const PostCard: React.FC<PostCardProps> = (props) => {
  // Определяем, какие пропсы мы получили (объект post или отдельные поля)
  const isUnifiedProps = 'post' in props && props.post !== undefined;
  
  // Извлекаем нужные данные в зависимости от типа пропсов
  const {
    title, 
    content, 
    imageUrl, 
    author, 
    date, 
    comments = [], 
    likes = [],
    onClick
  } = isUnifiedProps ? {
    title: props.post.title,
    content: props.post.content,
    imageUrl: props.post.images?.[0],
    author: props.post.author?.username || '',
    date: props.post.created_at,
    comments: props.post.comments || [],
    likes: props.post.likes || [],
    onClick: props.onClick
  } : props as PostCardPropsDetailed;
  
  // Форматируем URL изображения
  const formatImageUrl = (image: PostImage | undefined) => {
    if (!image || !image.image_url) return '';
    return `https://рыбный-форум.рф${image.image_url}`;
  };

  // Форматируем дату
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Получаем инициалы автора
  const getInitials = (name?: string) => {
    if (!name || name.length === 0) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Очищаем HTML-теги из контента
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const cleanContent = stripHtml(content || '');

  // Обработчик клика на кнопку "Читать"
  const handleReadButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    if (onClick) onClick();
  };

  return (
    <StyledCard className={styles.postCard} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      {imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={formatImageUrl(imageUrl)}
          alt={title}
          sx={{ 
            objectFit: 'cover',
            height: { xs: '160px', sm: '200px' }
          }}
        />
      )}
      <CardContent className={styles.postCardContent}>
        <Typography variant="h6" className={styles.postCardTitle}>
          {title}
        </Typography>
        
        <Typography variant="body2" className={styles.postCardExcerpt}>
          {cleanContent}
        </Typography>
        
        <Box className={styles.postCardFooter}>
          <Box className={styles.postCardAuthor}>
            <Box className={styles.authorAvatar}>
              {getInitials(author)}
            </Box>
            <Box>
              <Typography variant="subtitle2">{author}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'rgba(44, 51, 51, 0.6)' }} />
                <Typography className={styles.postCardDate}>
                  {formatDate(date)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: '8px',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
            mt: { xs: 1, sm: 0 }
          }}>
            <Chip 
              icon={<FavoriteIcon sx={{ fontSize: 16 }} />} 
              label={likes.length > 0 ? likes.length.toString() : "0"} 
              size="small" 
              variant={likes.length > 0 ? "filled" : "outlined"}
              sx={{ 
                borderColor: 'var(--primary-color)', 
                color: likes.length > 0 ? 'white' : 'var(--primary-color)',
                backgroundColor: likes.length > 0 ? 'var(--primary-color)' : 'transparent',
                '& .MuiChip-icon': { color: likes.length > 0 ? 'white' : 'var(--primary-color)' } 
              }}
              onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие события
            />
            <Chip 
              icon={<CommentIcon sx={{ fontSize: 16 }} />} 
              label={comments.length > 0 ? comments.length.toString() : "0"} 
              size="small" 
              variant={comments.length > 0 ? "filled" : "outlined"}
              sx={{ 
                borderColor: 'var(--secondary-color)', 
                color: comments.length > 0 ? 'white' : 'var(--secondary-color)',
                backgroundColor: comments.length > 0 ? 'var(--secondary-color)' : 'transparent',
                '& .MuiChip-icon': { color: comments.length > 0 ? 'white' : 'var(--secondary-color)' } 
              }}
              onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие события
            />
            <Button 
              size="small" 
              sx={{ 
                ml: { xs: 0, sm: 1 }, 
                color: 'var(--primary-color)', 
                borderColor: 'var(--primary-color)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                padding: '2px 8px',
                minWidth: 'auto'
              }}
              variant="outlined"
              onClick={handleReadButtonClick}
            >
              Читать
            </Button>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PostCard; 