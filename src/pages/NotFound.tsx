import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO/SEO';
import { SchemaMarkup } from '../components/SEO/SchemaMarkup';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon, Forum as ForumIcon, Newspaper as NewsIcon, ShoppingCart as MarketIcon } from '@mui/icons-material';
import { usePageNotFound } from '../hooks/usePageNotFound';

export const NotFound: React.FC = () => {
  const { pathname } = usePageNotFound({
    title: '404 — Страница не найдена | Рыболовный форум',
    customMessage: 'User accessed non-existent page'
  });
  
  return (
    <>
      <SEO
        title="404 — Страница не найдена"
        description="К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума или воспользуйтесь навигацией."
        keywords="страница не найдена, 404, ошибка, рыболовный форум"
        canonical={`https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/404`}
      />
      <SchemaMarkup
        type="WebPage"
        data={{
          name: '404 — Страница не найдена',
          description: 'К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума.',
          url: 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/404',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Рыболовный форум',
            url: 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai'
          }
        }}
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', mb: 2, fontWeight: 'bold' }}>
            404
          </Typography>
          <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
            Страница не найдена
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            К сожалению, запрашиваемая страница не найдена.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Возможно, страница была перемещена или удалена.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            Путь: {pathname}
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Возможно, вы ищете:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Button
                component={Link}
                to="/forum"
                startIcon={<ForumIcon />}
                variant="outlined"
                color="primary"
                sx={{ width: '100%', maxWidth: 300 }}
              >
                Форум
              </Button>
              <Button
                component={Link}
                to="/news"
                startIcon={<NewsIcon />}
                variant="outlined"
                color="primary"
                sx={{ width: '100%', maxWidth: 300 }}
              >
                Новости
              </Button>
              <Button
                component={Link}
                to="/marketplace"
                startIcon={<MarketIcon />}
                variant="outlined"
                color="primary"
                sx={{ width: '100%', maxWidth: 300 }}
              >
                Маркетплейс
              </Button>
            </Box>
          </Box>

          <Button
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            variant="contained"
            color="primary"
            size="large"
            sx={{ borderRadius: 2, px: 4, py: 1.5 }}
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Container>
    </>
  );
}; 