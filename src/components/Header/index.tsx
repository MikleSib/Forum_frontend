import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Container, Typography, Button, Avatar } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../../assets/bg.png';
import logo from '../../assets/logo.svg';
import { userStore } from '../../shared/store/userStore';
import { IMAGE_BASE_URL } from '../../config/api';

// Создаем пользовательское событие для обновления статуса авторизации
export const AUTH_STATUS_CHANGED = 'auth_status_changed';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

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
        flexShrink: 0
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
                  variant="h4"
                  component="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    lineHeight: 1.2
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
            display: 'flex',
            gap: { xs: 0, md: 2 },
            mt: { xs: 0, md: 2 },
            flexDirection: 'row',
            width: '100%',
            position: 'relative'
          }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button 
                fullWidth
                sx={{ 
                  color: { 
                    xs: '#FFFFFF',
                    md: isCurrentPath('/') ? '#0F1817' : '#FFFFFF'
                  },
                  bgcolor: { 
                    xs: 'transparent', 
                    md: isCurrentPath('/') ? '#D9D9D9' : 'rgba(255,255,255,0)' 
                  },
                  '&:hover': {
                    bgcolor: { xs: 'transparent', md: 'rgba(255,255,255,0.3)' }
                  },
                  fontWeight: { 
                    xs: 500,
                    md: isCurrentPath('/') ? 700 : 500
                  },
                  px: 3,
                  py: 1,
                  borderRadius: { xs: 0, md: '58px' },
                  fontSize: '1rem',
                  height: { xs: '32px', md: 'auto' },
                  minWidth: { xs: 'auto', md: '120px' }
                }}
              >
                Главная
              </Button>
            </Link>
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'none' }, 
                width: '1px', 
                bgcolor: 'rgba(255,255,255,0.3)',
                alignSelf: 'stretch'
              }} 
            />
            <Box sx={{ 
              flex: { xs: 1, md: 'none' },
              display: 'flex'
            }}>
              <Link to="/news" style={{ textDecoration: 'none' }}>
                <Button 
                  sx={{ 
                    color: { 
                      xs: '#FFFFFF',
                      md: isCurrentPath('/news') ? '#0F1817' : '#FFFFFF'
                    },
                    bgcolor: { 
                      xs: 'transparent', 
                      md: isCurrentPath('/news') ? '#D9D9D9' : 'rgba(65, 40, 40, 0)' 
                    },
                    '&:hover': {
                      bgcolor: { xs: 'transparent', md: 'rgba(255,255,255,0.3)' }
                    },
                    fontWeight: { 
                      xs: 500,
                      md: isCurrentPath('/news') ? 700 : 500
                    },
                    px: 3,
                    py: 1,
                    borderRadius: { xs: 0, md: '58px' },
                    fontSize: '1rem',
                    height: { xs: '32px', md: 'auto' },
                    minWidth: { xs: 'auto', md: '120px' },
                    flex: { xs: 1, md: 0 }
                  }}
                >
                  Новости
                </Button>
              </Link>
            </Box>
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'none' }, 
                width: '1px', 
                bgcolor: 'rgba(255,255,255,0.3)',
                alignSelf: 'stretch'
              }} 
            />

            <Box 
              sx={{ 
                display: { xs: 'block', md: 'none' }, 
                width: '1px', 
                bgcolor: 'rgba(255,255,255,0.3)',
                alignSelf: 'stretch'
              }} 
            />
            <Box sx={{ 
              flex: { xs: 1, md: 'none' },
              display: 'flex'
            }}>
              <Link to="/forum" style={{ textDecoration: 'none' }}>
                <Button 
                  sx={{ 
                    color: { 
                      xs: '#FFFFFF',
                      md: isCurrentPath('/forum') ? '#0F1817' : '#FFFFFF'
                    },
                    bgcolor: { 
                      xs: 'transparent', 
                      md: isCurrentPath('/forum') ? '#D9D9D9' : 'rgba(255,255,255,0)' 
                    },
                    '&:hover': {
                      bgcolor: { xs: 'transparent', md: 'rgba(255,255,255,0.3)' }
                    },
                    fontWeight: { 
                      xs: 500,
                      md: isCurrentPath('/forum') ? 700 : 500
                    },
                    px: 3,
                    py: 1,
                    borderRadius: { xs: 0, md: '58px' },
                    fontSize: '1rem',
                    height: { xs: '32px', md: 'auto' },
                    minWidth: { xs: 'auto', md: '120px' },
                    flex: { xs: 1, md: 0 }
                  }}
                >
                  Форум
                </Button>
              </Link>
            </Box>
            
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'none' }, 
                width: '1px', 
                bgcolor: 'rgba(255,255,255,0.3)',
                alignSelf: 'stretch'
              }} 
            />
            <Box sx={{ 
              flex: { xs: 1, md: 'none' },
              display: 'flex'
            }}>
              <Link to="/marketplace" style={{ textDecoration: 'none' }}>
                <Button 
                  sx={{ 
                    color: { 
                      xs: '#FFFFFF',
                      md: isCurrentPath('/marketplace') ? '#0F1817' : '#FFFFFF'
                    },
                    bgcolor: { 
                      xs: 'transparent', 
                      md: isCurrentPath('/marketplace') ? '#D9D9D9' : 'rgba(255,255,255,0)' 
                    },
                    '&:hover': {
                      bgcolor: { xs: 'transparent', md: 'rgba(255,255,255,0.3)' }
                    },
                    fontWeight: { 
                      xs: 500,
                      md: isCurrentPath('/marketplace') ? 700 : 500
                    },
                    px: 3,
                    py: 1,
                    borderRadius: { xs: 0, md: '58px' },
                    fontSize: '1rem',
                    height: { xs: '32px', md: 'auto' },
                    minWidth: { xs: 'auto', md: '120px' },
                    flex: { xs: 1, md: 0 }
                  }}
                >
                  Маркетплейс
                </Button>
              </Link>
            </Box>
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
    </Box>
  );
};

export default Header; 