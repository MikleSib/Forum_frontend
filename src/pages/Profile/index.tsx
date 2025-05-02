import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Avatar, Button, TextField, Tabs, Tab, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { userStore } from '../../shared/store/userStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth';
import { AUTH_STATUS_CHANGED } from '../../components/Header';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    about: '',
    avatar: ''
  });

  useEffect(() => {
    const user = userStore.user;
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        about: user.about || '',
        avatar: user.avatar || ''
      });
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Здесь будет логика сохранения данных
  };

  const handleLogout = () => {
    authApi.logout();
    // Запускаем событие для обновления статуса авторизации в Header
    window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500, color: '#1A1A1A' }}>
          Профиль
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: '58px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              bgcolor: 'rgba(211, 47, 47, 0.04)',
              borderColor: '#b71c1c'
            }
          }}
        >
          Выйти
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Левая колонка с фото */}
        <Paper elevation={0} sx={{ 
          width: { xs: '100%', md: 300 }, 
          p: 3, 
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          border: '1px solid #E5E5E5'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1A1A1A', fontWeight: 500 }}>
            Фотография
          </Typography>
          <Box sx={{ 
            position: 'relative',
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            mb: 2,
            mx: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <Avatar
              src={userData.avatar}
              sx={{ 
                width: '100%', 
                height: '100%',
                bgcolor: '#008191'
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' },
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{
              bgcolor: '#1976d5',
              color: '#FFFFFF',
              borderRadius: '58px',
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: '#1565c0',
                boxShadow: '0 4px 12px rgba(25, 118, 213, 0.3)'
              }
            }}
          >
            Загрузить фото
            <input hidden accept="image/*" type="file" />
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Вы можете загрузить фотографию профиля
          </Typography>
        </Paper>

        {/* Правая колонка с деталями */}
        <Paper elevation={0} sx={{ 
          flex: 1,
          p: 3,
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          border: '1px solid #E5E5E5'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1A1A1A', fontWeight: 500 }}>
            Детали профиля
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { 
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  px: 3,
                  minWidth: 100,
                  color: '#666666'
                },
                '& .Mui-selected': {
                  color: '#1976d5 !important',
                  fontWeight: 600
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d5',
                  height: '3px'
                }
              }}
            >
              <Tab label="Личные данные" />
              <Tab label="Пароль" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Typography sx={{ mb: 3, color: '#666666' }}>
              Заполните ваши данные, вы можете изменить их в любое время
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Имя"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d5',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Фамилия"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d5',
                      },
                    },
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="E-mail"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="О себе"
                multiline
                rows={4}
                value={userData.about}
                onChange={(e) => setUserData({ ...userData, about: e.target.value })}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '58px',
                  bgcolor: '#1976d5',
                  color: '#FFFFFF',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#1565c0',
                    boxShadow: '0 4px 12px rgba(25, 118, 213, 0.3)'
                  }
                }}
              >
                Сохранить
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography sx={{ mb: 3, color: '#666666' }}>
              Здесь вы можете изменить пароль
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="password"
                label="Текущий пароль"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Новый пароль"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Подтвердите новый пароль"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '58px',
                  bgcolor: '#1976d5',
                  color: '#FFFFFF',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#1565c0',
                    boxShadow: '0 4px 12px rgba(25, 118, 213, 0.3)'
                  }
                }}
              >
                Сохранить
              </Button>
            </form>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 