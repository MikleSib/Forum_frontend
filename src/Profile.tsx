import React from 'react';
import { Box, Container, Typography, Avatar, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const Profile: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Информация о профиле */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Item>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2 }}
                  alt="User Avatar"
                  src="/static/images/avatar/1.jpg"
                />
                <Typography variant="h5" gutterBottom>
                  Имя пользователя
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Email: user@example.com
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                  Редактировать профиль
                </Button>
              </Box>
            </Item>
          </Grid>

          {/* Посты пользователя */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Мои посты
              </Typography>
              {/* Здесь будет список постов пользователя */}
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile; 