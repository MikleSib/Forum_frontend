import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
          variant="outlined"
        >
          Назад
        </Button>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Условия использования
        </Typography>
        <Box sx={{ color: 'text.secondary', fontSize: '1.1rem', mt: 3 }}>
          <p>Добро пожаловать на сайт "Рыболовный форум". Используя наш сайт, вы соглашаетесь соблюдать следующие условия:</p>
          <ol style={{ paddingLeft: 20 }}>
            <li>Контент, размещаемый пользователями, является их личным мнением и не отражает точку зрения администрации форума.</li>
            <li>Запрещено размещать материалы, нарушающие законодательство РФ, а также оскорбляющие других участников.</li>
            <li>Администрация оставляет за собой право удалять сообщения и блокировать пользователей без объяснения причин.</li>
            <li>Использование материалов сайта возможно только с указанием активной ссылки на источник.</li>
            <li>Администрация не несёт ответственности за возможный ущерб, возникший в результате использования сайта.</li>
          </ol>
          <p>Если вы не согласны с этими условиями, пожалуйста, покиньте сайт.</p>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms; 