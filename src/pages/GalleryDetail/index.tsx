import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  Visibility as VisibilityIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIconNav,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryApi, Gallery, GalleryComment } from '../../services/galleryApi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { userStore } from '../../shared/store/userStore';

const GalleryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteGalleryDialogOpen, setDeleteGalleryDialogOpen] = useState(false);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    setIsAdmin(userStore.isAdmin);
  }, []);

  useEffect(() => {
    if (id) {
      loadGallery();
      loadComments();
    }
  }, [id]);

  const loadGallery = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const galleryData = await galleryApi.getGallery(parseInt(id));
      setGallery(galleryData);
    } catch (err: any) {
      console.error('Ошибка при загрузке галереи:', err);
      setError('Не удалось загрузить галерею');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    
    try {
      setCommentsLoading(true);
      const commentsData = await galleryApi.getComments(parseInt(id));
      setComments(commentsData.items || []);
    } catch (err: any) {
      console.error('Ошибка при загрузке комментариев:', err);
      setComments([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/', { state: { activeView: 'gallery' } });
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!gallery || !isAuth) return;

    try {
      if (userReaction === type) {
        // Убираем реакцию
        await galleryApi.removeReaction(gallery.id);
        setUserReaction(null);
        setGallery(prev => prev ? {
          ...prev,
          likes_count: type === 'like' ? prev.likes_count - 1 : prev.likes_count,
          dislikes_count: type === 'dislike' ? prev.dislikes_count - 1 : prev.dislikes_count,
        } : null);
      } else {
        // Добавляем/меняем реакцию
        if (type === 'like') {
          await galleryApi.likeGallery(gallery.id);
        } else {
          await galleryApi.dislikeGallery(gallery.id);
        }
        
        const prevReaction = userReaction;
        setUserReaction(type);
        setGallery(prev => prev ? {
          ...prev,
          likes_count: type === 'like' 
            ? prev.likes_count + 1 - (prevReaction === 'like' ? 1 : 0)
            : prev.likes_count - (prevReaction === 'like' ? 1 : 0),
          dislikes_count: type === 'dislike'
            ? prev.dislikes_count + 1 - (prevReaction === 'dislike' ? 1 : 0) 
            : prev.dislikes_count - (prevReaction === 'dislike' ? 1 : 0),
        } : null);
      }
    } catch (err: any) {
      console.error('Ошибка при обработке реакции:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!gallery || !commentText.trim() || !isAuth) return;

    try {
      setIsSubmittingComment(true);
      const newComment = await galleryApi.addComment(gallery.id, commentText.trim());
      if (newComment) {
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        setGallery(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
      }
    } catch (err: any) {
      console.error('Ошибка при добавлении комментария:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openImageDialog = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageDialog = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!gallery?.images || selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : gallery.images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < gallery.images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  // Функция для логирования аватара
  const logAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      console.log('Avatar path:', avatarPath);
      const baseUrl = 'https://рыболовный-форум.рф';
      console.log('Full avatar URL:', `${baseUrl}${avatarPath}`);
      return `${baseUrl}${avatarPath}`;
    }
    return '';
  };

  const handleDeleteGallery = async () => {
    if (!gallery || !isAdmin) return;
    
    try {
      await galleryApi.deleteGallery(gallery.id);
      setDeleteGalleryDialogOpen(false);
      navigate('/', { state: { activeView: 'gallery' } });
    } catch (err: any) {
      console.error('Ошибка при удалении галереи:', err);
    }
  };

  const handleDeleteComment = async () => {
    if (!gallery || !commentToDelete || !isAdmin) return;
    
    try {
      await galleryApi.deleteComment(gallery.id, commentToDelete);
      setComments(prev => prev.filter(comment => comment.id !== commentToDelete));
      setGallery(prev => prev ? { ...prev, comments_count: prev.comments_count - 1 } : null);
      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
    } catch (err: any) {
      console.error('Ошибка при удалении комментария:', err);
    }
  };

  const openDeleteCommentDialog = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteCommentDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !gallery) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Галерея не найдена'}
        </Alert>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Назад к галереям
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Заголовок с кнопкой назад */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flex: 1 }}>
            {gallery.title}
          </Typography>
          {isAdmin && (
            <IconButton 
              color="error" 
              onClick={() => setDeleteGalleryDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Левая колонка - изображения */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              {/* Сетка изображений */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2
              }}>
                {gallery.images?.map((image, index) => (
                  <Box
                    key={image.id || index}
                    sx={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={() => openImageDialog(index)}
                  >
                    <img
                      src={image.thumbnail_url || image.image_url}
                      alt={gallery.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Статистика и реакции */}
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<VisibilityIcon />}
                    label={gallery.views_count + ' просмотров'}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<CommentIcon />}
                    label={gallery.comments_count + ' комментариев'}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {isAuth && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={userReaction === 'like' ? 'contained' : 'outlined'}
                      startIcon={userReaction === 'like' ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      onClick={() => handleReaction('like')}
                      size="small"
                      color="primary"
                    >
                      {gallery.likes_count}
                    </Button>
                    <Button
                      variant={userReaction === 'dislike' ? 'contained' : 'outlined'}
                      startIcon={userReaction === 'dislike' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
                      onClick={() => handleReaction('dislike')}
                      size="small"
                      color="secondary"
                    >
                      {gallery.dislikes_count}
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Правая колонка - информация и комментарии */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Информация о галерее */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Информация
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={logAvatarUrl(gallery.author?.avatar)} sx={{ mr: 2 }}>
                  {(() => {
                    const username = gallery.author?.username || gallery.author_username;
                    return (username && username[0]) ? username[0].toUpperCase() : '?';
                  })()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {gallery.author?.username || gallery.author_username || 'Пользователь'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(gallery.created_at), { addSuffix: true, locale: ru })}
                  </Typography>
                </Box>
              </Box>

              {gallery.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {gallery.description}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary">
                {gallery.images?.length || 0} фотографий
              </Typography>
            </Paper>

            {/* Комментарии */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Комментарии ({gallery.comments_count})
              </Typography>

              {/* Добавление комментария */}
              {isAuth ? (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Напишите комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    size="small"
                  >
                    {isSubmittingComment ? 'Отправка...' : 'Отправить'}
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Войдите в систему, чтобы оставить комментарий
                </Alert>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Список комментариев */}
              {commentsLoading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Пока нет комментариев
                </Typography>
              ) : (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {comments.map((comment) => (
                    <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          src={logAvatarUrl(comment.author?.avatar)} 
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {comment.author?.username ? comment.author.username[0].toUpperCase() : '?'}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                          {comment.author?.username || 'Пользователь'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ru })}
                        </Typography>
                        {isAdmin && (
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteCommentDialog(comment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2">
                        {comment.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Диалог просмотра изображения */}
      <Dialog
        open={selectedImageIndex !== null}
        onClose={closeImageDialog}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', textAlign: 'center' }}>
          {selectedImageIndex !== null && gallery.images && (
            <>
              <IconButton
                onClick={closeImageDialog}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>

              {gallery.images.length > 1 && (
                <>
                  <IconButton
                    onClick={() => navigateImage('prev')}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'white',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      }
                    }}
                  >
                    <ArrowBackIconNav />
                  </IconButton>

                  <IconButton
                    onClick={() => navigateImage('next')}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'white',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </>
              )}

              <img
                src={gallery.images[selectedImageIndex].image_url}
                alt={gallery.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />

              {gallery.images.length > 1 && (
                <Typography variant="caption" sx={{ 
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  px: 2,
                  py: 1,
                  borderRadius: 1
                }}>
                  {selectedImageIndex + 1} из {gallery.images.length}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления галереи */}
      <Dialog
        open={deleteGalleryDialogOpen}
        onClose={() => setDeleteGalleryDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить эту галерею? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGalleryDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteGallery} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления комментария */}
      <Dialog
        open={deleteCommentDialogOpen}
        onClose={() => setDeleteCommentDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteComment} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GalleryDetail; 