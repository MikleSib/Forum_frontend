import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Drawer,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PetsIcon from '@mui/icons-material/Pets';
import EventIcon from '@mui/icons-material/Event';
import { NewsCategory, NEWS_CATEGORIES, NewsItem, NewsContent } from '../../shared/types/news.types';
import { newsApi } from '../../services/newsApi';
import Header from '../../components/Header';
import { userStore } from '../../shared/store/userStore';

const DRAWER_WIDTH = 280;

const CATEGORY_ICONS = {
  [NewsCategory.NEWS]: <NewspaperIcon />,
  [NewsCategory.GUIDES]: <MenuBookIcon />,
  [NewsCategory.FISH_SPECIES]: <PetsIcon />,
  [NewsCategory.EVENTS]: <EventIcon />
};

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(NewsCategory.NEWS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam && Object.values(NewsCategory).includes(categoryParam as NewsCategory)) {
      setSelectedCategory(categoryParam as NewsCategory);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getNews();
        setNews(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить новости');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleCategoryChange = (category: NewsCategory) => {
    setSelectedCategory(category);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const renderNewsContent = (contents: NewsContent[]) => {
    const firstContent = contents.sort((a, b) => a.order - b.order)[0];
    
    if (!firstContent) return null;

    switch (firstContent.type) {
      case 'image':
        return (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="240"
              image={firstContent.content}
              alt="News preview"
              sx={{ objectFit: 'cover' }}
            />
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ position: 'relative', height: 240 }}>
            <video
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              src={firstContent.content}
              controls
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const getPreviewText = (contents: NewsContent[]) => {
    const textContents = contents
      .filter(content => content.type === 'text')
      .sort((a, b) => a.order - b.order);
    
    return textContents[0]?.content || '';
  };

  const filteredNews = news.filter(item => item.category === selectedCategory);

  const drawer = (
    <Box sx={{ py: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ 
          ml: 2, 
          mb: 3,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        Вернуться
      </Button>
      <List>
        {Object.entries(NEWS_CATEGORIES).map(([category, { title }]) => (
          <ListItem key={category} disablePadding>
            <ListItemButton
              selected={category === selectedCategory}
              onClick={() => handleCategoryChange(category as NewsCategory)}
              sx={{
                borderRadius: '0 24px 24px 0',
                mr: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {CATEGORY_ICONS[category as NewsCategory]}
              </ListItemIcon>
              <ListItemText 
                primary={title}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: category === selectedCategory ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex' }}>
        {/* Боковая панель для десктопа */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                border: 'none',
                bgcolor: 'background.default'
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Боковая панель для мобильных */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Основной контент */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 700,
                color: 'primary.main'
              }}
            >
              {NEWS_CATEGORIES[selectedCategory].title}
            </Typography>
            
            {userStore.isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/news/create')}
                sx={{ ml: 2 }}
              >
                Создать новость
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredNews.map((newsItem) => (
                <Grid size={{ xs: 12, md: 6 }} key={newsItem.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                    onClick={() => handleNewsClick(newsItem.id)}
                  >
                    {renderNewsContent(newsItem.contents)}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          lineHeight: 1.3
                        }}
                      >
                        {newsItem.title}
                      </Typography>

                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        paragraph
                        sx={{ 
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        dangerouslySetInnerHTML={{ __html: getPreviewText(newsItem.contents) }}
                      />

                      <Stack 
                        direction="row" 
                        spacing={1} 
                        alignItems="center"
                        sx={{ 
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          pt: 2,
                          mt: 'auto'
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(newsItem.created_at), 'd MMMM yyyy', { locale: ru })}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNewsClick(newsItem.id);
                          }}
                          sx={{ 
                            ml: 1,
                            borderRadius: 2,
                            textTransform: 'none'
                          }}
                        >
                          Читать
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NewsPage; 