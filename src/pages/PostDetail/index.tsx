import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Avatar, 
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getPostById, likePost, unlikePost, createComment } from '../../services/api';
import { Post, Comment } from '../../shared/types/post.types';
import styles from './PostDetail.module.css';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    
    // Загружаем данные поста
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPostById(id);
        
        if (data) {
          setPost(data);
          setLikesCount(data.likes ? data.likes.length : 0);
          setComments(data.comments || []);
          
          // Проверяем, поставил ли пользователь лайк
          if (token && data.likes) {
            // Здесь нужна логика для проверки, есть ли лайк от текущего пользователя
            // Например: setLiked(data.likes.some(like => like.user_id === currentUserId));
            setLiked(false); // Временная заглушка
          }
        } else {
          setError('Пост не найден');
        }
      } catch (err) {
        console.error('Ошибка при загрузке поста:', err);
        setError('Не удалось загрузить пост');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  // Обработка лайка
  const handleLikeToggle = async () => {
    if (!isAuth || !id || isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      const newLikedState = !liked;
      
      // Обновляем UI сначала для лучшего UX
      setLiked(newLikedState);
      setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);
      
      // Отправляем запрос на сервер
      let success;
      if (newLikedState) {
        success = await likePost(id);
      } else {
        success = await unlikePost(id);
      }
      
      // Если запрос не удался, возвращаем UI в исходное состояние
      if (!success) {
        setLiked(!newLikedState);
        setLikesCount(prevCount => !newLikedState ? prevCount + 1 : prevCount - 1);
      }
    } catch (err) {
      console.error('Ошибка при обработке лайка:', err);
      // Возвращаем состояние в случае ошибки
      setLiked(liked);
      setLikesCount(prevCount => liked ? prevCount : prevCount - 1);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  // Отправка комментария
  const handleSubmitComment = async () => {
    if (!isAuth || !id || !commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      const newComment = await createComment(id, commentText);
      
      if (newComment) {
        setComments(prevComments => [...prevComments, newComment]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Ошибка при отправке комментария:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Переход назад
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка поста...
        </Typography>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Пост не найден'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 3 }}
        >
          Вернуться назад
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      {/* Кнопка назад */}
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="text" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ color: 'var(--primary-color)' }}
        >
          Вернуться к списку
        </Button>
      </Box>
      
      {/* Основной контент поста */}
      <Paper elevation={0} className={styles.postPaper}>
        {/* Шапка поста */}
        <Box className={styles.postHeader}>
          <Typography variant="h4" className={styles.postTitle}>
            {post.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'var(--primary-color)',
                  width: 40,
                  height: 40,
                  mr: 1.5
                }}
              >
                {post.author.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {post.author.username}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'text.secondary' 
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {formatDate(post.created_at)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                icon={<FavoriteIcon sx={{ fontSize: 16 }} />} 
                label={likesCount.toString()}
                color={liked ? "primary" : "default"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<CommentIcon sx={{ fontSize: 16 }} />} 
                label={comments.length.toString()}
                size="small"
                color="secondary"
              />
            </Box>
          </Box>
          
          <Divider />
        </Box>
        
        {/* Изображение поста */}
        {post.images && post.images.length > 0 && (
          <Box className={styles.imageContainer}>
            <img 
              src={`https://рыбный-форум.рф${post.images[0].image_url}`} 
              alt={post.title} 
              className={styles.postImage} 
            />
          </Box>
        )}
        
        {/* Содержимое поста */}
        <Box className={styles.postContent}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </Box>
        
        {/* Кнопки действий */}
        <Box className={styles.postActions}>
          <Button
            variant="outlined"
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLikeToggle}
            color={liked ? "primary" : "inherit"}
            disabled={!isAuth}
          >
            {liked ? 'Нравится' : 'Оценить'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CommentIcon />}
            onClick={() => document.getElementById('commentInput')?.focus()}
            sx={{ ml: 2 }}
            disabled={!isAuth}
          >
            Комментировать
          </Button>
        </Box>
      </Paper>
      
      {/* Секция комментариев */}
      <Paper elevation={0} className={styles.commentsPaper}>
        <Typography variant="h6" gutterBottom>
          Комментарии ({comments.length})
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Форма добавления комментария */}
        {isAuth && (
          <Box sx={{ mb: 4 }}>
            <TextField
              id="commentInput"
              fullWidth
              variant="outlined"
              placeholder="Напишите комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              rows={2}
              disabled={submittingComment}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSubmitComment} 
                      disabled={!commentText.trim() || submittingComment} 
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
        
        {/* Список комментариев */}
        {comments.length > 0 ? (
          <Box className={styles.commentsList}>
            {comments.map((comment) => (
              <Paper 
                key={comment.id} 
                elevation={0} 
                className={styles.commentItem}
              >
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'var(--secondary-color)', 
                      width: 32, 
                      height: 32,
                      mr: 1.5
                    }}
                  >
                    {comment.author.username[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">
                        {comment.author.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CommentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Будьте первым, кто оставит комментарий
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PostDetail; 