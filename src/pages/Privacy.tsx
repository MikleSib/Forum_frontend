import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO/SEO';
import { seoConfig } from '../config/seo.config';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO
        title={seoConfig.privacy.title}
        description={seoConfig.privacy.description}
        keywords={seoConfig.privacy.keywords}
        canonical="https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/privacy"
      />
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
          Политика конфиденциальности
        </Typography>
        <Box sx={{ color: 'text.secondary', fontSize: '1.1rem', mt: 3 }}>
          <p>Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.</p>
          <ol style={{ paddingLeft: 20 }}>
            <li>Сайт собирает минимальный объём персональных данных, необходимых для регистрации и участия в форуме.</li>
            <li>Ваши данные не передаются третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.</li>
            <li>Вы имеете право запросить удаление или изменение своих персональных данных, обратившись к администрации сайта.</li>
            <li>Использование сайта означает согласие с данной политикой конфиденциальности.</li>
          </ol>
          <p>В случае изменений в политике конфиденциальности информация будет опубликована на этой странице.</p>
        </Box>
      </Paper>
    </Container>
    </>
  );
};

export default Privacy; 