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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
  background: 'var(--card-bg)',
  border: '1px solid #eef2f6',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
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
  const [showMore, setShowMore] = useState(false);
  
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

  // Обработчик перехода к посту
  const handleGoToPost = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledCard
      className={styles.postCard}
      onClick={isMobile ? onClick : undefined}
      sx={{ cursor: isMobile && onClick ? 'pointer' : 'default' }}
    >
      <CardContent className={styles.postCardContent}>
        {/* Блок пользователя */}
        <Box className={styles.postCardUser}>
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
            <Typography variant="subtitle2" className={styles.postCardUserName}>{author}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'rgba(44, 51, 51, 0.6)' }} />
              <Typography className={styles.postCardDate}>{formatDate(date)}</Typography>
            </Box>
          </Box>
        </Box>
        {/* Заголовок */}
        <h1
          className={styles.postCardTitleH1}
          role="button"
          tabIndex={0}
          aria-label="Открыть пост"
          onClick={handleGoToPost}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleGoToPost(e); }}
          style={{ cursor: 'pointer' }}
        >
          {title}
        </h1>
        {/* Описание */}
        <Box sx={{ position: 'relative' }}>
          <div
            className={showMore ? styles.postCardExcerpt : styles.postCardExcerptClamp}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
          {!showMore && (
            <span className={styles.postCardExcerptGradient}></span>
          )}
        </Box>
        {/* Кнопка показать полностью */}
        {(cleanContent.length > 200) && (
          !showMore ? (
            <button
              className={styles.showMoreBtn}
              onClick={e => { e.stopPropagation(); setShowMore(true); }}
            >
              показать полностью...
            </button>
          ) : (
            <button
              className={styles.showMoreBtn}
              onClick={e => { e.stopPropagation(); setShowMore(false); }}
            >
              скрыть
            </button>
          )
        )}
        {/* Фото (если есть) */}
        {images.length > 0 && (
          <Box className={styles.postCardImagesRow}>
            {images.map((image, index) => (
              <Box
                key={index}
                className={images.length === 1 ? `${styles.postCardImageWrapper} ${styles.singleImage}` : styles.postCardImageWrapper}
              >
                <CachedImage
                  src={getImagePath(image)}
                  baseUrl={IMAGE_BASE_URL}
                  alt={`${title} - изображение ${index + 1}`}
                  imageId={getImageId(image)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        )}
        {/* Лайки, комментарии, кнопка 'Читать' */}
        <Box className={styles.postCardFooter}>
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
              onClick={handleGoToPost}
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