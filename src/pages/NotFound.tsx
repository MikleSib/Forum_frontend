import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO/SEO';
import { SchemaMarkup } from '../components/SEO/SchemaMarkup';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon, Forum as ForumIcon, Newspaper as NewsIcon, ShoppingCart as MarketIcon } from '@mui/icons-material';

export const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума."
        keywords="страница не найдена, 404, рыболовный форум"
      />
      <SchemaMarkup
        type="WebPage"
        data={{
          name: 'Страница не найдена',
          description: 'К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума.',
          url: 'https://xn----9sbyncijf1ah6ec.xn--p1ai/404'
        }}
      />
      <Container maxWidth="md">
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
          <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', mb: 2 }}>
            404
          </Typography>
          <Typography variant="h4" color="text.primary" gutterBottom>
            Страница не найдена
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            К сожалению, запрашиваемая страница не найдена.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
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
            sx={{ borderRadius: 2 }}
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Container>
    </>
  );
}; 