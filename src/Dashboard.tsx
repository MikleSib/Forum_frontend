import React from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Профиль в правом верхнем углу */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" p={2}>
            <Button variant="contained" color="primary" href="/profile">
              Профиль
            </Button>
          </Box>
        </Grid>

        {/* Основная лента постов */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Item>
            <Typography variant="h5" gutterBottom>
              Лента постов
            </Typography>
            {/* Здесь будет список постов */}
          </Item>
        </Grid>

        {/* Боковая панель */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Популярные темы
            </Typography>
            {/* Здесь будет список популярных тем */}
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 