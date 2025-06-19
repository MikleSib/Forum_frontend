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

  return (
    <Card className={styles.postCard} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      {post.images && post.images.length > 0 && (
        <Box
          sx={{
            display: post.images.length > 1 ? 'flex' : 'block',
            flexDirection: 'row',
            gap: post.images.length > 1 ? 1 : 0,
            overflowX: post.images.length > 1 ? 'auto' : 'visible',
            height: 200,
            mb: 1,
            background: isMobile ? 'none' : undefined,
          }}
        >
          {post.images.slice(0, 5).map((img, idx) => (
            <Box
              key={img.image_url + idx}
              sx={{
                minWidth: post.images.length > 1 ? 200 : '100%',
                width: post.images.length > 1 ? 200 : '100%',
                height: 200,
                borderRadius: 2,
                overflow: 'hidden',
                flex: post.images.length > 1 ? '0 0 auto' : '1 1 100%',
                mr: post.images.length > 1 && idx !== post.images.length - 1 ? 1 : 0,
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
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
                  borderRadius: 8,
                  display: 'block',
                }}
                showSkeleton={true}
                skeletonHeight={200}
                placeholderSrc="/placeholder-image.svg"
              />
            </Box>
          ))}
        </Box>
      )}
      <CardContent className={styles.postContent}>
        <Box className={styles.authorSection}>
          <Avatar 
            className={styles.avatar}
            src={getAvatarUrl(post.author?.avatar)}
          >
            {!post.author?.avatar && getInitials(post.author?.username)}
          </Avatar>
          <Box className={styles.authorInfo}>
            <Typography className={styles.authorName}>
              {post.author?.username || 'Неизвестный автор'}
            </Typography>
            <Typography className={styles.postDate}>
              {formatLocalDate(post.created_at)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" className={styles.postTitle}>
          {post.title}
        </Typography>

        <div 
          className={styles.postText}
          dangerouslySetInnerHTML={{ __html: decodeHtml(post.content) }}
        />

        <CardActions className={styles.postActions}>
          <Box className={styles.actionButtons}>
            <IconButton className={styles.actionButton}>
              <FavoriteIcon />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {Array.isArray(post.likes) ? post.likes.length : 0}
              </Typography>
            </IconButton>
            <IconButton className={styles.actionButton}>
              <CommentIcon />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {post.comments?.length || 0}
              </Typography>
            </IconButton>
            <IconButton className={styles.actionButton}>
              <ShareIcon />
            </IconButton>
          </Box>
          <Button className={styles.readMoreButton}>
            Читать далее
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default PostCard; 