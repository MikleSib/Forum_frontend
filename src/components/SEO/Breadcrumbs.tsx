import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

// Карта путей только для основных разделов
const PATH_MAP: Record<string, string> = {
  '': 'Главная',
  'news': 'Новости',
  'forum': 'Форум',
  'marketplace': 'Маркетплейс',
};

interface BreadcrumbsProps {
  customItems?: Array<{
    label: string;
    path: string;
  }>;
  showVisual?: boolean; // Показывать ли визуальные хлебные крошки
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  customItems, 
  showVisual = true 
}) => {
  const location = useLocation();
  
  // Если переданы кастомные элементы, используем их
  const items = customItems || generateBreadcrumbs(location.pathname);
  
  // Создаем JSON-LD схему для микроразметки
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${window.location.origin}${item.path}`
    }))
  };

  return (
    <>
      {/* JSON-LD микроразметка для поисковых систем */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Визуальные хлебные крошки для пользователей */}
      {showVisual && (
        <Box sx={{ 
          py: 2, 
          px: { xs: 2, md: 3 },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <MuiBreadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="Навигационная цепочка"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: 'text.secondary'
              }
            }}
          >
            {items.map((item, index) => (
              <Box key={index}>
                {index === items.length - 1 ? (
                  // Последний элемент (текущая страница)
                  <Typography
                    color="text.primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {index === 0 && <HomeIcon fontSize="small" />}
                    {item.label}
                  </Typography>
                ) : (
                  // Кликабельные ссылки
                  <Link
                    to={item.path}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        },
                        transition: 'color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {index === 0 && <HomeIcon fontSize="small" />}
                      {item.label}
                    </Typography>
                  </Link>
                )}
              </Box>
            ))}
          </MuiBreadcrumbs>
        </Box>
      )}
    </>
  );
};

// Функция для генерации хлебных крошек на основе текущего пути
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Главная', path: '/' }
  ];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = PATH_MAP[segment];
    
    // Добавляем только если это один из основных разделов
    if (label) {
      breadcrumbs.push({
        label,
        path: currentPath
      });
    }
  });

  return breadcrumbs;
}

// Компонент только для SEO микроразметки (без визуального отображения)
export const SEOBreadcrumbs: React.FC<{ customItems?: Array<{ label: string; path: string; }> }> = ({ customItems }) => {
  const location = useLocation();
  const items = customItems || generateBreadcrumbs(location.pathname);
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${window.location.origin}${item.path}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default Breadcrumbs; 