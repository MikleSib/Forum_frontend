import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Avatar, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import styles from './PostCard.module.css';

interface PostCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  date: string;
}

const PostCard: React.FC<PostCardProps> = ({ title, content, imageUrl, author, date }) => {
  // Функция для декодирования HTML-сущностей
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <Card className={styles.postCard}>
      {imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={title}
          className={styles.postImage}
        />
      )}
      <CardContent className={styles.postContent}>
        <Box className={styles.authorSection}>
          <Avatar className={styles.avatar} />
          <Box className={styles.authorInfo}>
            <Typography className={styles.authorName}>
              {author}
            </Typography>
            <Typography className={styles.postDate}>
              {new Date(date).toLocaleDateString('ru-RU', {
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
          {title}
        </Typography>

        <div 
          className={styles.postText}
          dangerouslySetInnerHTML={{ __html: decodeHtml(content) }}
        />

        <CardActions className={styles.postActions}>
          <Box className={styles.actionButtons}>
            <IconButton className={styles.actionButton}>
              <FavoriteIcon />
            </IconButton>
            <IconButton className={styles.actionButton}>
              <CommentIcon />
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