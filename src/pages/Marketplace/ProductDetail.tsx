import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Link,
  Rating
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { styled } from '@mui/material/styles';

// Типы данных
interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  category: string;
  brand: string;
  status: 'in-stock' | 'out-of-stock' | 'sale';
  rating: number;
  externalUrl: string;
  store: 'ozon' | 'wildberries' | 'aliexpress' | 'other';
  description?: string;
  company?: {
    name: string;
    rating: number;
    productsCount: number;
    isPremium?: boolean;
    hasOzonDelivery?: boolean;
    returnPeriod?: number;
  };
}

// Моковые данные для демонстрации
const mockProduct: Product = {
  id: 1,
  title: 'Спиннинг для рыбалки 12-в-1 спиннинг телескопический, катушка, плетенка, набор блесен, воблер, поводки',
  price: 2499,
  oldPrice: 3500,
  discount: 28,
  image: 'https://ir-5.ozone.ru/s3/multimedia-1-y/wc1000/7429171930.jpg',
  category: 'Спиннинги',
  brand: '',
  status: 'in-stock',
  rating: 4.5,
  externalUrl: 'https://www.ozon.ru/product/spinning-dlya-rybalki-12-v-1-spinning-teleskopicheskiy-katushka-pletenka-nabor-blesen-vobler-povodki-1535817603/',
  store: 'ozon',
  description: 'Спиннинг телескопический 12-в-1 представляет собой готовый комплект для начинающих и опытных рыболовов. В набор входит телескопическое удилище длиной 2.1 м с тестом 10-30 г, безынерционная катушка с передним фрикционом, набор блесен, воблер, поводки и плетеная леска. Удилище изготовлено из высококачественного стекловолокна, обеспечивающего оптимальное сочетание прочности и чувствительности.',
  company: {
    name: 'SuperGoods',
    rating: 4.7,
    productsCount: 128,
    isPremium: true,
    hasOzonDelivery: true,
    returnPeriod: 7
  }
};

// Стилизованные компоненты
const StoreChip = styled(Chip)(({ store }: { store: string }) => ({
  backgroundColor: 
    store === 'ozon' ? '#005bff' : 
    store === 'wildberries' ? '#cb11ab' : 
    store === 'aliexpress' ? '#ff4747' : 
    '#9e9e9e',
  color: 'white',
  fontSize: '0.75rem',
}));

