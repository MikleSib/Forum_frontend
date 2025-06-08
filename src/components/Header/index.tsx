import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Container, Typography, Button, Avatar } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../../assets/bg.avif';
import logo from '../../assets/logo.svg';
import { userStore } from '../../shared/store/userStore';
import { IMAGE_BASE_URL } from '../../config/api';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import NewspaperIcon from '@mui/icons-material/Article';
import ForumIcon from '@mui/icons-material/Forum';
import StoreIcon from '@mui/icons-material/Storefront';
import Divider from '@mui/material/Divider';

// Создаем пользовательское событие для обновления статуса авторизации
export const AUTH_STATUS_CHANGED = 'auth_status_changed';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Функция для проверки статуса авторизации
  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    if (token) {
      setUser(userStore.user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Проверяем статус авторизации при монтировании
    checkAuthStatus();
    
    // Добавляем слушатель для события изменения статуса авторизации
    window.addEventListener(AUTH_STATUS_CHANGED, checkAuthStatus);
    
    // Очистка слушателя при размонтировании
    return () => {
      window.removeEventListener(AUTH_STATUS_CHANGED, checkAuthStatus);
    };
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const isCurrentPath = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        background: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          maxWidth: '1600px',
          px: 3
        }}
      >
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: 'auto', md: '200px !important' }, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'column' }, 
            alignItems: { xs: 'stretch', md: 'flex-start' }, 
            justifyContent: 'center', 
            gap: 1,
            position: 'relative',
            pt: { xs: 2, md: 0 },
            pb: { xs: 3, md: 0 }
          }}
        >
          {/* Drawer для мобильного меню */}
          <Drawer
            anchor="right"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{ sx: { background: '#f7f7f7', color: '#222', width: '80vw', maxWidth: 340, p: 0 } }}
          >
            {/* Шапка Drawer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'teal', color: '#000', px: 2, py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>Навигация</Typography>
              <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#000' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            {/* Пункты меню */}
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
              <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, gap: 2, cursor: 'pointer', '&:hover': { bgcolor: '#e0f2f1' }, transition: 'background 0.2s' }}>
                  <HomeIcon sx={{ color: 'teal' }} />
                  <Typography sx={{ color: '#222', fontWeight: 500 }}>Главная</Typography>
                </Box>
              </Link>
              <Link to="/news" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, gap: 2, cursor: 'pointer', '&:hover': { bgcolor: '#e0f2f1' }, transition: 'background 0.2s' }}>
                  <NewspaperIcon sx={{ color: 'teal' }} />
                  <Typography sx={{ color: '#222', fontWeight: 500 }}>Новости</Typography>
                </Box>
              </Link>
              <Link to="/forum" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, gap: 2, cursor: 'pointer', '&:hover': { bgcolor: '#e0f2f1' }, transition: 'background 0.2s' }}>
                  <ForumIcon sx={{ color: 'teal' }} />
                  <Typography sx={{ color: '#222', fontWeight: 500 }}>Форум</Typography>
                </Box>
              </Link>
              <Link to="/marketplace" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, gap: 2, cursor: 'pointer', '&:hover': { bgcolor: '#e0f2f1' }, transition: 'background 0.2s' }}>
                  <StoreIcon sx={{ color: 'teal' }} />
                  <Typography sx={{ color: '#222', fontWeight: 500 }}>Маркетплейс</Typography>
                </Box>
              </Link>
            </Box>
          </Drawer>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 2,
            mb: { xs: 3, md: 0 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                component="img" 
                src={logo} 
                alt="Logo" 
                sx={{ 
                  width: { xs: 40, md: 60 }, 
                  height: { xs: 40, md: 60 }, 
                  filter: 'brightness(0) invert(1)' 
                }} 
              />
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    margin: 0
                  }}
                >
                  Рыболовный форум
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'white',
                    opacity: 0.8,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Сообщество увлеченных рыбалкой
                </Typography>
              </Box>
            </Box>
            {/* Кнопка "Войти" для мобильной версии */}
            {!isAuth && (
              <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  fullWidth
                  sx={{
                    bgcolor: '#F0AA24',
                    color: '#0F1817',
                    borderRadius: '58px',
                    minWidth: '120px',
                    maxWidth: '150px',
                    height: '40px',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: '#E09A14'
                    }
                  }}
                >
                  Войти
                </Button>
              </Box>
            )}
          </Box>

          {/* Кнопка "Войти" для ПК версии */}
          {!isAuth && (
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: 16,
              right: 0
            }}>
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  bgcolor: '#F0AA24',
                  color: '#0F1817',
                  borderRadius: '58px',
                  minWidth: '120px',
                  height: '40px',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#E09A14'
                  }
                }}
              >
                Войти
              </Button>
            </Box>
          )}
          {isAuth && user && (
            <Box sx={{ 
              position: { xs: 'static', md: 'absolute' },
              top: 16,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: { xs: 3, md: 0 }
            }}>
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={user.avatar ? `${IMAGE_BASE_URL}${user.avatar}` : undefined} 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                    border: '2px solid white'
                  }}
                >
                  {getInitials(user.username)}
                </Avatar>
                <Typography 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {user.username}
                </Typography>
              </Link>
            </Box>
          )}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, // Скрываем меню на мобилках, показываем на десктопе
            gap: 2,
            mt: 2,
            flexDirection: 'row',
            width: '100%',
            position: 'relative'
          }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button 
                fullWidth
                sx={{ 
                  color: isCurrentPath('/') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/') ? '#D9D9D9' : 'rgba(255,255,255,0)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                Главная
              </Button>
            </Link>
            <Link to="/news" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/news') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/news') ? '#D9D9D9' : 'rgba(255,255,255,0)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/news') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                Новости
              </Button>
            </Link>
            <Link to="/forum" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/forum') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/forum') ? '#D9D9D9' : 'rgba(255,255,255,0)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/forum') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                Форум
              </Button>
            </Link>
            <Link to="/marketplace" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/marketplace') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/marketplace') ? '#D9D9D9' : 'rgba(255,255,255,0)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/marketplace') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                Маркетплейс
              </Button>
            </Link>
          </Box>
          <Box sx={{ 
            position: { xs: 'static', md: 'absolute' }, 
            right: 0,
            bottom: 16,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            color: 'white',
            mt: { xs: 2, md: 0 }
          }}>
            <Typography variant="body2" sx={{ lineHeight: '32px', fontWeight: 700 }}>2 поста</Typography>
            <Typography variant="body2" sx={{ mx: 1, lineHeight: '32px', fontWeight: 700 }}>|</Typography>
            <Typography variant="body2" sx={{ lineHeight: '32px', fontWeight: 700 }}>45 участников</Typography>
            <Typography variant="body2" sx={{ mx: 1, lineHeight: '32px', fontWeight: 700 }}>|</Typography>
            <Typography variant="body2" sx={{ color: '#E09609', lineHeight: '32px', fontWeight: 700 }}>2 новых</Typography>
          </Box>
        </Toolbar>
      </Container>
      {/* Новый бургер внизу справа */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'absolute', bottom: 16, right: 16, zIndex: 1201 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon sx={{ color: 'white', fontSize: 32 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header; 