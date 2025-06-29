import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Avatar, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import styles from './PostCard.module.css';
import type { Post } from '../../shared/types/post.types';
import CachedImage from '../CachedImage';
import { formatLocalDate } from '../../utils/dateUtils';

interface Props {
  post: Post;
  onClick?: () => void;
}

const PostCard = ({ post, onClick }: Props): React.ReactElement => {
  // Функция для декодирования HTML-сущностей
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Функция для получения инициалов пользователя
  const getInitials = (name?: string): string => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  };

  // Базовый URL для изображений
  const baseUrl = 'https://рыболовный-форум.рф';

  // Функция для логирования аватара
  const getAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('PostCard Avatar path:', avatarPath);
      console.log('PostCard Full avatar URL:', `${baseUrl}/${avatarPath}`);
      return `${baseUrl}/${avatarPath}`;
    }
    return '';
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Функция для обрезки текста контента
  const truncateContent = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return content;
    
    const truncated = textContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  return (
    <Card 
      className={styles.postCard} 
      onClick={onClick} 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:active': isMobile ? {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s ease'
        } : {}
      }}
    >
      {post.images && post.images.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 0.5 : 1,
            overflowX: isMobile ? 'visible' : (post.images.length > 1 ? 'auto' : 'visible'),
            height: isMobile ? 'auto' : (isTablet ? 200 : 240),
            mb: 1,
            background: 'none',
            '&::-webkit-scrollbar': isMobile ? {} : {
              height: 6,
            },
            '&::-webkit-scrollbar-track': isMobile ? {} : {
              background: '#f1f1f1',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': isMobile ? {} : {
              background: '#c1c1c1',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb:hover': isMobile ? {} : {
              background: '#a8a8a8',
            },
          }}
        >
          {post.images.slice(0, isMobile ? 5 : 8).map((img, idx) => (
            <Box
              key={img.image_url + idx}
              sx={{
                minWidth: isMobile ? '100%' : (post.images.length > 1 ? (isTablet ? 200 : 240) : '100%'),
                width: isMobile ? '100%' : (post.images.length > 1 ? (isTablet ? 200 : 240) : '100%'),
                height: isMobile ? 200 : (isTablet ? 200 : 240),
                borderRadius: isMobile ? 1.5 : 2,
                overflow: 'hidden',
                flex: isMobile ? 'none' : (post.images.length > 1 ? '0 0 auto' : '1 1 100%'),
                mr: isMobile ? 0 : (post.images.length > 1 && idx !== post.images.length - 1 ? 1 : 0),
                mb: isMobile ? 0.5 : 0,
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
                position: 'relative',
              }}
            >
              <CachedImage
                src={img.image_url}
                baseUrl={baseUrl}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: isMobile ? 6 : 8,
                  display: 'block',
                }}
                showSkeleton={true}
                skeletonHeight={isMobile ? 200 : isTablet ? 200 : 240}
                placeholderSrc="/placeholder-image.svg"
              />
              {/* Индикатор количества изображений только для десктопа */}
              {!isMobile && post.images.length > 1 && idx === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  +{post.images.length - 1}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
      <CardContent className={styles.postContent}>
        <Box className={styles.authorSection}>
          <Avatar 
            className={styles.avatar}
            src={getAvatarUrl(post.author?.avatar)}
            sx={{
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
            }}
          >
            {!post.author?.avatar && getInitials(post.author?.username)}
          </Avatar>
          <Box className={styles.authorInfo}>
            <Typography 
              className={styles.authorName}
              sx={{
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            >
              {post.author?.username || 'Неизвестный автор'}
            </Typography>
            <Typography 
              className={styles.postDate}
              sx={{
                fontSize: isMobile ? '0.7rem' : '0.8rem',
              }}
            >
              {formatLocalDate(post.created_at)}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="h5" 
          className={styles.postTitle}
          sx={{
            fontSize: isMobile ? '1.2rem' : isTablet ? '1.3rem' : '1.5rem',
            lineHeight: isMobile ? 1.2 : 1.3,
          }}
        >
          {post.title}
        </Typography>

        <div 
          className={styles.postText}
          style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: isMobile ? 1.4 : 1.6,
          }}
          dangerouslySetInnerHTML={{ 
            __html: decodeHtml(isMobile ? truncateContent(post.content, 120) : post.content) 
          }}
        />

        <CardActions 
          className={styles.postActions}
          sx={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? 1.5 : 0,
            padding: isMobile ? '12px 16px 16px 16px' : '0 20px 20px 20px',
            paddingTop: isMobile ? '12px' : '16px',
          }}
        >
          <Box 
            className={styles.actionButtons}
            sx={{
              justifyContent: isMobile ? 'space-around' : 'flex-start',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <IconButton 
              className={styles.actionButton}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                borderRadius: isMobile ? 1 : 0,
                flex: isMobile ? 1 : 'none',
                margin: isMobile ? '0 4px' : '0 16px 0 0',
                '&:hover': {
                  backgroundColor: isMobile ? '#e9ecef' : 'transparent',
                },
              }}
            >
              <FavoriteIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 0.5,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                }}
              >
                {Array.isArray(post.likes) ? post.likes.length : 0}
              </Typography>
            </IconButton>
            <IconButton 
              className={styles.actionButton}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                borderRadius: isMobile ? 1 : 0,
                flex: isMobile ? 1 : 'none',
                margin: isMobile ? '0 4px' : '0 16px 0 0',
                '&:hover': {
                  backgroundColor: isMobile ? '#e9ecef' : 'transparent',
                },
              }}
            >
              <CommentIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 0.5,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                }}
              >
                {post.comments?.length || 0}
              </Typography>
            </IconButton>
            <IconButton 
              className={styles.actionButton}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                borderRadius: isMobile ? 1 : 0,
                flex: isMobile ? 1 : 'none',
                margin: isMobile ? '0 4px' : '0',
                '&:hover': {
                  backgroundColor: isMobile ? '#e9ecef' : 'transparent',
                },
              }}
            >
              <ShareIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }} />
            </IconButton>
          </Box>
          <Button 
            className={styles.readMoreButton}
            sx={{
              width: isMobile ? '100%' : 'auto',
              minHeight: isMobile ? 44 : 'auto',
              fontSize: isMobile ? '0.85rem' : '0.875rem',
              marginTop: isMobile ? '4px' : '0',
            }}
          >
            Читать далее
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default PostCard; 