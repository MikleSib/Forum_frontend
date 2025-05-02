import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Typography, Paper, Divider, Button, 
  Breadcrumbs, Avatar, Chip, IconButton, TextField,
  Card, CardContent, CardActions, Grid, Menu, MenuItem,
  ListItemIcon, ListItemText, CircularProgress, Tooltip
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
import { userStore } from '../../shared/store/userStore';
import { forumCategories } from './index';
import { topicsData } from './CategoryDetail';
import ImageGallery from '../../components/ImageGallery';

// Типы данных для постов
interface PostImage {
  id: number;
  image_url: string;
  post_id?: number; // Опциональное поле
  created_at?: string; // Опциональное поле
}

interface PostAuthor {
  id: number;
  name: string;
  avatar: string;
  joinDate: string;
  postsCount: number;
  role: string;
}

interface QuotedPost {
  id: number;
  author: {
    id: number;
    name: string;
  };
  content: string;
}

interface Post {
  id: number;
  content: string;
  author: PostAuthor;
  createdAt: string;
  isTopicStarter: boolean;
  likes: number;
  dislikes: number;
  images?: PostImage[];
  quotedPost?: QuotedPost;
}

// Моковые данные для темы
export const topicData = {
  id: 1,
  title: 'Лучшие спиннинги для начинающих',
  category: {
    id: 1,
    title: 'Рыболовные снасти',
    icon: '🎣'
  },
  author: {
    id: 1,
    name: 'Александр',
    avatar: 'https://i.pravatar.cc/150?img=1',
    joinDate: 'Май 2022',
    postsCount: 128,
    role: 'Продвинутый рыболов'
  },
  createdAt: '2 дня назад',
  views: 678,
  isPinned: true,
  isClosed: false,
  tags: ['Начинающим', 'Снаряжение']
};

