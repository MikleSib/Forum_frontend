import React from 'react';
import { AppBar, Toolbar, Box, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '.2rem',
                  fontSize: '2rem'
                }}
              >
                Рыболовный форум
              </Typography>
            </Box>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 