const PriceWrapper = styled(Box)(({ theme, status }: { theme?: any, status: string }) => ({
  fontWeight: 'bold',
  color: status === 'sale' ? theme?.palette.error.main : 
         status === 'out-of-stock' ? theme?.palette.text.disabled : 
         theme?.palette.success.main,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const OldPrice = styled(Typography)({
  textDecoration: 'line-through',
  color: 'text.secondary',
  fontWeight: 'normal',
});

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Получение данных о продукте
  useEffect(() => {
    setLoading(true);
    // Имитация загрузки данных
    setTimeout(() => {
      // В реальном приложении здесь был бы API запрос
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [productId]);

  // Обработчик добавления в избранное
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Обработчик возврата к списку товаров
  const handleBackToList = () => {
    navigate('/marketplace');
  };

  // Хлебные крошки с магазинами
  const getStoreLabel = (storeName: string): string => {
    switch (storeName) {
      case 'ozon': return 'Ozon';
      case 'wildberries': return 'Wildberries';
      case 'aliexpress': return 'AliExpress';
      default: return 'Другой магазин';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Кнопка возврата и хлебные крошки */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
        <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
          <Link underline="hover" color="inherit" onClick={handleBackToList} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Магазин
          </Link>
          {!loading && product && (
            <>
              <Typography sx={{ mx: 1 }}>/</Typography>
              <Link underline="hover" color="inherit" onClick={handleBackToList} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {product.category}
              </Link>
              <Typography sx={{ mx: 1 }}>/</Typography>
              <Typography color="text.primary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: '200px', sm: '300px', md: '400px' } }}>
                {product.title.length > 50 ? `${product.title.substring(0, 50)}...` : product.title}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : product ? (
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            {/* Изображение товара */}
            <Grid size={{xs: 12, md: 6}}>
              <Box 
                sx={{ 
                  height: { xs: '300px', md: '400px' },
                  width: '100%',
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                {/* Отметка о скидке */}
                {product.discount && (
                  <Chip
                    label={`-${product.discount}%`}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                {/* Метка магазина */}
                <StoreChip
                  label={getStoreLabel(product.store)}
                  store={product.store}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16
                  }}
                />
              </Box>
            </Grid>

            {/* Информация о товаре */}
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.rating} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {product.rating.toFixed(1)} ({Math.floor(product.rating * 10)} отзывов)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {product.brand && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Бренд:
                    </Typography>
                    <Chip label={product.brand} size="small" />
                  </>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Цена */}
              <PriceWrapper status={product.status}>
                <Typography variant="h5">
                  {product.price} ₽
                </Typography>
                {product.oldPrice && (
                  <OldPrice variant="h6">
                    {product.oldPrice} ₽
                  </OldPrice>
                )}
              </PriceWrapper>
              
              <Box sx={{ mt: 1, mb: 3 }}>
                <Typography variant="body2" color={
                  product.status === 'in-stock' ? 'success.main' : 
                  product.status === 'out-of-stock' ? 'error.main' : 
                  'text.secondary'
                }>
                  {product.status === 'in-stock' ? 'В наличии' : 
                   product.status === 'out-of-stock' ? 'Нет в наличии' : 
                   'Распродажа'}
                </Typography>
              </Box>
              
              {/* Информация о компании */}
              {product.company && (
                <Paper sx={{ 
                  mb: 3, 
                  overflow: 'hidden', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid', 
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#f0f0f0', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography fontWeight="bold" fontSize={20}>
                        {product.company.name.charAt(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {product.company.name}
                        </Typography>
                        <Button 
                          variant="text" 
                          size="small" 
                          sx={{ ml: 1, textTransform: 'none', minWidth: 0, px: 1 }}
                        >
                          Перейти в магазин
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {product.company.isPremium && (
                          <Box component="span" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mr: 2,
                            fontSize: '0.875rem'
                          }}>
                            <VerifiedIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                            Premium магазин
                          </Box>
                        )}
                        <Box component="span" sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '0.875rem'
                        }}>
                          <Typography variant="body2" color="text.secondary" mr={1}>
                            Средняя оценка товаров
                          </Typography>
                          <Box ml={1} mr={0.5}>{product.company.rating}</Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  {product.company.hasOzonDelivery && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderBottom: '1px solid', 
                      borderColor: 'divider'
                    }}>
                      <LocalShippingIcon fontSize="small" sx={{ color: 'primary.main', mr: 2 }} />
                      <Typography variant="body2">
                        Есть доставка от Ozon
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    borderBottom: '1px solid', 
                    borderColor: 'divider'
                  }}>
                    <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', mr: 2 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      О магазине
                    </Typography>
                  </Box>
                  
                  {product.company.returnPeriod && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestoreIcon fontSize="small" sx={{ color: 'action.active', mr: 2 }} />
                        <Typography variant="body2">
                          Можно вернуть в течение {product.company.returnPeriod} дней
                        </Typography>
                      </Box>
                      <ArrowForwardIosIcon fontSize="small" sx={{ color: 'action.active', fontSize: 14 }} />
                    </Box>
                  )}
                </Paper>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  fullWidth
                  href={product.externalUrl}
                  target="_blank"
                  disabled={product.status === 'out-of-stock'}
                >
                  Купить в {getStoreLabel(product.store)}
                </Button>
                <IconButton 
                  onClick={handleToggleFavorite}
                  aria-label="add to favorites"
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Описание */}
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description || 'Описание отсутствует'}
              </Typography>
              
              {/* Характеристики товара */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  О товаре
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Тип</Typography>
                    <Typography variant="body2">Спиннинг</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Рабочая длина, см</Typography>
                    <Typography variant="body2">210</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Длина в сложенном виде, см</Typography>
                    <Typography variant="body2">65</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Вид удилища</Typography>
                    <Typography variant="body2">Спиннинговое</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Количество секций</Typography>
                    <Typography variant="body2">5</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Категория */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Категория
                </Typography>
                <Link 
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/marketplace?category=' + product.category)}
                  sx={{ textDecoration: 'none' }}
                >
                  {product.category}
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Товар не найден
          </Typography>
          <Typography variant="body1" paragraph>
            К сожалению, запрашиваемый товар не существует или был удален.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleBackToList}
            startIcon={<ArrowBackIcon />}
          >
            Вернуться к списку товаров
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ProductDetail;