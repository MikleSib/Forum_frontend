import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Grid, IconButton, Badge, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import { PostImage, Post } from '../shared/types/post.types';
import styles from '../pages/Dashboard/Dashboard.module.css';
import CachedImage from './CachedImage';
import { IMAGE_BASE_URL } from '../config/api';
import { likePost, unlikePost } from '../services/api';
import { userStore } from '../shared/store/userStore';

interface PostCardPropsDetailed {
  title: string;
  content: string;
  imageUrl?: PostImage;
  images?: PostImage[];
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
  images?: never;
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
  
  // Получаем массив изображений
  const images = isUnifiedProps 
    ? (props.post.images || []).slice(0, 3) // Ограничиваем максимум 3 изображения
    : props.images || (imageUrl ? [imageUrl] : []);
  
  // Состояние для отслеживания лайка
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [isAuth] = useState(!!localStorage.getItem('access_token'));
  
  // Проверяем, поставил ли текущий пользователь лайк
  useEffect(() => {
    if (isAuth && 'post' in props && props.post) {
      const currentUserId = userStore.user?.id;
      const userLiked = props.post.likes?.some(like => like.user_id === currentUserId);
      setIsLiked(!!userLiked);
      setLikesCount(props.post.likes?.length || 0);
    }
  }, [isAuth, props]);

  // Обработчик лайка
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу поста
    
    if (!isAuth || isLikeProcessing || !('post' in props) || !props.post) return;
    
    try {
      setIsLikeProcessing(true);
      
      const postId = props.post.id.toString();
      const success = isLiked ? await unlikePost(postId) : await likePost(postId);
      
      if (success) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      console.error('Ошибка при обработке лайка:', err);
    } finally {
      setIsLikeProcessing(false);
    }
  };
  
  // Форматируем URL изображения для извлечения только пути
  const getImagePath = (image: PostImage | undefined) => {
    if (!image || !image.image_url) return '';
    return image.image_url;
  };

  // Получаем ID изображения для кеширования
  const getImageId = (image: PostImage | undefined) => {
    if (!image || !image.id) return undefined;
    return image.id;
  };

  // Форматируем дату
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Получаем часовой пояс пользователя
    const userTimezoneOffsetMinutes = new Date().getTimezoneOffset();
    
    // Преобразуем из UTC в местное время пользователя
    const localDate = new Date(date.getTime() - userTimezoneOffsetMinutes * 60000);
    
    return localDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Функция для логирования аватара
  const getAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('PostCard Avatar path:', avatarPath);
      console.log('PostCard Full avatar URL:', `${IMAGE_BASE_URL}/${avatarPath}`);
      return `${IMAGE_BASE_URL}/${avatarPath}`;
    }
    return '';
  };

  // Функция для получения URL аватара в нижней карточке
  const getFooterAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('PostCard Footer Avatar path:', avatarPath);
      console.log('PostCard Footer Full URL:', `${IMAGE_BASE_URL}/${avatarPath}`);
      return `${IMAGE_BASE_URL}/${avatarPath}`;
    }
    return undefined;
  };

  return (
    <StyledCard className={styles.postCard} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Отображение изображений в блочном формате */}
      {images.length > 0 && (
        <Box sx={{ position: 'relative' }}>
          {images.length === 1 ? (
            <Box
              sx={{ 
                height: { xs: '200px', sm: '600px' },
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CachedImage
                src={getImagePath(images[0])}
                baseUrl={IMAGE_BASE_URL}
                alt={title}
                imageId={getImageId(images[0])}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ) : (
            <Grid container spacing={0.5} sx={{ mt: 0 }}>
              {images.map((image, index) => (
                <Grid 
                  size={{xs: images.length === 2 ? 6 : 4}}
                  key={index}
                >
                  <Box 
                    sx={{
                      height: { xs: '150px', sm: '600px' },
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CachedImage
                      src={getImagePath(image)}
                      baseUrl={IMAGE_BASE_URL}
                      alt={`${title} - изображение ${index + 1}`}
                      imageId={getImageId(image)}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: index === 0 ? '12px 0 0 0' : 
                                  (index === 1 && images.length === 2) ? '0 12px 0 0' :
                                  (index === 1) ? '0 0 0 0' :
                                  '0 12px 0 0'
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
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
              {isUnifiedProps && props.post.author.avatar ? (
                <img 
                  src={getFooterAvatarUrl(props.post.author.avatar)} 
                  alt={author} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(author)
              )}
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
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'flex-end',
            mt: { xs: 1, sm: 0 }
          }}>
            <Tooltip title={isAuth ? (isLiked ? "Убрать лайк" : "Нравится") : "Войдите, чтобы поставить лайк"}>
              <IconButton 
                size="small"
                color={isLiked ? "primary" : "default"}
                onClick={handleLikeToggle}
                disabled={!isAuth || isLikeProcessing}
                sx={{ 
                  p: 0.5,
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <Badge 
                  badgeContent={likesCount > 0 ? likesCount : 0} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '16px',
                      minWidth: '16px',
                      padding: '0 4px'
                    }
                  }}
                >
                  {isLiked ? 
                    <FavoriteIcon sx={{ color: 'var(--primary-color)', fontSize: 18 }} /> : 
                    <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                  }
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Комментарии">
              <IconButton 
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
                sx={{ 
                  p: 0.5,
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <Badge 
                  badgeContent={comments.length > 0 ? comments.length : 0} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '16px',
                      minWidth: '16px',
                      padding: '0 4px'
                    }
                  }}
                >
                  <CommentIcon sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Button 
              size="small" 
              sx={{ 
                ml: { xs: 0, sm: 1 }, 
                minWidth: 0, 
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                '&:hover': {
                  borderColor: 'var(--primary-color)',
                  backgroundColor: 'rgba(0, 82, 204, 0.04)',
                }
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