import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Avatar, Box, IconButton } from '@mui/material';
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
  const baseUrl = 'https://рыбный-форум.рф';

  // Функция для логирования аватара
  const getAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('PostCard Avatar path:', avatarPath);
      console.log('PostCard Full avatar URL:', `${baseUrl}/${avatarPath}`);
      return `${baseUrl}/${avatarPath}`;
    }
    return '';
  };

  return (
    <Card className={styles.postCard} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      {post.images?.[0] && (
        <Box className={styles.imageContainer} sx={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
          <CachedImage
            src={post.images[0].image_url}
            baseUrl={baseUrl}
            alt={post.title}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            placeholderSrc="/placeholder-image.jpg"
          />
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