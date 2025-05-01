import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Container, Typography, Button, Avatar } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../../assets/bg.png';
import logo from '../../assets/logo.svg';
import { userStore } from '../../shared/store/userStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    if (token) {
      setUser(userStore.user);
    }
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
            minHeight: '200px !important', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            gap: 1,
            position: 'relative'
          }}
        >
          <Box sx={{ 
            position: 'absolute',
            top: 16,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            {isAuth && user ? (
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={user.avatar} 
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
            ) : (
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
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              component="img" 
              src={logo} 
              alt="Logo" 
              sx={{ 
                width: 60, 
                height: 60, 
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
                  fontSize: '2rem',
                  lineHeight: 1.2
                }}
              >
                Рыболовный форум
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'white',
                  opacity: 0.8
                }}
              >
                Сообщество увлеченных рыбалкой
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            mt: 2
          }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/') ? '#D9D9D9' : 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem'
                }}
              >
                Главная
              </Button>
            </Link>
            <Link to="/news" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/news') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/news') ? '#D9D9D9' : 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/news') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem'
                }}
              >
                Новости
              </Button>
            </Link>
            <Link to="/photos" style={{ textDecoration: 'none' }}>
              <Button 
                sx={{ 
                  color: isCurrentPath('/photos') ? '#0F1817' : '#FFFFFF',
                  bgcolor: isCurrentPath('/photos') ? '#D9D9D9' : 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  fontWeight: isCurrentPath('/photos') ? 700 : 500,
                  px: 3,
                  py: 1,
                  borderRadius: '58px',
                  fontSize: '1rem'
                }}
              >
                Фотографии
              </Button>
            </Link>
          </Box>
          <Box sx={{ 
            position: 'absolute', 
            right: 0,
            bottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'white'
          }}>
            <Typography variant="body2" sx={{ lineHeight: '32px', fontWeight: 700  }}>2 поста</Typography>
            <Typography variant="body2" sx={{ mx: 1, lineHeight: '32px', fontWeight: 700   }}>|</Typography>
            <Typography variant="body2" sx={{ lineHeight: '32px', fontWeight: 700  }}>45 участников</Typography>
            <Typography variant="body2" sx={{ mx: 1, lineHeight: '32px', fontWeight: 700   }}>|</Typography>
            <Typography variant="body2" sx={{ color: '#E09609', lineHeight: '32px', fontWeight: 700 }}>2 новых</Typography>
          </Box>
        </Toolbar>
      </Container>
    </Box>
  );
};

export default Header; 