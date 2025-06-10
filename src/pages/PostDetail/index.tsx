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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { getPostById, likePost, unlikePost, createComment, deletePost, deleteComment } from '../../services/api';
import { Post, Comment } from '../../shared/types/post.types';
import { userStore } from '../../shared/store/userStore';
import styles from './PostDetail.module.css';
import ImageGallery from '../../components/ImageGallery';
import { formatLocalDate, formatRelativeDate } from '../../utils/dateUtils';

// Декларация типа для window._tmr
declare global {
  interface Window {
    _tmr?: any[];
  }
}

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию и права администратора
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    setIsAdmin(userStore.isAdmin);
    
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
          
          // Логируем путь к аватару автора для отладки
          if (data.author && data.author.avatar) {
            console.log('Avatar path:', data.author.avatar);
            console.log('Full avatar URL:', `https://рыболовный-форум.рф/${data.author.avatar}`);
          }
          
          // Проверяем, поставил ли пользователь лайк
          if (token && data.likes) {
            const currentUserId = userStore.user?.id;
            setLiked(data.likes.some(like => like.user_id === currentUserId));
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

  // Функция для логирования аватара
  const logAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('Avatar path:', avatarPath);
      const baseUrl = 'https://рыболовный-форум.рф';
      console.log('Full avatar URL:', `${baseUrl}/${avatarPath}`);
      return `${baseUrl}/${avatarPath}`;
    }
    return '';
  };

  // Обработка лайка
  const handleLikeToggle = async () => {
    if (!isAuth || !id || isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      const newLikedState = !liked;
      console.log('Текущее состояние лайка:', liked);
      console.log('Новое состояние лайка:', newLikedState);
      
      // Отправляем запрос на сервер
      let success;
      if (newLikedState) {
        success = await likePost(id);
        console.log('Результат likePost:', success);
      } else {
        success = await unlikePost(id);
        console.log('Результат unlikePost:', success);
      }
      
      if (success) {
        // Обновляем состояние только если запрос успешен
        setLiked(newLikedState);
        setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);
      }
    } catch (err) {
      console.error('Ошибка при обработке лайка:', err);
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
        // Проверяем наличие данных автора
        if (!newComment.author && userStore.user) {
          newComment.author = {
            id: userStore.user.id,
            username: userStore.user.username,
            full_name:  '',
            about_me:  ''
          };
        }
        
        // Отправляем метрику при успешной отправке комментария
        if (window._tmr) {
          window._tmr.push({ type: 'reachGoal', id: 3658346, goal: 'SEND_MSG_POST'});
        }
        
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

  // Обработчик удаления поста
  const handleDeletePost = async () => {
    if (!id || !isAdmin) return;
    
    try {
      await deletePost(id);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Ошибка при удалении поста:', err);
    }
  };

  // Обработчик удаления комментария
  const handleDeleteComment = async (commentId: number) => {
    if (!isAdmin) return;
    
    try {
      await deleteComment(commentId.toString());
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err);
    }
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
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'var(--primary-color)',
                  width: 40,
                  height: 40,
                  mr: 1.5
                }}
                src={logAvatarUrl(post.author.avatar)}
              >
                {!post.author.avatar && post.author.username[0].toUpperCase()}
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
                  {formatLocalDate(post.created_at)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              {isAdmin && (
                <IconButton 
                  color="error" 
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Divider />
        </Box>
        
        {/* Изображения поста - заменяем на ImageGallery */}
        {post.images && post.images.length > 0 && (
          <ImageGallery images={post.images} />
        )}
        
        {/* Содержимое поста */}
        <Box className={styles.postContent}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </Box>
        
        {/* Кнопки действий */}
        <Box sx={{ display: 'flex', mt: 4 }}>
          <Button
            variant={liked ? "contained" : "outlined"}
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLikeToggle}
            color={liked ? "primary" : "inherit"}
            disabled={!isAuth || isLikeProcessing}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            {liked ? 'Нравится' : 'Оценить'}
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
                    src={logAvatarUrl(comment.author?.avatar)}
                  >
                    {!comment.author?.avatar && (comment.author?.username?.[0]?.toUpperCase() || '?')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {comment.author?.username || 'Пользователь'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatLocalDate(comment.created_at)}
                        </Typography>
                        {isAdmin && (
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
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

      {/* Диалог подтверждения удаления поста */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeletePost} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetail; 