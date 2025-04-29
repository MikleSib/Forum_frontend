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
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
}

const PostCard: React.FC<PostCardProps> = ({ title, content, imageUrl, author, date }) => {
  return (
    <Card className={styles.postCard}>
      {imageUrl && (
        <CardMedia
          component="img"
          className={styles.postImage}
          image={imageUrl}
          alt={title}
        />
      )}
      <CardContent className={styles.postContent}>
        <div className={styles.authorSection}>
          <Avatar 
            src={author.avatar}
            className={styles.avatar}
          >
            {author.name[0]}
          </Avatar>
          <div className={styles.authorInfo}>
            <Typography className={styles.authorName}>
              {author.name}
            </Typography>
            <Typography className={styles.postDate}>
              {new Date(date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </div>
        </div>
        <Typography className={styles.postTitle}>
          {title}
        </Typography>
        <Typography className={styles.postText}>
          {content}
        </Typography>
      </CardContent>
      <div className={styles.postActions}>
        <div className={styles.actionButtons}>
          <IconButton className={styles.actionButton}>
            <FavoriteIcon />
          </IconButton>
          <IconButton className={styles.actionButton}>
            <CommentIcon />
          </IconButton>
          <IconButton className={styles.actionButton}>
            <ShareIcon />
          </IconButton>
        </div>
        <Button variant="outlined" className={styles.readMoreButton}>
          Подробнее
        </Button>
      </div>
    </Card>
  );
};

export default PostCard; 