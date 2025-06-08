import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail/index';
import NewsPage from './pages/News';
import NewsDetail from './pages/News/NewsDetail';
import CreateNews from './pages/CreateNews';
import ForumPage from './pages/Forum';
import CategoryDetail from './pages/Forum/CategoryDetail';
import TopicDetail from './pages/Forum/TopicDetail';
import CreateTopic from './pages/Forum/CreateTopic';
import CreateCategory from './pages/Forum/CreateCategory';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/Marketplace/ProductDetail';
import AddProduct from './pages/Marketplace/AddProduct';
import { userStore } from './shared/store/userStore';
import SocialCallback from './pages/auth/SocialCallback';
import { NotFound } from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Зеленый цвет для рыбалки
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#1976D2', // Синий цвет для воды
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#fff',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
      color: '#1976D2',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Глобальные стили для скрытия скроллбаров
const globalStyles = {
  '*::-webkit-scrollbar': {
    display: 'none',
  },
  '*': {
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
  }
};

function App() {
  useEffect(() => {
    document.title = 'Рыболовный форум';
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <Router>
        <Routes>
          {/* Главная страница и дашборд */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="forum" element={<ForumPage />} />
            <Route path="forum/category/:categoryId" element={<CategoryDetail />} />
            <Route path="forum/topic/:topicId" element={<TopicDetail />} />
            <Route path="forum/create-topic" element={<CreateTopic />} />
            <Route path="forum/category/:categoryId/create-topic" element={<CreateTopic />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/product/:productId" element={<ProductDetail />} />
            {userStore.isAdmin && (
              <>
                <Route path="news/create" element={<CreateNews />} />
                <Route path="forum/create-category" element={<CreateCategory />} />
                <Route path="forum/category/:categoryId/create-subcategory" element={<CreateCategory />} />
                <Route path="marketplace/add-product" element={<AddProduct />} />
              </>
            )}
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Обработка callback от соцсетей */}
          <Route path="/auth/social/:provider" element={<SocialCallback />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
