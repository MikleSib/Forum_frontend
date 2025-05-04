import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Container, Avatar, Button, TextField, Tabs, Tab, IconButton, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { userStore } from '../../shared/store/userStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth';
import { updateUserAvatar, deleteUserAvatar, updateUserProfile, changeUserPassword, getUserProfile } from '../../services/api';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    about_me: '',
    avatar: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Загружаем данные профиля с сервера используя правильный эндпоинт
        const profileData = await getUserProfile();
        
        // Обновляем локальное состояние данными с сервера
        setUserData({
          username: profileData.username || '',
          email: profileData.email || '',
          about_me: profileData.about_me || '',
          avatar: profileData.avatar || ''
        });
        
        // Данные уже обновляются в userStore внутри функции getUserProfile
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
        setLoadError('Не удалось загрузить данные профиля. Обновите страницу или попробуйте позже.');
        
        // Если не удалось получить данные с сервера, используем данные из userStore как резервные
        const user = userStore.user;
        if (user) {
          setUserData({
            username: user.username || '',
            email: user.email || '',
            about_me: user.about_me || user.about || '',
            avatar: user.avatar || ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setIsProfileUpdating(true);
      setProfileUpdateError(null);
      
      // Проверка данных
      if (!userData.username.trim()) {
        setProfileUpdateError('Имя пользователя не может быть пустым');
        setIsProfileUpdating(false);
        return;
      }
      
      // Обновляем профиль на сервере
      const response = await updateUserProfile({
        username: userData.username,
        about_me: userData.about_me
      });
      
      // Обновляем локальные данные
      if (response) {
        setUserData(prev => ({
          ...prev,
          username: response.username,
          about_me: response.about_me || ''
        }));
        setProfileUpdateSuccess(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setProfileUpdateError('Не удалось обновить профиль. Возможно, имя пользователя уже занято.');
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    // Запускаем событие для обновления статуса авторизации в Header
    window.dispatchEvent(new Event(AUTH_STATUS_CHANGED));
    navigate('/');
  };
  
  // Обработчик загрузки аватара
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsAvatarUploading(true);
      setUploadError(null);
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setUploadError('Выбранный файл не является изображением');
        setIsAvatarUploading(false);
        return;
      }
      
      // Проверяем размер файла (не более 5 МБ)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Размер файла не должен превышать 5 МБ');
        setIsAvatarUploading(false);
        return;
      }
      
      // Отправляем аватар на сервер
      const response = await updateUserAvatar(file);
      
      // Обновляем аватар в локальном состоянии
      if (response && response.avatar) {
        setUserData(prev => ({
          ...prev,
          avatar: response.avatar
        }));
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      setUploadError('Не удалось загрузить аватар. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsAvatarUploading(false);
    }
  };
  
  // Обработчик клика на кнопку загрузки
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Обработчик удаления аватара
  const handleRemoveAvatar = async () => {
    try {
      setIsAvatarUploading(true);
      setUploadError(null);
      
      // Отправляем запрос на удаление аватара
      const response = await deleteUserAvatar();
      
      // Обновляем аватар в локальном состоянии
      if (response) {
        setUserData(prev => ({
          ...prev,
          avatar: ''
        }));
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error('Ошибка при удалении аватара:', error);
      setUploadError('Не удалось удалить аватар. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsAvatarUploading(false);
    }
  };
  
  // Закрытие уведомления об успешной загрузке
  const handleCloseSuccessAlert = () => {
    setUploadSuccess(false);
  };
  
  // Закрытие уведомления об ошибке
  const handleCloseErrorAlert = () => {
    setUploadError(null);
  };
  
  // Закрытие уведомления об успешном обновлении профиля
  const handleCloseProfileSuccessAlert = () => {
    setProfileUpdateSuccess(false);
  };
  
  // Закрытие уведомления об ошибке обновления профиля
  const handleCloseProfileErrorAlert = () => {
    setProfileUpdateError(null);
  };

  // Обработчик смены пароля
  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setIsPasswordChanging(true);
      setPasswordChangeError(null);
      
      // Проверка данных
      if (!passwordData.currentPassword) {
        setPasswordChangeError('Введите текущий пароль');
        setIsPasswordChanging(false);
        return;
      }
      
      if (!passwordData.newPassword) {
        setPasswordChangeError('Введите новый пароль');
        setIsPasswordChanging(false);
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordChangeError('Новый пароль должен содержать минимум 8 символов');
        setIsPasswordChanging(false);
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordChangeError('Пароли не совпадают');
        setIsPasswordChanging(false);
        return;
      }
      
      // Отправляем запрос на смену пароля
      await changeUserPassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      // Очищаем форму и показываем сообщение об успехе
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordChangeSuccess(true);
    } catch (error: any) {
      console.error('Ошибка при смене пароля:', error);
      
      // Обработка различных типов ошибок
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.detail;
        
        if (status === 400 && message?.includes('Неверный текущий пароль')) {
          setPasswordChangeError('Текущий пароль указан неверно');
        } else if (status === 401) {
          setPasswordChangeError('Ошибка авторизации. Возможно, ваша сессия истекла. Перезайдите в аккаунт.');
          // Перенаправляем на страницу логина через 3 секунды
          setTimeout(() => {
            authApi.logout();
            navigate('/login');
          }, 3000);
        } else if (status === 404) {
          setPasswordChangeError('Пользователь не найден. Перезайдите в аккаунт.');
        } else if (status === 500) {
          setPasswordChangeError('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          setPasswordChangeError(message || 'Произошла ошибка при смене пароля');
        }
      } else {
        setPasswordChangeError('Не удалось выполнить запрос. Проверьте подключение к интернету.');
      }
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // Закрытие уведомления об успешной смене пароля
  const handleClosePasswordSuccessAlert = () => {
    setPasswordChangeSuccess(false);
  };
  
  // Закрытие уведомления об ошибке смены пароля
  const handleClosePasswordErrorAlert = () => {
    setPasswordChangeError(null);
  };

  // Создаем функцию обновления профиля
  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Загружаем данные профиля с сервера
      const profileData = await getUserProfile();
      
      // Обновляем локальное состояние данными с сервера
      setUserData({
        username: profileData.username || '',
        email: profileData.email || '',
        about_me: profileData.about_me || '',
        avatar: profileData.avatar || ''
      });
      
      // Показываем уведомление об успешном обновлении
      setProfileUpdateSuccess(true);
    } catch (error) {
      console.error('Ошибка при обновлении данных профиля:', error);
      setLoadError('Не удалось обновить данные профиля. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : loadError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadError}
        </Alert>
      ) : (
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}>
              {isAvatarUploading ? (
                <CircularProgress size={60} />
              ) : (
                <>
                  <Avatar
                    src={userData.avatar}
                    sx={{ 
                      width: '100%', 
                      height: '100%',
                      bgcolor: '#008191'
                    }}
                  >
                    {userData.username ? userData.username[0].toUpperCase() : '?'}
                  </Avatar>
                  {userData.avatar && (
                    <IconButton
                      onClick={handleRemoveAvatar}
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
                  )}
                </>
              )}
            </Box>
            <input 
              ref={fileInputRef}
              hidden 
              accept="image/*" 
              type="file" 
              onChange={handleAvatarUpload}
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              onClick={handleUploadButtonClick}
              disabled={isAvatarUploading}
              startIcon={<PhotoCameraIcon />}
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
              {isAvatarUploading ? 'Загрузка...' : 'Загрузить фото'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Вы можете загрузить фотографию профиля в формате JPG, PNG или GIF размером до 5 МБ
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
                <TextField
                  fullWidth
                  label="Имя пользователя"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
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
                  label="E-mail"
                  value={userData.email}
                  disabled
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
                  helperText="Email можно поменять через поддержку"
                />
                <TextField
                  fullWidth
                  label="О себе"
                  multiline
                  rows={4}
                  value={userData.about_me}
                  onChange={(e) => setUserData({ ...userData, about_me: e.target.value })}
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
                  disabled={isProfileUpdating}
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
                  {isProfileUpdating ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Typography sx={{ mb: 3, color: '#666666' }}>
                Здесь вы можете изменить пароль
              </Typography>
              <form onSubmit={handlePasswordChange}>
                <TextField
                  fullWidth
                  type="password"
                  label="Текущий пароль"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Новый пароль"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                  required
                  helperText="Минимум 8 символов"
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Подтвердите новый пароль"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                  required
                  error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                  helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Пароли не совпадают' : ''}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPasswordChanging}
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
                  {isPasswordChanging ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </form>
            </TabPanel>
          </Paper>
        </Box>
      )}
      
      {/* Уведомления для аватара */}
      <Snackbar open={uploadSuccess} autoHideDuration={6000} onClose={handleCloseSuccessAlert}>
        <Alert onClose={handleCloseSuccessAlert} severity="success" sx={{ width: '100%' }}>
          Аватар успешно обновлен!
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!uploadError} autoHideDuration={6000} onClose={handleCloseErrorAlert}>
        <Alert onClose={handleCloseErrorAlert} severity="error" sx={{ width: '100%' }}>
          {uploadError}
        </Alert>
      </Snackbar>
      
      {/* Уведомления для обновления профиля */}
      <Snackbar open={profileUpdateSuccess} autoHideDuration={6000} onClose={handleCloseProfileSuccessAlert}>
        <Alert onClose={handleCloseProfileSuccessAlert} severity="success" sx={{ width: '100%' }}>
          Профиль успешно обновлен!
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!profileUpdateError} autoHideDuration={6000} onClose={handleCloseProfileErrorAlert}>
        <Alert onClose={handleCloseProfileErrorAlert} severity="error" sx={{ width: '100%' }}>
          {profileUpdateError}
        </Alert>
      </Snackbar>
      
      {/* Уведомления для смены пароля */}
      <Snackbar open={passwordChangeSuccess} autoHideDuration={6000} onClose={handleClosePasswordSuccessAlert}>
        <Alert onClose={handleClosePasswordSuccessAlert} severity="success" sx={{ width: '100%' }}>
          Пароль успешно изменен!
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!passwordChangeError} autoHideDuration={6000} onClose={handleClosePasswordErrorAlert}>
        <Alert onClose={handleClosePasswordErrorAlert} severity="error" sx={{ width: '100%' }}>
          {passwordChangeError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 