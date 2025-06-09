import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  Divider
} from '@mui/material';
import { authApi } from '../../services/auth';
import SocialLoginButtons from '../../components/SocialLoginButtons';
import { SEO } from '../../components/SEO/SEO';
import { seoConfig } from '../../config/seo.config';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Проверяем, требуется ли верификация email
      if (response.requiresEmailVerification && response.email_verification) {
        // Перенаправляем на страницу верификации с email в URL
        navigate(`/verify-email?email=${encodeURIComponent(response.email_verification.email)}`);
        return;
      }
      
      // Если верификация не требуется, перенаправляем на главную страницу
      navigate('/');
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Проверка на необходимость подтверждения email (статус 403)
        if (err.response.status === 403 && errorData.detail === "Необходимо подтвердить email перед входом в систему") {
          // Перенаправляем на страницу верификации с email в URL
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        
        // Обработка ошибок валидации FastAPI
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            setError(errorData.detail[0].msg);
          } else if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (typeof errorData.detail === 'object') {
            setError(Object.values(errorData.detail)[0] as string);
          }
        } else {
          setError('Неверный email или пароль');
        }
      } else {
        setError('Произошла ошибка при попытке входа');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialError = (err: any) => {
    console.error('Ошибка при входе через соцсеть:', err);
    let errorMessage = 'Произошла ошибка при входе через социальную сеть';
    
    // Если есть сообщение об ошибке в объекте ошибки
    if (err && err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
  };

  const handleSocialSuccess = (data: any) => {
    console.log('Успешный вход через соцсеть:', data);
    setError(null);
    navigate('/');
  };

  return (
    <>
      <SEO
        title={seoConfig.login.title}
        description={seoConfig.login.description}
        keywords={seoConfig.login.keywords}
        canonical="https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/login"
      />
      <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom align="center">
            Вход
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            
            <Divider sx={{ my: 2 }}>или войти через</Divider>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <SocialLoginButtons 
                onError={handleSocialError} 
                onSuccess={handleSocialSuccess}
              />
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="/register" variant="body2">
                {"Нет аккаунта? Зарегистрируйтесь"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
    </>
  );
};

export default Login; 