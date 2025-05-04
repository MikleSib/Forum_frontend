import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import styles from './Auth.module.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    about_me: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await register(formData);
      
      // Переходим на страницу верификации
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      if (error.response?.data?.detail) {
        if (error.response.data.detail === "User already exists") {
          setError('Пользователь с таким именем или email уже существует');
        } else if (error.response.data.detail === "Пользователь с таким именем уже существует") {
          setError('Пользователь с таким именем уже существует');
        } else {
          setError(error.response.data.detail);
        }
      } else {
        setError(error.message || 'Не удалось зарегистрироваться');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box className={styles.formContainer}>
        <Typography variant="h4" component="h1" gutterBottom>
          Регистрация
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Имя пользователя"
            name="username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <TextField
            label="Пароль"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <TextField
            label="Полное имя"
            name="full_name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <TextField
            label="О себе"
            name="about_me"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.about_me}
            onChange={handleChange}
            multiline
            rows={4}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Уже есть аккаунт?{' '}
              <Link href="/login" underline="hover">
                Войти
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Register; 