// Моковые данные для сообщений в теме
const postsData: Post[] = [
  {
    id: 1,
    content: `
Всем привет! Я недавно заинтересовался рыбалкой и хочу приобрести свой первый спиннинг. 
Бюджет ограничен, но хочется что-то качественное, на чем можно будет нормально учиться и ловить.

Какие модели спиннингов посоветуете для новичка, который только начинает осваивать спиннинговую ловлю? 
Интересует что-то универсальное, чтобы можно было ловить как на небольших речках, так и на водохранилищах.

Заранее спасибо за советы!
    `,
    author: {
      id: 1,
      name: 'Александр',
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinDate: 'Май 2022',
      postsCount: 128,
      role: 'Продвинутый рыболов'
    },
    createdAt: '2 дня назад',
    isTopicStarter: true,
    likes: 5,
    dislikes: 0
  },
  {
    id: 2,
    content: `
Привет! Для начинающего могу посоветовать несколько вариантов в бюджетном сегменте:

1. **Salmo Sniper SPIN** - хороший бюджетный вариант, довольно универсальный. Можно брать с тестом 10-30г.

2. **Shimano Catana EX** - чуть дороже, но очень надежный и приятный в работе спиннинг. Тест 10-30г или 15-40г в зависимости от того, какую рыбу планируешь ловить.

3. **FAVORITE Laguna** - неплохой вариант по соотношению цена/качество.

Главное при выборе первого спиннинга - не гнаться за ультралайтом или специализированными моделями. Лучше взять что-то среднее по тесту и жесткости, чтобы можно было освоить разные техники ловли и понять, что тебе больше нравится.

Удачи в выборе!
    `,
    author: {
      id: 2,
      name: 'Михаил',
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinDate: 'Февраль 2020',
      postsCount: 543,
      role: 'Эксперт по снастям'
    },
    createdAt: '2 дня назад',
    isTopicStarter: false,
    likes: 8,
    dislikes: 0
  },
  {
    id: 3,
    content: `
Полностью согласна с Михаилом насчет универсальности для первого спиннинга!

Я бы еще добавила в список:

**Major Craft Finetail** - отличный вариант для начинающих, хорошая чувствительность и при этом достаточная прочность.

**Daiwa Ninja** - тоже хороший вариант в бюджетном сегменте.

И очень важно - не забудь про правильный выбор катушки! Даже к недорогому спиннингу лучше взять катушку приличного качества. Shimano Nexave или Daiwa Ninja подойдут очень хорошо.

Также советую обратить внимание на плетеный шнур вместо монолески для спиннинга - с ним ты будешь лучше чувствовать поклевки.
    `,
    author: {
      id: 3,
      name: 'Елена',
      avatar: 'https://i.pravatar.cc/150?img=3',
      joinDate: 'Июнь 2021',
      postsCount: 231,
      role: 'Активный участник'
    },
    createdAt: '1 день назад',
    isTopicStarter: false,
    likes: 6,
    dislikes: 0
  },
  {
    id: 4,
    content: `
Спасибо всем за советы! 

@Михаил, @Елена - очень ценные рекомендации, изучу все предложенные варианты. 

Вопрос про длину - какую оптимальную длину спиннинга посоветуете для новичка? Видел модели от 1.8м до 2.7м, и не могу определиться.
    `,
    author: {
      id: 1,
      name: 'Александр',
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinDate: 'Май 2022',
      postsCount: 128,
      role: 'Продвинутый рыболов'
    },
    createdAt: '1 день назад',
    isTopicStarter: true,
    likes: 1,
    dislikes: 0,
    quotedPost: {
      id: 3,
      author: {
        id: 3,
        name: 'Елена'
      },
      content: 'И очень важно - не забудь про правильный выбор катушки! Даже к недорогому спиннингу лучше взять катушку приличного качества.'
    }
  },
  {
    id: 5,
    content: `
Насчет длины спиннинга для начинающего:

Если в основном планируешь ловить с берега на открытых водоемах - бери 2.4-2.7м. Это даст тебе хороший заброс и возможность манипулировать приманкой на расстоянии.

Если часто будешь рыбачить в стесненных условиях (небольшие речки с заросшими берегами) - можно взять покороче, 2.1-2.4м.

Спиннинги короче 2.1м обычно используются для специализированной ловли или с лодки.

По моему опыту, для новичка оптимально 2.4м - такая длина довольно универсальна.
    `,
    author: {
      id: 5,
      name: 'Сергей',
      avatar: 'https://i.pravatar.cc/150?img=5',
      joinDate: 'Март 2019',
      postsCount: 872,
      role: 'Местная легенда'
    },
    createdAt: '20 часов назад',
    isTopicStarter: false,
    likes: 4,
    dislikes: 0
  },
  {
    id: 6,
    content: `
А что насчет каких-то китайских спиннингов на Aliexpress? Видел там много вариантов по низким ценам. Стоит ли рассматривать такие варианты или лучше не рисковать?
    `,
    author: {
      id: 4,
      name: 'Дмитрий',
      avatar: 'https://i.pravatar.cc/150?img=4',
      joinDate: 'Январь 2022',
      postsCount: 47,
      role: 'Новичок'
    },
    createdAt: '12 часов назад',
    isTopicStarter: false,
    likes: 0,
    dislikes: 1
  },
  {
    id: 7,
    content: `
@Дмитрий, из личного опыта скажу - с китайскими спиннингами нужно быть очень осторожным. Есть неплохие модели, но найти их среди моря откровенного шлака сложно.

Если уж очень ограничен бюджет, то лучше посмотреть на б/у спиннинги от известных брендов на местных досках объявлений или форумах.

А если всё же рассматривать китайские варианты, то могу посоветовать обратить внимание на Tsurinoya и Kastking - эти бренды зарекомендовали себя неплохо даже среди опытных рыболовов. Но всё равно есть риск нарваться на подделку.

@Александр, как успехи в выборе? На чем остановился в итоге?
    `,
    author: {
      id: 2,
      name: 'Михаил',
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinDate: 'Февраль 2020',
      postsCount: 543,
      role: 'Эксперт по снастям'
    },
    createdAt: '5 часов назад',
    isTopicStarter: false,
    likes: 3,
    dislikes: 0
  }
];

const TopicDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [selectionAnchorEl, setSelectionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedText, setSelectedText] = useState<{text: string, postId: number, author: string} | null>(null);
  const selectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [topic, setTopic] = useState(topicData);
  const [posts, setPosts] = useState<Post[]>(postsData);
  const [userLikes, setUserLikes] = useState<number[]>([]);
  const [userDislikes, setUserDislikes] = useState<number[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<PostImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quoteData, setQuoteData] = useState<{id: number, author: string, content: string} | null>(null);
  
  const open = Boolean(anchorEl);
  const isAuth = !!userStore.user; // Проверка авторизации пользователя
  
  useEffect(() => {
    if (topicId) {
      // В реальном приложении здесь был бы API-запрос для получения данных темы
      // Имитируем получение данных из моковых данных
      const foundTopic = topicsData.find(t => t.id === parseInt(topicId));
      if (foundTopic) {
        const matchingCategory = forumCategories.find(c => c.title === topic.category.title);
        setTopic({
          ...topic,
          title: foundTopic.title,
          category: {
            ...topic.category,
            id: matchingCategory?.id || topic.category.id
          },
          author: foundTopic.author as unknown as typeof topic.author, // Приведение типов
          createdAt: foundTopic.createdAt,
          views: foundTopic.views,
          isPinned: foundTopic.isPinned || false,
          isClosed: foundTopic.isClosed || false,
          tags: foundTopic.tags || []
        });
      }
    }
  }, [topicId]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentPostId(null);
  };

  const handleQuote = (postId: number) => {
    const postToQuote = posts.find(post => post.id === postId);
    if (!postToQuote) return;
    
    // Устанавливаем только данные цитаты без добавления в textarea
    setQuoteData({
      id: postId,
      author: postToQuote.author.name,
      content: postToQuote.content.trim().substring(0, 150) + (postToQuote.content.length > 150 ? '...' : '')
    });
    
    // Прокручиваем к форме ответа
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
      replyForm.scrollIntoView({ behavior: 'smooth' });
      
      // Анимация для привлечения внимания
      replyForm.style.transition = 'box-shadow 0.3s ease-in-out';
      replyForm.style.boxShadow = '0 0 15px rgba(25, 118, 210, 0.5)';
      
      setTimeout(() => {
        if (replyForm) {
          replyForm.style.boxShadow = 'none';
        }
      }, 1000);
    }
    
    handleMenuClose();
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: userLikes.includes(postId) ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
    
    setUserLikes(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
    
    // Если пост был дизлайкнут, убираем дизлайк
    if (userDislikes.includes(postId)) {
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, dislikes: post.dislikes - 1 } 
          : post
      ));
      
      setUserDislikes(prev => prev.filter(id => id !== postId));
    }
  };
  
  const handleDislike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, dislikes: userDislikes.includes(postId) ? post.dislikes - 1 : post.dislikes + 1 } 
        : post
    ));
    
    setUserDislikes(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
    
    // Если пост был лайкнут, убираем лайк
    if (userLikes.includes(postId)) {
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes - 1 } 
          : post
      ));
      
      setUserLikes(prev => prev.filter(id => id !== postId));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Проверка количества изображений (максимум 5)
    if (images.length + files.length > 5) {
      alert('Можно загрузить не более 5 изображений');
      return;
    }
    
    setIsCompressing(true);
    
    // Имитация обработки и загрузки изображений
    setTimeout(() => {
      const newImages: PostImage[] = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        image_url: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newImages]);
      setIsCompressing(false);
    }, 1000);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Фильтруем только изображения
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) return;
    
    // Проверка количества изображений (максимум 5)
    if (images.length + imageFiles.length > 5) {
      alert('Можно загрузить не более 5 изображений');
      return;
    }
    
    setIsCompressing(true);
    
    // Имитация обработки и загрузки изображений
    setTimeout(() => {
      const newImages: PostImage[] = imageFiles.map((file, index) => ({
        id: Date.now() + index,
        image_url: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newImages]);
      setIsCompressing(false);
    }, 1000);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const removeImage = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };
  
  const handleReply = () => {
    if (!replyContent.trim() && images.length === 0) return;
    
    setIsSubmitting(true);
    
    // Имитация отправки ответа
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now(),
        content: replyContent,
        author: {
          id: userStore.user?.id || 1,
          name: userStore.user?.username || 'Пользователь',
          avatar: userStore.user?.avatar || 'https://i.pravatar.cc/150?img=1',
          joinDate: 'Май 2023',
          postsCount: 10,
          role: 'Участник форума'
        },
        createdAt: 'только что',
        isTopicStarter: topic.author.id === (userStore.user?.id || 1),
        likes: 0,
        dislikes: 0,
        images: images.length > 0 ? images : undefined,
        quotedPost: quoteData ? {
          id: quoteData.id,
          author: {
            id: 0,
            name: quoteData.author
          },
          content: quoteData.content
        } : undefined
      };
      
      setPosts([...posts, newPost]);
      setReplyContent('');
      setImages([]);
      setQuoteData(null);
      setIsSubmitting(false);
    }, 1500);
  };

  // Функция для обработки выделения текста
  const handleTextSelection = (event: React.MouseEvent, post: Post) => {
    const selection = window.getSelection();
    
    if (selection && selection.toString().trim().length > 0) {
      // Есть выделенный текст
      const text = selection.toString().trim();
      
      // Сохраняем выделенный текст и информацию о посте
      setSelectedText({
        text,
        postId: post.id,
        author: post.author.name
      });
      
      // Получаем координаты выделения для позиционирования меню
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Создаем временный элемент для привязки меню
      const tempButton = document.createElement('div');
      tempButton.style.position = 'absolute';
      tempButton.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
      tempButton.style.top = `${rect.bottom + window.scrollY}px`;
      tempButton.style.width = '1px';
      tempButton.style.height = '1px';
      document.body.appendChild(tempButton);
      
      // Устанавливаем якорь для меню
      setSelectionAnchorEl(tempButton);
      
      // Очищаем предыдущий таймер, если он был
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
      
      // Устанавливаем таймер для скрытия меню, если пользователь не взаимодействует с ним
      selectionTimeout.current = setTimeout(() => {
        setSelectionAnchorEl(null);
        setSelectedText(null);
        if (document.body.contains(tempButton)) {
          document.body.removeChild(tempButton);
        }
      }, 3000);
    }
  };
  
  // Функция для цитирования выделенного текста
  const handleQuoteSelectedText = () => {
    if (!selectedText) return;
    
    // Устанавливаем только данные цитаты без добавления в textarea
    setQuoteData({
      id: selectedText.postId,
      author: selectedText.author,
      content: selectedText.text
    });
    
    // Прокручиваем страницу к форме ответа
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
      replyForm.scrollIntoView({ behavior: 'smooth' });
      
      // Анимация для привлечения внимания
      replyForm.style.transition = 'box-shadow 0.3s ease-in-out';
      replyForm.style.boxShadow = '0 0 15px rgba(25, 118, 210, 0.5)';
      
      setTimeout(() => {
        if (replyForm) {
          replyForm.style.boxShadow = 'none';
        }
      }, 1000);
    }
    
    // Очищаем выделение и закрываем меню
    if (selectionAnchorEl instanceof HTMLElement && document.body.contains(selectionAnchorEl)) {
      document.body.removeChild(selectionAnchorEl);
    }
    setSelectionAnchorEl(null);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  };
  
  // Обработчик клика вне выделения для закрытия меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Проверяем, что клик был вне меню выделения
      if (
        selectionAnchorEl && 
        !(event.target instanceof Node && (event.target as Element).closest?.('.selection-quote-button'))
      ) {
        if (selectionAnchorEl instanceof HTMLElement && document.body.contains(selectionAnchorEl)) {
          document.body.removeChild(selectionAnchorEl);
        }
        setSelectionAnchorEl(null);
        setSelectedText(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
      if (selectionAnchorEl instanceof HTMLElement && document.body.contains(selectionAnchorEl)) {
        document.body.removeChild(selectionAnchorEl);
      }
    };
  }, [selectionAnchorEl]);

  if (!topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Хлебные крошки и заголовок */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Главная</Typography>
          </Link>
          <Link to="/forum" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Форум</Typography>
          </Link>
          <Link to={`/forum/category/${topic.category.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">{topic.category.title}</Typography>
          </Link>
          <Typography color="text.primary" fontWeight={500}>{topic.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3, gap: 2 }}>
          <IconButton 
            sx={{ bgcolor: 'action.hover' }} 
            onClick={() => navigate(`/forum/category/${topic.category.id}`)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {topic.isPinned && (
                <Chip 
                  size="small" 
                  label="Закреплено" 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }} 
                />
              )}
              {topic.isClosed && (
                <Chip 
                  size="small" 
                  label="Закрыто" 
                  sx={{ 
                    bgcolor: 'text.secondary', 
                    color: 'white',
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }} 
                />
              )}
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {topic.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {topic.author.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topic.createdAt}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topic.views} просмотров
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {topic.tags.map((tag: string, index: number) => (
                <Chip 
                  key={index}
                  size="small" 
                  label={tag} 
                  sx={{ 
                    bgcolor: 'action.hover', 
                    height: 24,
                    fontSize: '0.75rem'
                  }} 
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Сообщения в теме */}
      <Box sx={{ mb: 4 }}>
        {posts.map((post) => (
          <Paper 
            key={post.id} 
            elevation={0} 
            sx={{ 
              mb: 2, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Grid container>
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
                <Avatar 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
                <Typography variant="subtitle1" fontWeight={600}>
                  {post.author.name}
                </Typography>
                {post.isTopicStarter && (
                  <Chip 
                    size="small" 
                    label="Автор темы" 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      height: 20,
                      fontSize: '0.7rem',
                      mt: 0.5
                    }} 
                  />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {post.author.role}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  На форуме с {post.author.joinDate}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Сообщений: {post.author.postsCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Box sx={{ p: 2, position: 'relative', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {post.createdAt}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuClick(e, post.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  {post.quotedPost && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1.5, 
                        mb: 2, 
                        bgcolor: 'action.hover', 
                        borderLeft: '4px solid',
                        borderColor: 'primary.light',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5 }}>
                        {post.quotedPost.author.name} писал(а):
                      </Typography>
                      <Typography variant="body2">
                        {post.quotedPost.content}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      mb: post.images && post.images.length > 0 ? 2 : 3
                    }}
                    onMouseUp={(e) => handleTextSelection(e, post)}
                  >
                    {post.content}
                  </Typography>
                  
                  {post.images && post.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <ImageGallery images={post.images as any[]} />
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 'auto',
                    position: 'absolute',
                    bottom: 16,
                    left: 16
                  }}>
                    <Button 
                      variant="text" 
                      size="small" 
                      startIcon={<ThumbUpAltIcon />}
                      onClick={() => handleLike(post.id)}
                      sx={{ 
                        color: userLikes.includes(post.id) ? 'success.main' : 'text.secondary',
                        minWidth: 0
                      }}
                    >
                      {post.likes}
                    </Button>
                    <Button 
                      variant="text" 
                      size="small" 
                      startIcon={<ThumbDownAltIcon />}
                      onClick={() => handleDislike(post.id)}
                      sx={{ 
                        color: userDislikes.includes(post.id) ? 'error.main' : 'text.secondary',
                        minWidth: 0
                      }}
                    >
                      {post.dislikes}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Форма для ответа */}
      {!topic.isClosed && isAuth ? (
        <Paper 
          id="reply-form"
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            border: '1px solid', 
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ответить в тему
          </Typography>
          
          {quoteData && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5, 
                mb: 2, 
                bgcolor: 'action.hover', 
                borderLeft: '4px solid',
                borderColor: 'primary.light',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <IconButton 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  top: 4, 
                  right: 4,
                  width: 20,
                  height: 20
                }}
                onClick={() => {
                  console.log('Удаление цитаты');
                  setQuoteData(null);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5 }}>
                {quoteData.author} писал(а):
              </Typography>
              <Typography variant="body2">
                {quoteData.content}
              </Typography>
            </Paper>
          )}
          
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            placeholder="Введите ваше сообщение..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {/* Загрузка изображений */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Изображения ({images.length}/5)
            </Typography>
            
            <Box 
              sx={{ 
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('forum-image-upload')?.click()}
            >
              {isCompressing ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2
                }}>
                  <CircularProgress size={40} color="primary" />
                  <Typography variant="body2" sx={{ mt: 1.5 }}>
                    Обработка изображений...
                  </Typography>
                </Box>
              ) : (
                <>
                  <InsertPhotoIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Перетащите изображения сюда или нажмите для выбора
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="forum-image-upload"
                    disabled={images.length >= 5}
                  />
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    disabled={images.length >= 5}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('forum-image-upload')?.click();
                    }}
                  >
                    Выбрать изображения
                  </Button>
                </>
              )}
            </Box>
            
            {/* Предпросмотр загруженных изображений */}
            {images.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                mb: 2
              }}>
                {images.map(img => (
                  <Box 
                    key={img.id} 
                    sx={{ 
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <img 
                      src={img.image_url} 
                      alt="Загруженное изображение" 
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
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        width: 20,
                        height: 20,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                        }
                      }}
                      onClick={() => removeImage(img.id)}
                    >
                      <DeleteIcon fontSize="small" sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ReplyIcon />}
              onClick={handleReply}
              disabled={(!replyContent.trim() && images.length === 0) || isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
            </Button>
          </Box>
        </Paper>
      ) : topic.isClosed ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'action.hover',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Эта тема закрыта для новых сообщений
          </Typography>
        </Paper>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'action.hover',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>
            Для ответа в тему необходимо авторизоваться
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/login')}
          >
            Войти
          </Button>
        </Paper>
      )}

      {/* Кнопка "Цитировать" для выделенного текста */}
      <Menu
        anchorEl={selectionAnchorEl}
        open={Boolean(selectionAnchorEl)}
        onClose={() => {
          if (selectionAnchorEl instanceof HTMLElement && document.body.contains(selectionAnchorEl)) {
            document.body.removeChild(selectionAnchorEl);
          }
          setSelectionAnchorEl(null);
          setSelectedText(null);
        }}
        className="selection-quote-button"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 'auto'
          }
        }}
      >
        <MenuItem onClick={handleQuoteSelectedText} sx={{ py: 0.5, px: 1 }}>
          <ListItemIcon sx={{ minWidth: 30 }}>
            <FormatQuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Цитировать" 
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
          />
        </MenuItem>
      </Menu>

      {/* Контекстное меню для сообщений */}
      <Menu
        anchorEl={anchorEl}
        id="post-menu"
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => currentPostId && handleQuote(currentPostId)}>
          <ListItemIcon>
            <FormatQuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Цитировать</ListItemText>
        </MenuItem>
        
        {/* Пункты меню для администратора */}
        {userStore.isAdmin && (
          <MenuItem>
            <ListItemIcon>
              <FlagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Пометить как нарушение</ListItemText>
          </MenuItem>
        )}
        
        {/* Пункты меню для первого сообщения (если пользователь администратор) */}
        {userStore.isAdmin && currentPostId === posts[0]?.id && (
          <MenuItem>
            <ListItemIcon>
              <LockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {topic.isClosed ? 'Открыть тему' : 'Закрыть тему'}
            </ListItemText>
          </MenuItem>
        )}
        
        {userStore.isAdmin && currentPostId === posts[0]?.id && (
          <MenuItem>
            <ListItemIcon>
              <PushPinIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {topic.isPinned ? 'Открепить тему' : 'Закрепить тему'}
            </ListItemText>
          </MenuItem>
        )}
        
        {userStore.isAdmin && (
          <MenuItem>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>
              {currentPostId === posts[0]?.id ? 'Удалить тему' : 'Удалить сообщение'}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default TopicDetail; 