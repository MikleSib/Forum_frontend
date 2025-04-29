import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login, saveTokens } from '../../services/auth';
import styles from './Auth.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ username, password });
      saveTokens(response);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box className={styles.formContainer}>
        <Typography variant="h4" component="h1" gutterBottom>
          Вход в систему
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Имя пользователя"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors(prev => ({ ...prev, username: undefined }));
            }}
            error={!!fieldErrors.username}
            helperText={fieldErrors.username}
            required
          />

          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            required
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
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Нет аккаунта?{' '}
              <Link href="/register" underline="hover">
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login; 