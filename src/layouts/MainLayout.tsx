import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <Box>
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout; 