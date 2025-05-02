import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Avatar, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import styles from './PostCard.module.css';
import type { Post } from '../../shared/types/post.types';
import CachedImage from '../CachedImage';

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

  // Базовый URL для изображений
  const baseUrl = 'https://рыбный-форум.рф';

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
          <Avatar className={styles.avatar} />
          <Box className={styles.authorInfo}>
            <Typography className={styles.authorName}>
              {post.author.username}
            </Typography>
            <Typography className={styles.postDate}>
              {new Date(post.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
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