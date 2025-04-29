import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Avatar, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';

interface PostCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  date: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  },
}));

const PostCard: React.FC<PostCardProps> = ({ title, content, imageUrl, author, date }) => {
  return (
    <StyledCard>
      {imageUrl && (
        <CardMedia
          component="img"
          height="240"
          image={imageUrl}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
           
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              border: '2px solid #2E7D32'
            }}
          >
            {author[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="500">
              {author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {content}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <IconButton size="small" color="primary">
            <FavoriteIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <CommentIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <ShareIcon />
          </IconButton>
        </Box>
        <Button variant="outlined" color="primary" size="small">
          Подробнее
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default PostCard; 