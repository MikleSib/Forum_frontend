import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Container, Typography, Button, Tabs, Tab, Paper, Divider, InputBase, Grid, List, ListItem, ListItemText, ListItemButton, ListItemIcon, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Link, Tooltip, Alert, Drawer, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { galleryApi, Gallery } from '../../services/galleryApi'; 
import PostCard from '../../components/PostCard';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import FeedIcon from '@mui/icons-material/Feed';
import MapIcon from '@mui/icons-material/Map';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RoomIcon from '@mui/icons-material/Room';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PetsIcon from '@mui/icons-material/Pets';
import EventIcon from '@mui/icons-material/Event';
import styles from './Dashboard.module.css';
import { getPosts, getUserProfile } from '../../services/api';
import { Post } from '../../shared/types/post.types';
import { NewsCategory } from '../../shared/types/news.types';
import { useTheme, useMediaQuery } from '@mui/material';
import { newsApi } from '../../services/newsApi';
import logo from '../../assets/logo.svg';
import { AUTH_STATUS_CHANGED } from '../../components/Header';
import { userStore } from '../../shared/store/userStore';
import { YMaps, Map as YMap, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import imageCache from '../../utils/imageCache';
import { IMAGE_BASE_URL } from '../../config/api';
import YandexAds from '../../components/YandexAds';
import HotTopics from '../../components/HotTopics';
import { SEO } from '../../components/SEO/SEO';
import { SchemaMarkup } from '../../components/SEO/SchemaMarkup';
import { seoConfig } from '../../config/seo.config';
import WeatherWidget from '../../components/WeatherWidget';


// Другие варианты карт:
// Esri World Terrain (только природный рельеф): "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
// Esri World Physical (физическая карта без границ): "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
// Stamen Terrain (красивая карта рельефа): "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png"
// Thunderforest Landscape: "https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png"
// Thunderforest Outdoors: "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"

// Типы сортировки


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      className={styles.tabPanel}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TopicItem {
  id: number;
  name: string;
  category: NewsCategory;
}

interface CategoryStats {
  news: number;
  fish_species: number;
}

const TOPIC_ICONS: Record<NewsCategory, React.ReactElement> = {
  [NewsCategory.NEWS]: <NewspaperIcon sx={{ color: 'var(--primary-color)' }} />,
  [NewsCategory.FISH_SPECIES]: <PetsIcon sx={{ color: 'var(--primary-color)' }} />,
  [NewsCategory.EVENTS]: <EventIcon sx={{ color: 'var(--primary-color)' }} />
};

// Интерфейс для меток рыбных мест
interface FishingSpot {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description: string;
  createdBy?: string;
  createdAt?: Date;
}

// Тип для событий Яндекс карт
interface YandexMapEvent {
  get: (name: string) => any;
  originalEvent: {
    target: any;
  };
}

// CSS для пульсации метки
const pulsingDotStyles = {
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'rgba(44, 110, 178, 0.5)',
    animation: 'pulse 1.5s infinite',
    top: '0',
    left: '0',
    zIndex: -1
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.8
    },
    '70%': {
      transform: 'scale(2.5)',
      opacity: 0
    },
    '100%': {
      transform: 'scale(3)',
      opacity: 0
    }
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    posts: 0,
    users: 45,
    newToday: 3
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({
    news: 0,
    fish_species: 0
  });
  
  // Всегда сортируем по новым постам
  const sortType = 'newest';
  
  // Состояние для отображения контента
  const [activeView, setActiveView] = useState<'posts' | 'map' | 'gallery'>('posts');
  
  // Состояния для работы с картой
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 55.7558, lng: 37.6173 }); // Москва по умолчанию
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSpotTitle, setNewSpotTitle] = useState('');
  const [newSpotDescription, setNewSpotDescription] = useState('');
  const [locationRequested, setLocationRequested] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchPositionRef = useRef<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Состояния для галереи
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryHasMore, setGalleryHasMore] = useState(true);
  const [gallerySortBy, setGallerySortBy] = useState<'newest' | 'popular' | 'most_commented'>('newest');
  const [galleryTabValue, setGalleryTabValue] = useState(0);

  const topics: TopicItem[] = [
    { id: 1, name: "Новости", category: NewsCategory.NEWS },
    { id: 2, name: "Виды рыб", category: NewsCategory.FISH_SPECIES },
    { id: 3, name: "События", category: NewsCategory.EVENTS },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, statsData] = await Promise.all([
          getPosts(1),
          newsApi.getCategoryStats()
        ]);
        
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newItems = postsData.items.filter(item => !existingIds.has(item.id));
          return [...prevPosts, ...newItems];
        });
        setHasMore(postsData.page < postsData.total_pages);
        setCategoryStats(statsData);
        
        // Обновляем статистику постов
        setStats(prev => ({
          ...prev,
          posts: postsData.total
        }));

        // Приоритезируем кеширование изображений из постов
        if (postsData.items && postsData.items.length > 0) {
          // Собираем URL всех изображений
          const imageUrls: string[] = [];
          postsData.items.forEach(post => {
            if (post.images && Array.isArray(post.images)) {
              post.images.forEach(image => {
                if (image && image.image_url) {
                  imageUrls.push(image.image_url);
                }
              });
            }
          });

          // Оптимизируем загрузку изображений с приоритетом кеша
          if (imageUrls.length > 0) {
            imageCache.prioritizeDashboardImages(imageUrls, IMAGE_BASE_URL)
              .then(cachedUrls => {
                console.log(`Обработано ${cachedUrls.length} изображений для Dashboard`);
              })
              .catch(err => {
                console.error('Ошибка при кешировании изображений:', err);
              });
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    // Проверяем статус авторизации и загружаем профиль
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      setIsAuth(!!token);
      
      if (token) {
        try {
          await getUserProfile();
        } catch (error) {
          console.error('Ошибка при загрузке профиля:', error);
        }
      }
    };

    // Проверяем наличие токена в localStorage и загружаем профиль
    checkAuthStatus();

    // Добавляем слушатель на изменение статуса авторизации
    window.addEventListener(AUTH_STATUS_CHANGED, checkAuthStatus);

    fetchData();

    // Очищаем слушатель при размонтировании
    return () => {
      window.removeEventListener(AUTH_STATUS_CHANGED, checkAuthStatus);
    };
  }, []);

  // Обработка состояния навигации (для возврата из создания фото)
  useEffect(() => {
    const state = (location as any).state;
    if (state?.activeView) {
      setActiveView(state.activeView);
      // Очищаем состояние навигации
      window.history.replaceState({}, document.title);
    }
  }, [(location as any).state]);

  // Загрузка галерей при переходе на вкладку галереи
  useEffect(() => {
    if (activeView === 'gallery' && galleries.length === 0 && !galleryLoading) {
      loadGalleries(1, true);
    }
  }, [activeView]); // Убираем galleries.length и galleryLoading из зависимостей

  // Перезагрузка галерей при смене сортировки
  useEffect(() => {
    if (activeView === 'gallery' && galleries.length === 0 && !galleryLoading) {
      loadGalleries(1, true);
    }
  }, [gallerySortBy]);

  const loadMorePosts = async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await getPosts(nextPage);
      
      if (response.items.length > 0) {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newItems = response.items.filter(item => !existingIds.has(item.id));
          return [...prevPosts, ...newItems];
        });
        setPage(nextPage);
        setHasMore(response.page < response.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError('Ошибка при загрузке дополнительных постов');
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, isLoadingMore]);

  // Переход на страницу создания поста
  const handleCreatePost = () => {
    navigate('/create-post');
  };

  // Переход на страницу входа
  const handleLogin = () => {
    navigate('/login');
  };

  // Переход на страницу отдельного поста
  const handlePostClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTopicClick = (category: NewsCategory) => {
    navigate(`/news?category=${category}`);
  };

  const handleNavClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const getCategoryCount = (category: NewsCategory): number => {
    switch (category) {
      case NewsCategory.NEWS:
        return categoryStats.news;
      case NewsCategory.FISH_SPECIES:
        return categoryStats.fish_species;
      case NewsCategory.EVENTS:
        return 0; // Assuming events are not counted in the stats
      default:
        return 0;
    }
  };

  const getPublicationWord = (count: number): string => {
    if (count === 1) return 'публикация';
    if (count > 1 && count < 5) return 'публикации';
    return 'публикаций';
  };

  // Сохранение новой метки
  const handleSaveSpot = () => {
    if (newSpotTitle) {
      const position = newMarkerPosition || {
        lat: parseFloat((document.getElementById('latitudeInput') as HTMLInputElement)?.value || mapCenter.lat.toString()),
        lng: parseFloat((document.getElementById('longitudeInput') as HTMLInputElement)?.value || mapCenter.lng.toString())
      };
      
      const newSpot: FishingSpot = {
        id: Date.now().toString(),
        position: position,
        title: newSpotTitle,
        description: newSpotDescription,
        createdBy: isAuth ? userStore.user?.username : 'Гость',
        createdAt: new Date()
      };
      setFishingSpots([...fishingSpots, newSpot]);
      
      // Сохраняем метки в localStorage
      localStorage.setItem('fishingSpots', JSON.stringify([...fishingSpots, newSpot]));
      
      // Сбрасываем состояния
      setNewMarkerPosition(null);
      setNewSpotTitle('');
      setNewSpotDescription('');
      setIsAddingMarker(false);
      setIsDialogOpen(false);
    }
  };

  // Удаление метки
  const handleDeleteSpot = (spotId: string) => {
    const updatedSpots = fishingSpots.filter(spot => spot.id !== spotId);
    setFishingSpots(updatedSpots);
    setSelectedSpot(null);
    
    // Обновляем localStorage
    localStorage.setItem('fishingSpots', JSON.stringify(updatedSpots));
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    if (isAddingMarker) {
      setIsAddingMarker(false);
    }
  };

  // Загрузка меток из localStorage при инициализации
  useEffect(() => {
    const savedSpots = localStorage.getItem('fishingSpots');
    if (savedSpots) {
      try {
        setFishingSpots(JSON.parse(savedSpots));
      } catch (e) {
        console.error('Ошибка при загрузке меток:', e);
      }
    }
  }, []);

  // Обработчик клика по пункту меню "Карта рыбных мест"
  const handleFishingMapClick = () => {
    setActiveView('map');
  };

  // Обработчик клика по пункту меню "Главная"
  const handleHomeClick = () => {
    setActiveView('posts');
  };

  // Обработчик клика по пункту меню "Фотогалерея"
  const handleGalleryClick = () => {
    setActiveView('gallery');
  };

  // Переход на страницу создания фото
  const handleCreatePhoto = () => {
    navigate('/create-photo');
  };

  // Загрузка галерей
  const loadGalleries = async (page: number = 1, reset: boolean = false) => {
    if (galleryLoading) return;
    
    try {
      setGalleryLoading(true);
      setGalleryError(null);
      
      const response = await galleryApi.getGalleries(page, 12, gallerySortBy);
      
      if (reset) {
        setGalleries(response.items);
      } else {
        setGalleries(prev => [...prev, ...response.items]);
      }
      
      setGalleryPage(page);
      setGalleryHasMore(response.page < response.total_pages);
    } catch (err: any) {
      console.error('Ошибка при загрузке галерей:', err);
      setGalleryError('Не удалось загрузить галереи');
    } finally {
      setGalleryLoading(false);
    }
  };

  // Загрузка дополнительных галерей
  const loadMoreGalleries = () => {
    if (galleryHasMore && !galleryLoading) {
      loadGalleries(galleryPage + 1, false);
    }
  };

  // Обработчик изменения вкладки галереи
  const handleGalleryTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setGalleryTabValue(newValue);
    let newSortBy: 'newest' | 'popular' | 'most_commented' = 'newest';
    
    switch (newValue) {
      case 0:
        newSortBy = 'newest';
        break;
      case 1:
        newSortBy = 'popular';
        break;
      case 2:
        newSortBy = 'most_commented';
        break;
    }
    
    if (newSortBy !== gallerySortBy) {
      setGallerySortBy(newSortBy);
      setGalleryPage(1);
      setGalleryHasMore(true);
      setGalleries([]); // Очищаем текущие галереи
    }
  };

  // Функция для создания новой метки
  const handleYandexMapClick = (e: YandexMapEvent) => {
    if (isAddingMarker) {
      const coords = e.get('coords');
      if (coords) {
        const position = {
          lat: coords[0],
          lng: coords[1]
        };
        setNewMarkerPosition(position);
        setIsDialogOpen(true);
      }
    }
  };

  // Функция для перехода к метке на карте
  const handleSpotClick = (spot: FishingSpot) => {
    setSelectedSpot(spot);
    setMapCenter(spot.position);
  };

  // Функция для определения местоположения пользователя
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Геолокация не поддерживается вашим браузером');
      return;
    }
    
    setLocationLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = { lat: latitude, lng: longitude };
        setMapCenter(userPos);
        setUserLocation(userPos);
        setLocationLoading(false);
        setLocationRequested(true);
      },
      (error) => {
        setLocationLoading(false);
        setLocationError(
          error.code === 1 
            ? 'Доступ к геолокации запрещен. Пожалуйста, предоставьте разрешение в настройках браузера.' 
            : 'Не удалось определить ваше местоположение. Пожалуйста, попробуйте позже.'
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };
  
  // Функция для отслеживания изменения местоположения пользователя
  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      // Останавливаем отслеживание
      if (watchPositionRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
        watchPositionRef.current = null;
      }
      setIsTrackingLocation(false);
    } else {
      // Начинаем отслеживание
      if (!navigator.geolocation) {
        setLocationError('Геолокация не поддерживается вашим браузером');
        return;
      }
      
      setLocationLoading(true);
      
      try {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userPos = { lat: latitude, lng: longitude };
            setUserLocation(userPos);
            // При активном отслеживании центрируем карту на местоположении пользователя
            if (isTrackingLocation) {
              setMapCenter(userPos);
            }
            setLocationLoading(false);
            setLocationRequested(true);
          },
          (error) => {
            setLocationLoading(false);
            setLocationError(
              error.code === 1 
                ? 'Доступ к геолокации запрещен. Пожалуйста, предоставьте разрешение в настройках браузера.' 
                : 'Не удалось определить ваше местоположение. Пожалуйста, попробуйте позже.'
            );
            setIsTrackingLocation(false);
            if (watchPositionRef.current !== null) {
              navigator.geolocation.clearWatch(watchPositionRef.current);
              watchPositionRef.current = null;
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
        
        watchPositionRef.current = watchId;
        setIsTrackingLocation(true);
      } catch (err) {
        setLocationLoading(false);
        setLocationError('Не удалось начать отслеживание местоположения');
        setIsTrackingLocation(false);
      }
    }
  };
  
  // Эффект для центрирования карты при отслеживании
  useEffect(() => {
    if (isTrackingLocation && userLocation) {
      setMapCenter(userLocation);
    }
  }, [isTrackingLocation, userLocation]);
  
  // Очистка отслеживания при размонтировании компонента
  useEffect(() => {
    return () => {
      if (watchPositionRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
    };
  }, []);
  
  // Запрос геолокации при первом отображении карты
  useEffect(() => {
    if (activeView === 'map' && !locationRequested && !locationLoading) {
      // Запрашиваем геолокацию напрямую - браузер сам покажет необходимый интерфейс
      getUserLocation();
    }
  }, [activeView, locationRequested, locationLoading]);

  // Обработчик открытия и закрытия мобильного меню
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Обработчик клика по пункту мобильного меню с закрытием меню
  const handleMobileNavClick = (callback: () => void) => {
    return () => {
      callback();
      setMobileMenuOpen(false);
    };
  };

  // Сортировка постов по дате (новые вверху)
  const getSortedPosts = useCallback(() => {
    return [...posts].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts]);

  // Отсортированный список постов
  const sortedPosts = useMemo(() => getSortedPosts(), [getSortedPosts]);

  // Сброс скролла и очистка контента при смене вкладки
  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeView === 'map' || activeView === 'gallery') {
      setPosts([]);
      setLoading(false); // чтобы не мигал лоадер
    }
    if (activeView === 'posts') {
      setGalleries([]);
      setGalleryLoading(false);
    }
  }, [activeView]);

  return (
    <>
      <SEO
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        keywords={seoConfig.home.keywords}
        canonical="https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/"
      />
      <SchemaMarkup
        type="WebSite"
        data={{
          name: 'Рыболовный форум',
          url: 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai',
          description: seoConfig.home.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />
      
      <Container maxWidth={false} sx={{ 
        maxWidth: '1600px', 
        p: 0,
        position: 'relative',
        zIndex: 1
      }}>

      {/* Мобильная шапка с бургер-меню */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'sticky', top: 0, zIndex: 1100 }}>
        <AppBar position="static" color="primary" elevation={0} className={styles.mobileAppBar} sx={{ borderRadius: 0, mt: { xs: 0, md: 2 } }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" className={styles.mobileAppBarTitle} sx={{ flexGrow: 1 }}>
              Рыболовный форум
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      
      {/* Мобильное боковое меню */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', borderRadius: 0 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className={styles.mobileMenuHeader}>
          <Typography variant="h6" sx={{ color: 'white' }}>Навигация</Typography>
          <IconButton onClick={toggleMobileMenu} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List className={styles.mobileMenuList}>
          <ListItemButton 
            onClick={handleMobileNavClick(handleHomeClick)} 
            className={activeView === 'posts' ? styles.mobileMenuItem + ' ' + styles.active : styles.mobileMenuItem}
          >
            <ListItemIcon>
              <FeedIcon color={activeView === 'posts' ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Лента новостей" />
          </ListItemButton>
          <ListItemButton 
            onClick={handleMobileNavClick(handleFishingMapClick)}
            className={activeView === 'map' ? styles.mobileMenuItem + ' ' + styles.active : styles.mobileMenuItem}
          >
            <ListItemIcon>
              <MapIcon color={activeView === 'map' ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Карта рыбных мест" />
          </ListItemButton>
          <ListItemButton 
            onClick={handleMobileNavClick(handleGalleryClick)}
            className={activeView === 'gallery' ? styles.mobileMenuItem + ' ' + styles.active : styles.mobileMenuItem}
          >
            <ListItemIcon>
              <PhotoLibraryIcon color={activeView === 'gallery' ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Фотогалерея" />
          </ListItemButton>

        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Темы</Typography>
          <List>
            {topics.map((topic) => (
              <ListItemButton 
                key={topic.id}
                onClick={() => {
                  handleTopicClick(topic.category);
                  setMobileMenuOpen(false);
                }}
              >
                <ListItemIcon>
                  {TOPIC_ICONS[topic.category]}
                </ListItemIcon>
                <ListItemText 
                  primary={topic.name}
                  secondary={`${getCategoryCount(topic.category)} ${getPublicationWord(getCategoryCount(topic.category))}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <WeatherWidget userLocation={userLocation} />
        </Box>
      </Drawer>
    


      <Box sx={{ mt: { xs: 0, md: 3 } }}>
        {/* Основной контент с боковыми панелями */}
        <Box sx={{ 
          display: 'flex', 
          gap: { md: 2, lg: 3 }, 
          maxWidth: '1600px', 
          mx: 'auto', 
          px: 2,
          alignItems: 'flex-start'
        }}>
          {/* Левая колонка */}
          <Box sx={{ 
            width: { md: 200, lg: 250 }, 
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }}>
            <Paper sx={{ 
              p: 2, 
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Навигация</Typography>
              <List>
                <ListItemButton onClick={handleHomeClick}>
                  <ListItemIcon>
                    <FeedIcon color={activeView === 'posts' ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Лента новостей" />
                </ListItemButton>
                <ListItemButton onClick={handleFishingMapClick}>
                  <ListItemIcon>
                    <MapIcon color={activeView === 'map' ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Карта рыбных мест" />
                </ListItemButton>
                <ListItemButton onClick={handleGalleryClick}>
                  <ListItemIcon>
                    <PhotoLibraryIcon color={activeView === 'gallery' ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Фотогалерея" />
                </ListItemButton>
              </List>
            </Paper>
            
            {/* Виджет погоды для рыбалки */}
            <WeatherWidget userLocation={userLocation} />
          </Box>

          {/* Центральная колонка */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {activeView === 'map' ? (
              <Paper sx={{ 
                p: 2, 
                mb: 1,
                mt: { xs: 2, md: 0 },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 2,
                  gap: 1
                }}>
                  <Typography variant="h6">Карта рыбных мест</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' },
                    gap: 1 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      width: { xs: '100%', sm: 'auto' },
                      gap: 1 
                    }}>
   
           
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={isAddingMarker ? <RoomIcon /> : <AddIcon />}
                      color={isAddingMarker ? "secondary" : "primary"}
                      onClick={() => setIsAddingMarker(!isAddingMarker)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {isAddingMarker ? 'Отменить' : 'Добавить метку'}
                    </Button>
                  </Box>
                </Box>
                
                {locationError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {locationError}
                  </Alert>
                )}
                
                {isAddingMarker && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Кликните на карту, чтобы выбрать место для метки
                  </Alert>
                )}
                
                <Box sx={{ position: 'relative', height: { xs: '400px', sm: '500px', md: '600px' }, borderRadius: '8px', overflow: 'hidden' }}>
                  <YMaps query={{ lang: 'ru_RU', apikey: '' }}>
                    <YMap
                      defaultState={{
                        center: [mapCenter.lat, mapCenter.lng],
                        zoom: 8
                      }}
                      state={{
                        center: [mapCenter.lat, mapCenter.lng],
                        zoom: selectedSpot ? 12 : (userLocation && isTrackingLocation ? 15 : 8)
                      }}
                      width="100%"
                      height="100%"
                      onClick={handleYandexMapClick}
                      modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                    >
                      <ZoomControl />
                      
                      {/* Метка текущего местоположения пользователя */}
                      {userLocation && (
                        <Placemark 
                          geometry={[userLocation.lat, userLocation.lng]}
                          options={{
                            preset: isTrackingLocation ? 'islands#redDotIcon' : 'islands#geolocationIcon',
                            iconColor: isTrackingLocation ? '#ff0000' : '#2c6eb2',
                            zIndex: 999
                          }}
                          properties={{
                            hintContent: 'Ваше местоположение',
                            balloonContentHeader: 'Вы здесь',
                            balloonContentBody: `Ваши координаты: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
                            balloonContentFooter: isTrackingLocation ? 'Отслеживание активно' : '',
                            iconContent: isTrackingLocation ? '<div class="locationPulse"></div>' : ''
                          }}
                          modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                        />
                      )}
                      
                      <Placemark
                        geometry={[mapCenter.lat, mapCenter.lng]}
                        options={{
                          preset: 'islands#blueDotIcon',
                          draggable: isAddingMarker
                        }}
                        onDragEnd={(e: YandexMapEvent) => {
                          const coords = e.get('coords');
                          if (coords) {
                            setNewMarkerPosition({ lat: coords[0], lng: coords[1] });
                            setIsDialogOpen(true);
                          }
                        }}
                      />
                      
                      {fishingSpots.map(spot => (
                        <Placemark
                          key={spot.id}
                          geometry={[spot.position.lat, spot.position.lng]}
                          options={{
                            preset: spot.id === selectedSpot?.id 
                              ? 'islands#redDotIconWithCaption' 
                              : 'islands#blueDotIconWithCaption',
                            openBalloonOnClick: true,
                            hasHint: true,
                            iconColor: spot.id === selectedSpot?.id ? '#FF0000' : '#3b5998'
                          }}
                          properties={{
                            hintContent: spot.title,
                            balloonContentHeader: spot.title,
                            balloonContentBody: spot.description,
                            balloonContentFooter: spot.createdBy ? `Добавил: ${spot.createdBy}` : '',
                            iconCaption: spot.title
                          }}
                          modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                          onClick={() => setSelectedSpot(spot)}
                        />
                      ))}
                    </YMap>
                  </YMaps>
                </Box>
                
                {/* Список добавленных рыбных мест */}
                {fishingSpots.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">Список рыбных мест</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fishingSpots.length} {getPublicationWord(fishingSpots.length)}
                      </Typography>
                    </Box>
                    <List sx={{ 
                      bgcolor: 'background.paper',
                      maxHeight: { xs: '250px', md: 'auto' },
                      overflowY: { xs: 'auto', md: 'visible' },
                      borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      {fishingSpots.map((spot) => (
                        <ListItem 
                          key={spot.id}
                          disablePadding
                          secondaryAction={
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSpot(spot.id);
                            }}
                            size={isMobile ? "small" : "medium"}
                            >
                              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          }
                          sx={{ mb: 1 }}
                        >
                          <ListItemButton
                            onClick={() => handleSpotClick(spot)}
                            sx={{
                              border: selectedSpot?.id === spot.id ? '1px solid #3b5998' : 'none',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: 'rgba(59, 89, 152, 0.08)'
                              },
                              bgcolor: selectedSpot?.id === spot.id ? 'rgba(59, 89, 152, 0.05)' : 'transparent',
                              py: isMobile ? 1 : 1.5
                            }}
                          >
                            <ListItemText 
                              primary={
                                <Typography
                                  component="span" 
                                  fontWeight={selectedSpot?.id === spot.id ? 'bold' : 'normal'}
                                  variant={isMobile ? "body2" : "body1"}
                                >
                                  {spot.title}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ 
                                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2
                                }}>
                                  {spot.description.slice(0, isMobile ? 30 : 50)}
                                  {spot.description.length > (isMobile ? 30 : 50) ? '...' : ''}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            ) : activeView === 'gallery' ? (
              <Paper sx={{ 
                p: 2, 
                mb: 1,
                mt: { xs: 2, md: 0 },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Фотогалерея</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={isAuth ? handleCreatePhoto : handleLogin}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      padding: '10px 20px',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                        background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                  >
                    Добавить фото
                  </Button>
                </Box>
                
                {/* Вкладки фильтрации */}
                <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={galleryTabValue} onChange={handleGalleryTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="Новые" />
                    <Tab label="Лучшие" />
                    <Tab label="Обсуждаемые" />
                  </Tabs>
                </Box>
                
                {/* Отображение ошибки */}
                {galleryError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {galleryError}
                  </Alert>
                )}
                
                {/* Сетка с фотографиями */}
                {galleryLoading && galleries.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : galleries.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 4,
                    color: 'text.secondary'
                  }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Галереи не найдены
                    </Typography>
                    <Typography variant="body2">
                      Станьте первым, кто поделится фотографиями!
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                      gap: 2,
                      mb: 2
                    }}>
                      {galleries.map((gallery) => (
                        <Box
                          key={gallery.id}
                          sx={{
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            }
                          }}
                          onClick={() => {
                            navigate(`/gallery/${gallery.id}`);
                          }}
                        >
                          {gallery.preview_image ? (
                            <>
                              <img
                                src={gallery.preview_image.thumbnail_url || gallery.preview_image.image_url}
                                alt={gallery.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                loading="lazy"
                              />
                              
                              {/* Оверлей с информацией */}
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                color: 'white',
                                p: 1
                              }}>
                                <Typography variant="caption" sx={{ 
                                  display: 'block',
                                  fontWeight: 600,
                                  mb: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {gallery.title}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                    {gallery.images_count} фото
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                    ❤️ {gallery.likes_count}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          ) : (
                            <Box sx={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              color: 'text.secondary'
                            }}>
                              <PhotoIcon sx={{ fontSize: 48, mb: 1 }} />
                              <Typography variant="caption">
                                {gallery.title}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                    
                    {/* Кнопка "Загрузить еще" */}
                    {galleryHasMore && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={loadMoreGalleries}
                          disabled={galleryLoading}
                          startIcon={galleryLoading ? <CircularProgress size={16} /> : undefined}
                        >
                          {galleryLoading ? 'Загрузка...' : 'Загрузить еще'}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            ) : (
              <Paper sx={{ 
                p: 2, 
                mb: 1,
                mt: { xs: 2, md: 0 },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Последние публикации</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />}
                    onClick={isAuth ? handleCreatePost : handleLogin}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      borderRadius: { xs: '10px', sm: '12px' },
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      textTransform: 'none',
                      padding: { xs: '6px 12px', sm: '10px 20px' },
                      minWidth: 0,
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                        background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                  >
                    Создать пост
                  </Button>
                </Box>
                {loading ? (
                  <Typography>Загрузка...</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <>
                    {sortedPosts.map((post) => (
                      <PostCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
                    ))}
                    {isLoadingMore && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            )}
          </Box>

          {/* Правая колонка */}
          <Box sx={{ 
            width: { md: 250, lg: 300 }, 
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }}>
            <HotTopics />
          </Box>
        </Box>
      </Box>

      {/* Диалог для добавления новой метки */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Добавить рыбное место</DialogTitle>
        <DialogContent sx={{ minWidth: '300px' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Название места"
            fullWidth
            value={newSpotTitle}
            onChange={(e) => setNewSpotTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={4}
            value={newSpotDescription}
            onChange={(e) => setNewSpotDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              label="Широта"
              type="number"
              value={newMarkerPosition?.lat || mapCenter.lat}
              disabled
              fullWidth
            />
            <TextField
              margin="dense"
              label="Долгота"
              type="number"
              value={newMarkerPosition?.lng || mapCenter.lng}
              disabled
              fullWidth
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Координаты выбраны на карте. Закройте диалог и нажмите на карту, чтобы изменить местоположение.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSaveSpot} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!newSpotTitle}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </>
  );
};

export default Dashboard; 