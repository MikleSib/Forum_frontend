import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { API_URL } from '../../config/api';

const VerifyEmail: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Получаем email из параметров URL или из state при переходе
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/verify-email?to_email=${encodeURIComponent(email)}&code=${code}`);
      
      // Если получен успешный HTTP-статус (2xx), значит верификация успешна
      if (response.status >= 200 && response.status < 300) {
        setSuccess(true);
      } else {
        setError(response.data?.message || response.data?.detail || 'Произошла ошибка при подтверждении email');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Произошла ошибка при подтверждении email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Разрешаем только цифры
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {!success ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <MarkEmailReadIcon sx={{ fontSize: 60, color: '#1976d5', mb: 2 }} />
              <Typography variant="h5" component="h1" gutterBottom>
                Подтверждение Email
              </Typography>
              <Typography color="text.secondary">
                Мы отправили код подтверждения на адрес {email}. 
                Пожалуйста, введите его ниже для продолжения регистрации.
              </Typography>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                icon={<ErrorOutlineIcon fontSize="inherit" />}
              >
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Код подтверждения"
                variant="outlined"
                value={code}
                onChange={handleCodeChange}
                placeholder="Введите 6 цифр"
                inputProps={{ 
                  inputMode: 'numeric',
                  maxLength: 6,
                  pattern: '[0-9]*'
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d5',
                    },
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || code.length !== 6}
                sx={{
                  bgcolor: '#1976d5',
                  color: 'white',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderRadius: '58px',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Подтвердить'}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Email успешно подтвержден!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Ваш адрес электронной почты был успешно подтвержден. 
              Теперь вы можете войти в систему.
            </Typography>
            
            <Button
              onClick={handleLoginClick}
              fullWidth
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#1976d5',
                color: 'white',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '58px',
                '&:hover': {
                  bgcolor: '#1565c0',
                }
              }}
            >
              Войти
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail; 