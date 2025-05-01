import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  return (
    <Box>
      <Header />
      <Outlet />
    </Box>
  );
};

export default MainLayout; 