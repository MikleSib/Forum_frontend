import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Breadcrumbs, Avatar, Chip, IconButton, TextField,
  Card, CardContent, CardHeader, CardActions, Grid, Menu, MenuItem,
  ListItemIcon, ListItemText, CircularProgress, Tooltip,
  Alert, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PushPinIcon from '@mui/icons-material/PushPin';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { userStore } from '../../shared/store/userStore';
import ImageGallery from '../../components/ImageGallery';
import { forumApi } from '../../services/forumApi';
import { ForumTopic, ForumPost, ForumPostImage, PaginatedResponse, ForumUserData } from '../../shared/types/forum.types';
import { PostImage } from '../../shared/types/post.types';
import { formatLocalDate, formatRelativeDate } from '../../utils/dateUtils';

// Декларация типа для window._tmr
declare global {
  interface Window {
    _tmr?: any[];
  }
}

// Интерфейс для превью изображений
interface ImagePreview {
  id: number;
  url: string;
}

// Подготавливаем компонент для отображения деталей темы
const TopicDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  // Состояние для API данных
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  // Состояния для UI
  const [reply, setReply] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<ImagePreview[]>([]);
  const [nextImageId, setNextImageId] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectionAuthor, setSelectionAuthor] = useState<string>('');
  const [selectionMenuPosition, setSelectionMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  
  // Состояние для цитаты
  const [currentQuote, setCurrentQuote] = useState<{
    author: string;
    text: string;
    postId: number;
  } | null>(null);
  
  // Состояние для редактирования сообщения
  const [isEditing, setIsEditing] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Состояние для процесса удаления
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  
  // Состояние для диалога жалобы
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  const replyBoxRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editTextFieldRef = useRef<HTMLTextAreaElement>(null);

  // Функция для генерации градиентного цвета на основе имени пользователя
  const generateGradientColor = (userId: number, username: string) => {
    // Используем комбинацию ID и имени для создания уникального хеша
    const hash = userId.toString() + (username || 'user');
    let hashValue = 0;
    
    // Простая хеш-функция для преобразования строки в число
    for (let i = 0; i < hash.length; i++) {
      hashValue = ((hashValue << 5) - hashValue) + hash.charCodeAt(i);
      hashValue = hashValue & hashValue; // Convert to 32bit integer
    }
    
    // Массив с парами цветов для градиентов
    const gradients = [
      ['#1976d2', '#64b5f6'], // Синий
      ['#388e3c', '#81c784'], // Зеленый
      ['#d32f2f', '#e57373'], // Красный
      ['#7b1fa2', '#ba68c8'], // Фиолетовый
      ['#f57c00', '#ffb74d'], // Оранжевый
      ['#0097a7', '#4dd0e1'], // Циан
      ['#5d4037', '#a1887f'], // Коричневый
      ['#616161', '#bdbdbd'], // Серый
      ['#827717', '#c0ca33'], // Лаймовый
      ['#c2185b', '#f06292']  // Розовый
    ];
    
    // Выбираем градиент на основе хеша
    const index = Math.abs(hashValue) % gradients.length;
    const [color1, color2] = gradients[index];
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  // Функция для загрузки данных темы и сообщений
  const fetchTopicData = useCallback(async () => {
    if (!topicId) return;
    
    try {
      setLoading(true);
      
      // Получаем информацию о теме
      const topicData = await forumApi.getTopicById(parseInt(topicId));
      
      // Если есть идентификатор категории, загружаем информацию о ней для breadcrumbs
      if (topicData.category_id) {
        try {
          const categoryData = await forumApi.getCategoryById(topicData.category_id);
          topicData.category_title = categoryData.title;
          
          // Проверяем, есть ли у категории родительская категория
          if (categoryData.parent_id) {
            try {
              const parentCategoryData = await forumApi.getCategoryById(categoryData.parent_id);
              // Добавляем информацию о родительской категории в данные темы
              topicData.parent_category_id = categoryData.parent_id;
              topicData.parent_category_title = parentCategoryData.title;
            } catch (err) {
              console.error('Ошибка при загрузке родительской категории:', err);
            }
          }
        } catch (err) {
          console.error('Ошибка при загрузке категории:', err);
        }
      }
      
      setTopic(topicData);
      
      // Получаем сообщения для этой темы
      const postsResponse = await forumApi.getPosts({
        topic_id: parseInt(topicId),
        page: page,
        page_size: 20
      });
      
      // Обрабатываем полученные данные, чтобы подготовить их для отображения
      const postsWithUserData = postsResponse.items.map(post => {
        // Используем поля user из ответа API, если они есть
        const userData: ForumUserData = post.user || {
          id: post.author_id,
          username: '',
          fullname: '',
          avatar: '',
          posts_count: 0,
          registration_date: '',
          role: 'user'
        };
        
        return {
          ...post,
          author_id: post.author_id,
          author_username: userData.username || `Пользователь ${post.author_id}`,
          author_avatar: userData.avatar || undefined,
          author_post_count: userData.posts_count || 0,
          author_signature: userData.fullname || ''
        };
      });
      
      setPosts(postsWithUserData);
      setTotalPages(postsResponse.pages);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных темы:', err);
      setError('Не удалось загрузить данные темы. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
      setShouldRefresh(false);
    }
  }, [topicId, page]);

  // Загружаем данные при монтировании и при изменении параметров
  useEffect(() => {
    // Отладочный вывод для проверки статуса администратора
    console.log('TopicDetail - isAdmin:', userStore.isAdmin);
    console.log('TopicDetail - user:', userStore.user);
    
    // Проверяем наличие токена в localStorage и обновляем состояние
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      console.log('TopicDetail - auth from localStorage:', auth);
      console.log('TopicDetail - auth.user.is_admin:', auth.user?.is_admin);
    } else {
      console.log('TopicDetail - No auth in localStorage');
    }
    
    fetchTopicData();
  }, [fetchTopicData, shouldRefresh]);

  // Обработчики для UI
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setAnchorEl(event.currentTarget);
    setActivePostId(postId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActivePostId(null);
  };

  // Обработчик выделения текста
  const handleTextSelection = (e: React.MouseEvent, post: ForumPost) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      
      // Получение координат выделения
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Установка состояний для меню цитирования
      setSelectedText(selectedText);
      setSelectedPostId(post.id);
      setSelectionAuthor(post.user?.username || post.author_username || `Пользователь ${post.author_id}`);
      setSelectionMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
  };

  // Обработчик закрытия меню выделения
  const handleCloseSelectionMenu = () => {
    setSelectionMenuPosition(null);
    setSelectedText('');
    setSelectedPostId(null);
  };

  // Обработчик цитирования из меню действий
  const handleQuote = (postId: number) => {
    // Находим пост для цитирования из API данных
    const postToQuote = posts.find(post => post.id === postId);
    if (postToQuote) {
      const username = postToQuote.user?.username || 
                      postToQuote.author_username || 
                      `Пользователь ${postToQuote.author_id}`;
      
      // Устанавливаем данные цитаты
      setCurrentQuote({
        author: username,
        text: postToQuote.content,
        postId: postToQuote.id
      });
      
      // Прокручиваем к форме ответа
      if (replyBoxRef.current) {
        replyBoxRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    handleMenuClose();
  };

  // Обработчик цитирования выделенного текста
  const handleQuoteSelection = () => {
    if (selectedText && selectedPostId) {
      // Устанавливаем данные цитаты
      setCurrentQuote({
        author: selectionAuthor,
        text: selectedText,
        postId: selectedPostId
      });
      
      // Прокручиваем к форме ответа
      if (replyBoxRef.current) {
        replyBoxRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    handleCloseSelectionMenu();
  };

  // Обработчик удаления цитаты
  const handleRemoveQuote = () => {
    setCurrentQuote(null);
  };

  // Обработчик клика по документу для закрытия меню выделения
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (selectionMenuPosition) {
        const target = e.target as Element;
        if (!target.closest('.selection-menu')) {
          handleCloseSelectionMenu();
        }
      }
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [selectionMenuPosition]);

  // Обработчики для API
  const handleLike = async (postId: number) => {
    try {
      // Находим пост в текущем состоянии
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // Если у поста уже есть лайк, вызываем удаление реакции
      if (post.likes_count > 0) {
        await handleDeleteReaction(postId);
        return;
      }
      
      // Иначе вызываем API для добавления лайка
      const response = await forumApi.likePost(postId);
      
      // Локально обновляем данные без обращения к серверу
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          // Обновляем количество лайков и устанавливаем дизлайки в 0
          return {
            ...post,
            likes_count: response.likes_count || 1,
            dislikes_count: 0 // При лайке дизлайк снимается
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Ошибка при добавлении лайка:', error);
      setError('Не удалось добавить лайк. Пожалуйста, попробуйте позже.');
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      // Находим пост в текущем состоянии
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // Если у поста уже есть дизлайк, вызываем удаление реакции
      if (post.dislikes_count > 0) {
        await handleDeleteReaction(postId);
        return;
      }
      
      // Иначе вызываем API для добавления дизлайка
      const response = await forumApi.dislikePost(postId);
      
      // Локально обновляем данные без обращения к серверу
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          // Обновляем количество дизлайков и устанавливаем лайки в 0
          return {
            ...post,
            likes_count: 0, // При дизлайке лайк снимается
            dislikes_count: response.dislikes_count || 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Ошибка при добавлении дизлайка:', error);
      setError('Не удалось добавить дизлайк. Пожалуйста, попробуйте позже.');
    }
  };

  const handleDeleteReaction = async (postId: number) => {
    try {
      const response = await forumApi.deleteReaction(postId);
      
      // Локально обновляем данные без обращения к серверу
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          // Устанавливаем кол-во лайков и дизлайков в 0
          return {
            ...post,
            likes_count: 0,
            dislikes_count: 0
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Ошибка при удалении реакции:', error);
      setError('Не удалось удалить реакцию. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработчик редактирования сообщения
  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    setEditPostId(postId);
    setEditContent(post.content);
    setIsEditing(true);
    handleMenuClose();
    
    // Фокус на поле ввода при открытии
    setTimeout(() => {
      if (editTextFieldRef.current) {
        editTextFieldRef.current.focus();
      }
    }, 100);
  };
  
  // Обработчик сохранения отредактированного сообщения
  const handleSaveEdit = async () => {
    if (!editPostId || !editContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      const updatedPost = await forumApi.updatePost(editPostId, editContent);
      
      // Обновляем сообщение локально
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === editPostId 
          ? { ...post, content: updatedPost.content, is_edited: true, updated_at: updatedPost.updated_at }
          : post
      ));
      
      // Сбрасываем состояние редактирования
      setIsEditing(false);
      setEditPostId(null);
      setEditContent('');
    } catch (error) {
      console.error('Ошибка при обновлении сообщения:', error);
      setError('Не удалось обновить сообщение. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик удаления сообщения
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Вы действительно хотите удалить это сообщение?')) return;
    
    try {
      setIsDeletingPost(true);
      setDeletingPostId(postId);
      await forumApi.deletePost(postId);
      
      // Удаляем сообщение локально
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Если это первое сообщение темы, перенаправляем на страницу категории
      if (posts.find(p => p.id === postId)?.is_topic_starter && topic?.category_id) {
        navigate(`/forum/category/${topic.category_id}`);
        return;
      }
      
      // Обновляем счетчик сообщений в теме
      if (topic) {
        setTopic({
          ...topic,
          posts_count: Math.max(topic.posts_count - 1, 1)
        });
      }
    } catch (error) {
      console.error('Ошибка при удалении сообщения:', error);
      setError('Не удалось удалить сообщение. Пожалуйста, попробуйте позже.');
    } finally {
      setIsDeletingPost(false);
      setDeletingPostId(null);
      handleMenuClose();
    }
  };
  
  // Обработчик закрепления/открепления темы
  const handlePinTopic = async () => {
    if (!topic) return;
    
    try {
      const updatedTopic = await forumApi.pinTopic(topic.id);
      
      // Обновляем тему локально
      setTopic({
        ...topic,
        is_pinned: updatedTopic.is_pinned
      });
    } catch (error) {
      console.error('Ошибка при закреплении/откреплении темы:', error);
      setError('Не удалось закрепить/открепить тему. Пожалуйста, попробуйте позже.');
    }
    
    handleMenuClose();
  };
  
  // Обработчик закрытия/открытия темы
  const handleCloseTopic = async () => {
    if (!topic) return;
    
    try {
      const updatedTopic = await forumApi.closeTopic(topic.id);
      
      // Обновляем тему локально
      setTopic({
        ...topic,
        is_closed: updatedTopic.is_closed
      });
    } catch (error) {
      console.error('Ошибка при закрытии/открытии темы:', error);
      setError('Не удалось закрыть/открыть тему. Пожалуйста, попробуйте позже.');
    }
    
    handleMenuClose();
  };
  
  // Обработчик открытия диалога жалобы
  const handleOpenReportDialog = (postId: number) => {
    setReportPostId(postId);
    setReportReason('');
    setReportDialogOpen(true);
    handleMenuClose();
  };
  
  // Обработчик отправки жалобы
  const handleReportPost = async () => {
    if (!reportPostId || !reportReason.trim()) return;
    
    try {
      setIsSubmittingReport(true);
      await forumApi.reportPost(reportPostId, reportReason);
      
      // Показываем уведомление
      setError('Жалоба успешно отправлена. Спасибо за обращение!');
      setTimeout(() => setError(null), 3000);
      
      // Закрываем диалог
      setReportDialogOpen(false);
      setReportPostId(null);
      setReportReason('');
    } catch (error) {
      console.error('Ошибка при отправке жалобы:', error);
      setError('Не удалось отправить жалобу. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Обработчик отправки ответа
  const handleReply = async () => {
    if (!reply.trim() && !currentQuote && uploadedImages.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      if (!topicId) {
        throw new Error('ID темы не найден');
      }
      
      // Логирование перед отправкой
      console.log('Отправка сообщения. Изображения:', uploadedImages);
      uploadedImages.forEach((img, index) => {
        console.log(`Изображение ${index}:`, img.name, img.type, img.size);
      });
      
      // Создаем объект с данными сообщения
      const postData = {
        topic_id: parseInt(topicId),
        content: reply,
        quoted_post_id: currentQuote ? currentQuote.postId : undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined
      };
      
      // Проверяем, действительно ли передаем изображения
      console.log('postData перед отправкой:', JSON.stringify({
        ...postData, 
        images: postData.images ? `${postData.images.length} файлов` : 'нет'
      }));
      
      // Отправляем запрос на создание сообщения с изображениями, если они есть
      const newPost = await forumApi.createPost(postData);
      
      // Добавляем новое сообщение в локальное состояние
      setPosts(prevPosts => [...prevPosts, newPost]);
      
      // Отправляем метрику успешной отправки сообщения на форуме
      if (window._tmr) {
        window._tmr.push({ type: 'reachGoal', id: 3644598, goal: 'SEND_MSG_FORUM'});
      }
      
      // Обновляем тему, если нужно (только счетчик сообщений)
      if (topic) {
        setTopic({
          ...topic,
          posts_count: topic.posts_count + 1,
          last_post_id: newPost.id,
          last_post_author_id: newPost.author_id,
          last_post_date: newPost.created_at,
          last_post_author_username: newPost.author_username || userStore.user?.username,
          last_post_author_avatar: newPost.author_avatar || userStore.user?.avatar
        });
      }
      
      // Сбрасываем форму
      setReply('');
      setCurrentQuote(null);
      setUploadedImages([]);
      setPreviewImages([]);
      
      // Прокручиваем страницу вниз к новому сообщению
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 300);
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error);
      setError('Не удалось отправить ответ. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Преобразуем FileList в массив
    const files = Array.from(e.target.files);
    
    // Логирование для отладки
    console.log('Файлы выбраны в handleImageUpload:', files);
    files.forEach(file => {
      console.log('Файл:', file.name, file.type, file.size);
    });
    
    // Сохраняем файлы в state
    setUploadedImages(prev => [...prev, ...files]);
    
    // Создаем превью для каждого файла
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newId = nextImageId;
          setPreviewImages(prev => [
            ...prev,
            {
              id: newId,
              url: e.target?.result as string
            }
          ]);
          setNextImageId(prev => prev + 1);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Сбрасываем значение input, чтобы можно было выбрать те же файлы снова
    e.target.value = '';
  };

  const removeImage = (id: number) => {
    // Находим индекс изображения в массиве превью
    const indexInPreviews = previewImages.findIndex(img => img.id === id);
    
    if (indexInPreviews !== -1) {
      // Удаляем превью
      setPreviewImages(prev => prev.filter(img => img.id !== id));
      
      // Удаляем соответствующий файл из uploadedImages
      setUploadedImages(prev => {
        const newArray = [...prev];
        newArray.splice(indexInPreviews, 1);
        return newArray;
      });
      
      // Логирование для отладки
      console.log('Изображение удалено, ID:', id, 'Индекс:', indexInPreviews);
    }
  };

  // Обработчик переключения страниц
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Прокручиваем страницу вверх при смене страницы
      window.scrollTo(0, 0);
    }
  };

  // Обработчик ручного обновления данных
  const handleRefresh = () => {
    setShouldRefresh(true);
  };

  // Отображение загрузки
  if (loading && !topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Отображение ошибки
  if (error && !topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/forum"
          sx={{ mt: 2 }}
        >
          Вернуться к форуму
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Хлебные крошки */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Главная</Typography>
          </Link>
          <Link to="/forum" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Форум</Typography>
          </Link>
          {topic?.parent_category_id && topic.parent_category_title && (
            <Link to={`/forum/category/${topic.parent_category_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography color="text.primary">{topic.parent_category_title}</Typography>
            </Link>
          )}
          {topic?.category_id && (
            <Link to={`/forum/category/${topic.category_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography color="text.primary">{topic.category_title || 'Категория'}</Typography>
            </Link>
          )}
          <Typography color="text.primary" fontWeight={500}>
            {topic?.title}
          </Typography>
        </Breadcrumbs>

        {/* Заголовок темы */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton sx={{ bgcolor: 'action.hover' }} 
            onClick={() => navigate(topic?.category_id ? 
              `/forum/category/${topic.category_id}` : '/forum')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {topic?.is_pinned && (
                <Chip 
                  size="small" 
                  label="Закреплено" 
                  color="primary" 
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
              {topic?.is_closed && (
                <Chip 
                  size="small" 
                  label="Закрыто" 
                  color="error" 
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
              {userStore.isAdmin && (
                <Chip 
                  size="small" 
                  label="Режим администратора" 
                  color="error" 
                  sx={{ height: 24, bgcolor: '#f44336', color: 'white' }}
                />
              )}
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {topic?.title}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {Array.isArray(topic?.tags) && topic?.tags.map((tag, idx) => (
                <Chip 
                  key={idx}
                  size="small" 
                  label={tag} 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white' 
                  }} 
                />
              ))}
            </Box>
          </Box>
          
          <Tooltip title="Обновить">
            <IconButton 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ ml: 'auto' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Основное содержимое */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {userStore.isAdmin && !loading && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm('Вы действительно хотите удалить ВСЮ тему?')) {
                if (topic) {
                  forumApi.deleteTopic(topic.id)
                    .then(() => {
                      navigate(`/forum/category/${topic.category_id}`);
                    })
                    .catch(err => {
                      console.error('Ошибка при удалении темы:', err);
                      setError('Не удалось удалить тему');
                    });
                }
              }
            }}
          >
            Удалить тему
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<LockIcon />}
            onClick={handleCloseTopic}
          >
            {topic?.is_closed ? 'Открыть тему' : 'Закрыть тему'}
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<PushPinIcon />}
            onClick={handlePinTopic}
          >
            {topic?.is_pinned ? 'Открепить тему' : 'Закрепить тему'}
          </Button>
        </Box>
      )}
      
      {!loading && posts.map((post, index) => (
          <Paper 
            elevation={0} 
            key={post.id} 
            sx={{ 
              mb: 3, 
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Grid container>
              {/* Информация об авторе */}
              <Grid size={{ xs: 12, md: 3 }} sx={{ 
                p: 2, 
                bgcolor: 'action.hover',
                borderRight: { xs: 'none', md: '1px solid' },
                borderBottom: { xs: '1px solid', md: 'none' },
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={post.user?.avatar || post.author_avatar || undefined} 
                    alt={post.user?.username || post.author_username || `Пользователь ${post.author_id}`}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      background: !post.user?.avatar && !post.author_avatar 
                        ? generateGradientColor(
                            post.author_id, 
                            post.user?.username || post.author_username || ''
                          )
                        : undefined,
                      color: 'white',
                      fontSize: '2.2rem',
                      fontWeight: 800,
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.18)'
                      },
                      animation: !loading ? 'avatarFadeIn 0.6s ease-out' : 'none',
                      '@keyframes avatarFadeIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateY(10px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                  >
                    {(!post.user?.avatar && !post.author_avatar) && 
                      (post.user?.fullname 
                        ? (() => {
                            const nameParts = post.user.fullname.split(' ');
                            return nameParts.length > 1 
                              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                              : post.user.fullname[0].toUpperCase();
                          })()
                        : (post.user?.username || post.author_username || 'П').charAt(0).toUpperCase()
                      )
                    }
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      textAlign: 'center',
                      color: 'primary.main'
                    }}
                  >
                    {post.user?.username || post.author_username || `Пользователь ${post.author_id}`}
                  </Typography>
                  {post.is_topic_starter && (
                    <Chip 
                      size="small" 
                      label="Автор темы" 
                      color="primary" 
                      sx={{ fontSize: '0.75rem', bgcolor: '#4caf50', color: 'white' }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {post.user?.fullname || post.author_signature || 'Участник форума'}
                  </Typography>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">Сообщений:</Typography>
                      <Typography variant="caption" fontWeight={500}>
                        {post.user?.posts_count !== undefined ? post.user.posts_count : (post.author_post_count !== undefined ? post.author_post_count : '—')}
                  </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Рег.:</Typography>
                      <Typography variant="caption" fontWeight={500}>
                        {post.user?.registration_date 
                          ? formatLocalDate(post.user.registration_date, {
                              year: 'numeric',
                              month: 'long'
                            }) 
                          : post.created_at 
                              ? formatLocalDate(post.created_at, {
                                  year: 'numeric',
                                  month: 'long'
                                })
                              : '—'}
                  </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            
              {/* Содержимое сообщения */}
              <Grid size={{ xs: 12, md: 9 }} sx={{ p: 0, bgcolor: 'white', position: 'relative' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2,
                  bgcolor: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {post.created_at 
                        ? formatLocalDate(post.created_at)
                        : '—'
                      }
                    </Typography>
                    {post.is_edited && (
                      <Chip 
                        size="small" 
                        label="Изменено" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuClick(e, post.id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                  
                <Box sx={{ px: 3, py: 2 }} onMouseUp={(e) => handleTextSelection(e, post)}>
                  {/* Цитируемое сообщение */}
                  {post.quoted_post_id && post.quoted_content && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2,
                        mb: 2, 
                        bgcolor: 'grey.50',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormatQuoteRoundedIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="primary" fontWeight={500}>
                          {post.quoted_author || 'Цитата'}:
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {post.quoted_content}
                      </Typography>
                    </Paper>
                  )}
                  
                  {/* Основное сообщение */}
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {post.content}
                  </Typography>
                  
                  {/* Изображения в сообщении */}
                  {post.images && post.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <ImageGallery 
                        images={post.images.map(img => ({
                          id: img.id,
                          image_url: img.image_url,
                          post_id: post.id,
                          created_at: post.created_at
                        }))} 
                      />
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 12,
                  right: 16,
                  display: 'flex',
                  gap: 1
                }}>
                  <Button
                    size="small"
                    color={post.likes_count > 0 ? "primary" : "inherit"}
                    onClick={() => handleLike(post.id)}
                    sx={{ 
                      minWidth: 0,
                      px: 1,
                      bgcolor: post.likes_count > 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: post.likes_count > 0 ? 'rgba(25, 118, 210, 0.12)' : undefined
                      }
                    }}
                  >
                    <ThumbUpAltIcon fontSize="small" />
                    {post.likes_count > 0 && (
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {post.likes_count}
                      </Typography>
                    )}
                  </Button>
                  <Button 
                    size="small" 
                    color={post.dislikes_count > 0 ? "error" : "inherit"}
                    onClick={() => handleDislike(post.id)}
                    sx={{ 
                      minWidth: 0,
                      px: 1,
                      bgcolor: post.dislikes_count > 0 ? 'rgba(211, 47, 47, 0.08)' : 'transparent',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: post.dislikes_count > 0 ? 'rgba(211, 47, 47, 0.12)' : undefined
                      }
                    }}
                  >
                    <ThumbDownAltIcon fontSize="small" />
                    {post.dislikes_count > 0 && (
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {post.dislikes_count}
                      </Typography>
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, value) => handlePageChange(value)} 
            color="primary"
            disabled={loading}
            size="large"
          />
      </Box>
      )}

      {/* Форма ответа */}
      {topic && !topic.is_closed && (
        <Paper 
          elevation={0} 
          ref={replyBoxRef}
          sx={{ 
            mt: 4, 
            p: 3, 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ответить в теме
          </Typography>
          
          {/* Блок цитаты */}
          {currentQuote && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2,
                mb: 2, 
                bgcolor: 'grey.50',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <IconButton 
                size="small" 
                onClick={handleRemoveQuote}
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 20,
                  height: 20,
                  p: 0
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {currentQuote.author} писал(а):
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {currentQuote.text}
              </Typography>
            </Paper>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={6}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Введите текст сообщения..."
            variant="outlined"
            ref={textFieldRef}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {previewImages.map(img => (
                  <Box 
                    key={img.id} 
                    sx={{ 
                      position: 'relative',
                  width: 120,
                  height: 90,
                      borderRadius: 1,
                  overflow: 'hidden'
                    }}
                  >
                    <img 
                  src={img.url}
                  alt="Preview"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                    <IconButton 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        right: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)',
                    },
                    p: 0.5
                      }}
                      onClick={() => removeImage(img.id)}
                    >
                  <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
                variant="outlined"
                startIcon={<InsertPhotoIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Добавить изображение
            </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
          </Box>
          <Button 
            variant="contained" 
            color="primary"
              endIcon={<ReplyIcon />}
              onClick={handleReply}
              disabled={!reply.trim() && !currentQuote || isSubmitting}
          >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
          </Button>
          </Box>
        </Paper>
      )}

      {/* Меню для цитирования выделенного текста */}
      {selectionMenuPosition && (
        <Box
          className="selection-menu"
          sx={{
            position: 'absolute',
            top: selectionMenuPosition.top,
            left: selectionMenuPosition.left,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: 'white',
            borderRadius: 1,
            boxShadow: 3,
            overflow: 'hidden'
          }}
        >
          <Button
            size="small"
            startIcon={<FormatQuoteIcon />}
            onClick={handleQuoteSelection}
            sx={{ 
              py: 1, 
              px: 2,
              borderRadius: 0,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Цитировать
          </Button>
        </Box>
      )}
      
      {/* Меню действий с сообщением */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleQuote(activePostId!);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <FormatQuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Цитировать</ListItemText>
        </MenuItem>
        {/* Другие пункты меню (только для админов или автора) */}
        {(userStore.isAdmin || (activePostId && posts.find(p => p.id === activePostId)?.author_id === userStore.user?.id)) && (
          <>
          <MenuItem onClick={() => handleEditPost(activePostId!)}>
            <ListItemIcon>
                <EditIcon fontSize="small" />
            </ListItemIcon>
              <ListItemText>Редактировать</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDeletePost(activePostId!)} disabled={isDeletingPost && deletingPostId === activePostId}>
            <ListItemIcon>
                <DeleteIcon fontSize="small" />
            </ListItemIcon>
              <ListItemText>{isDeletingPost && deletingPostId === activePostId ? 'Удаление...' : 'Удалить'}</ListItemText>
          </MenuItem>
          </>
        )}
        {userStore.isAdmin && activePostId === posts[0]?.id && topic && (
          <>
            <Divider />
            <MenuItem onClick={handlePinTopic}>
              <ListItemIcon>
                <PushPinIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {topic.is_pinned ? 'Открепить тему' : 'Закрепить тему'}
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseTopic}>
              <ListItemIcon>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {topic.is_closed ? 'Открыть тему' : 'Закрыть тему'}
              </ListItemText>
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={() => handleOpenReportDialog(activePostId!)}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Пожаловаться</ListItemText>
        </MenuItem>
        {/* Пункт меню только для администраторов */}
        {userStore.isAdmin && (
          <>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ color: 'error.main' }}>
                Администраторский доступ
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Диалог редактирования сообщения */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Редактирование сообщения</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            inputRef={editTextFieldRef}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Отмена</Button>
          <Button 
            variant="contained"
            onClick={handleSaveEdit}
            disabled={!editContent.trim() || isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог отправки жалобы */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Пожаловаться на сообщение</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Пожалуйста, укажите причину жалобы на это сообщение. Модераторы рассмотрят вашу жалобу в ближайшее время.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Укажите причину жалобы..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleReportPost}
            disabled={!reportReason.trim() || isSubmittingReport}
          >
            {isSubmittingReport ? 'Отправка...' : 'Отправить жалобу'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicDetail; 