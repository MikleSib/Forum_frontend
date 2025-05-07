import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Slider, 
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  IconButton,
  InputLabel,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../../shared/store/userStore';
import * as marketplaceApi from '../../services/marketplaceApi';
import { Product, ProductFilters } from '../../services/marketplaceApi';

// Стилизованные компоненты
const ProductCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  }
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  paddingTop: '80%', // Сохраняем пропорции
  backgroundSize: 'cover', // Для растягивания фото до краев
  backgroundPosition: 'center',
  backgroundColor: '#f8f8f8',
  position: 'relative',
  width: '100%',
  borderRadius: '8px 8px 0 0' // Скругление только сверху
}));

const PriceWrapper = styled(Box)(({ theme, status }: { theme?: any, status: string }) => ({
  fontWeight: 'bold',
  color: status === 'sale' ? '#ff4747' : 
         status === 'out-of-stock' ? theme?.palette.text.disabled : 
         '#000000',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const OldPrice = styled(Typography)({
  textDecoration: 'line-through',
  color: '#999999',
  fontWeight: 'normal',
  fontSize: '14px',
});

const StoreChip = styled(Chip)(({ store }: { store: string }) => ({
  backgroundColor: 
    store === 'ozon' ? '#005bff' : 
    store === 'wildberries' ? '#cb11ab' : 
    store === 'aliexpress' ? '#ff4747' : 
    '#9e9e9e',
  color: 'white',
  fontSize: '0.75rem',
  borderRadius: '4px',
  height: '24px',
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  backgroundColor: '#fb2fd5', // Розовый цвет как на скриншоте
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '14px',
  zIndex: 2,
}));

const SaleBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  backgroundColor: '#fb2fd5', // Розовый цвет как на скриншоте
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '14px',
  zIndex: 2,
}));

const InKitBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '40px',
  right: '12px',
  backgroundColor: '#9e1010', // Красный цвет как на скриншоте
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '12px',
  zIndex: 2,
}));

const ReadyBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '40px',
  right: '12px',
  backgroundColor: '#333', // Черный цвет как на скриншоте
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  zIndex: 2,
}));

const FavoriteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 2,
  padding: '4px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  }
}));

const RatingWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '4px',
}));

const ItemsLeftLabel = styled(Typography)(({ theme }) => ({
  color: '#ff4747',
  fontSize: '12px',
  fontWeight: 'medium',
  marginTop: '4px',
}));

const DeliveryInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  marginTop: '8px',
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  right: '16px',
  width: 'calc(100% - 32px)'
}));

const DeliveryDate = styled(Box)(({ theme }) => ({
  backgroundColor: '#005bff', // Синий цвет как на скриншоте
  color: 'white',
  padding: '12px',
  borderRadius: '8px', // Увеличен радиус в 2 раза
  fontSize: '16px',
  fontWeight: 'bold',
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

// Используем mockProducts только если API не работает
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Спиннинг для рыбалки 12-в-1 спиннинг телескопический, катушка, плетенка, набор блесен, воблер, поводки',
    price: 2499,
    old_price: 3500,
    discount: 28,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-y/wc1000/7429171930.jpg',
    category: 'Спиннинги',
    brand: 'Рыболов',
    status: 'in-stock',
    rating: 4.5,
    external_url: 'https://www.ozon.ru/product/spinning-dlya-rybalki-12-v-1-spinning-teleskopicheskiy-katushka-pletenka-nabor-blesen-vobler-povodki-1535817603/',
    store: 'ozon',
    description: 'Спиннинг телескопический 12-в-1 представляет собой готовый комплект для начинающих и опытных рыболовов. В набор входит телескопическое удилище длиной 2.1 м с тестом 10-30 г, безынерционная катушка с передним фрикционом, набор блесен, воблер, поводки и плетеная леска. Удилище изготовлено из высококачественного стекловолокна, обеспечивающего оптимальное сочетание прочности и чувствительности.',
    company: {
      name: 'SuperGoods',
      rating: 4.7,
      products_count: 128,
      is_premium: true,
      has_ozon_delivery: true,
      return_period: 7
    }
  },
  {
    id: 2,
    title: 'Удочка телескопическая углепластиковая для рыбалки 2.7м с катушкой и набором снастей',
    price: 3199,
    old_price: 4000,
    discount: 20,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-d/wc1000/7459493989.jpg',
    category: 'Спиннинги',
    brand: 'Рыболов',
    status: 'in-stock',
    rating: 4.3,
    external_url: 'https://www.ozon.ru/product/udochka-dlya-rybalki-4m-katushka-rybolovnaya-leska-2-poplavka-stoporki-gruzila-kryuchki-2001380389',
    store: 'ozon',
    description: 'Удочка телескопическая с катушкой и набором снастей',
    company: {
      name: 'FishMaster',
      rating: 4.5,
      products_count: 89,
      is_premium: false,
      has_ozon_delivery: true,
      return_period: 14
    }
  },
  {
    id: 3,
    title: 'Катушка безынерционная Salmo Premium 2000FD с передним фрикционом',
    price: 1899,
    old_price: 2500,
    discount: 24,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-k/wc1000/6996048284.jpg',
    category: 'Катушки',
    brand: 'Salmo',
    status: 'sale',
    rating: 4.8,
    external_url: 'https://www.ozon.ru/product/udochka-dlya-rybalki-6m-katushka-rybolovnaya-leska-2-poplavka-stoporki-gruzila-kryuchki-2001380400',
    store: 'ozon',
    description: 'Катушка безынерционная с передним фрикционом',
    company: {
      name: 'РыбоLove',
      rating: 4.9,
      products_count: 145,
      is_premium: true,
      has_ozon_delivery: true,
      return_period: 30
    }
  },
  {
    id: 4,
    title: 'Набор воблеров для ловли щуки, окуня, судака 10 штук с коробкой',
    price: 1299,
    old_price: 1799,
    discount: 28,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-t/wc1000/7459565609.jpg',
    category: 'Приманки',
    brand: 'FishPro',
    status: 'in-stock',
    rating: 4.6,
    external_url: 'https://www.ozon.ru/product/udochka-dlya-rybalki-5m-katushka-rybolovnaya-leska-2-poplavka-stoporki-gruzila-kryuchki-2001381521',
    store: 'ozon',
    description: 'Набор из 10 воблеров для ловли хищной рыбы',
    company: {
      name: 'FishPro',
      rating: 4.4,
      products_count: 67,
      is_premium: false,
      has_ozon_delivery: true,
      return_period: 14
    }
  },
  {
    id: 5,
    title: 'Плетеная леска 0.14мм 100м зеленая для спиннинга',
    price: 899,
    old_price: 1100,
    discount: 18,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-m/wc1000/7232886706.jpg',
    category: 'Леска и шнуры',
    brand: 'Sunline',
    status: 'in-stock',
    rating: 4.7,
    external_url: 'https://www.ozon.ru/product/spinning-dlya-rybalki-7-v-1-spinning-teleskopicheskiy-katushka-blesna-vobler-povodki-1535766653',
    store: 'ozon',
    description: 'Плетеная леска для спиннинговой ловли',
    company: {
      name: 'АкваМир',
      rating: 4.3,
      products_count: 112,
      is_premium: false,
      has_ozon_delivery: true,
      return_period: 7
    }
  },
  {
    id: 6,
    title: 'Ящик рыболовный трехъярусный со съемными отделениями',
    price: 2299,
    old_price: 2799,
    discount: 18,
    image: 'https://ir-5.ozone.ru/s3/multimedia-1-e/wc1000/7429182098.jpg',
    category: 'Ящики и сумки',
    brand: 'FishBox',
    status: 'in-stock',
    rating: 4.4,
    external_url: 'https://www.ozon.ru/product/udochka-dlya-zimney-rybalki-kivok-poplavok-motylnitsa-leska-puchkovyaz-nozhnitsy-motyl-mormyshki-1751874655',
    store: 'ozon',
    description: 'Ящик для рыболовных снастей с тремя отделениями',
    company: {
      name: 'Рыбак',
      rating: 4.2,
      products_count: 53,
      is_premium: false,
      has_ozon_delivery: true,
      return_period: 14
    }
  }
];

// Фильтры
const categories = ['Спиннинги', 'Катушки', 'Приманки', 'Леска и шнуры', 'Аксессуары', 'Ящики и сумки'];
const brands = ['SuperGoods', 'FishMaster', 'RiboLove', 'FishPro', 'АкваМир', 'Рыбак', 'Клёвое место', 'Охотник и Рыболов'];
const stores = [
  { value: 'ozon', label: 'Ozon' },
  { value: 'wildberries', label: 'Wildberries' },
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'other', label: 'Другие' }
];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOption, setSortOption] = useState<string>('default');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Загрузка товаров с сервера
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Функция получения товаров
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Подготавливаем фильтры для API
      const filters: ProductFilters = {
        search: searchQuery || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        stores: selectedStores.length > 0 ? selectedStores as any : undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        sort: sortOption !== 'default' ? sortOption as any : undefined
      };
      
      const data = await marketplaceApi.getProducts(filters);
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
      
      // Используем моковые данные в случае ошибки
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчики изменения фильтров
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };
  
  const handleStoreChange = (store: string) => {
    setSelectedStores(prev => 
      prev.includes(store) 
        ? prev.filter(s => s !== store) 
        : [...prev, store]
    );
  };
  
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };
  
  const handleProductClick = (id: number) => {
    navigate(`/marketplace/product/${id}`);
  };
  
  const handleAddProduct = () => {
    navigate('/marketplace/add-product');
  };
  
  // Применение фильтров
  useEffect(() => {
    // Вызываем API с новыми фильтрами при изменении параметров
    fetchProducts();
  }, [searchQuery, selectedCategories, selectedBrands, selectedStores, priceRange, sortOption]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Магазин рыболовных товаров
        </Typography>
        {userStore.isAdmin && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Добавить товар
          </Button>
        )}
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Здесь вы найдете лучшие товары для рыбалки от проверенных продавцов с разных маркетплейсов.
      </Typography>
      
      {/* Мобильные фильтры */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2, gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        <Button 
          variant="outlined" 
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          startIcon={<FilterListIcon />}
        >
          Фильтры
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Фильтры (слева) */}
        <Grid size={{xs: 12, md: 3}}>
          <Paper 
            sx={{ 
              p: 2, 
              display: { xs: mobileFiltersOpen ? 'block' : 'none', md: 'block' },
              mb: { xs: 2, md: 0 }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Фильтры
            </Typography>
            
            {/* Фильтр по категориям */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Категории
              </Typography>
              <FormGroup>
                {categories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox 
                        checked={selectedCategories.includes(category)} 
                        onChange={() => handleCategoryChange(category)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{category}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Фильтр по брендам */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Магазины
              </Typography>
              <FormGroup>
                {brands.map((brand) => (
                  <FormControlLabel
                    key={brand}
                    control={
                      <Checkbox 
                        checked={selectedBrands.includes(brand)} 
                        onChange={() => handleBrandChange(brand)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{brand}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Фильтр по магазинам */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Маркетплейсы
              </Typography>
              <FormGroup>
                {stores.map((store) => (
                  <FormControlLabel
                    key={store.value}
                    control={
                      <Checkbox 
                        checked={selectedStores.includes(store.value)} 
                        onChange={() => handleStoreChange(store.value)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{store.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Фильтр по цене */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Цена
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">от {priceRange[0]} ₽</Typography>
                <Typography variant="body2">до {priceRange[1]} ₽</Typography>
              </Box>
            </Box>
            
            {/* Кнопка сброса фильтров (для мобильной версии) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedBrands([]);
                  setSelectedStores([]);
                  setPriceRange([0, 10000]);
                  setSearchQuery('');
                  setSortOption('default');
                  setMobileFiltersOpen(false);
                }}
              >
                Сбросить фильтры
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Список товаров (справа) */}
        <Grid size={{xs: 12, md: 9}}>
          {/* Поиск и сортировка */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'space-between',
            alignItems: 'center', 
            mb: 2 
          }}>
            <TextField
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ width: '60%' }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortOption}
                label="Сортировка"
                onChange={handleSortChange}
                startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="default">По умолчанию</MenuItem>
                <MenuItem value="price-asc">Сначала дешевле</MenuItem>
                <MenuItem value="price-desc">Сначала дороже</MenuItem>
                <MenuItem value="rating">По рейтингу</MenuItem>
                <MenuItem value="discount">По скидке</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Результаты поиска */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Найдено {filteredProducts.length} товаров
            </Typography>
          </Box>
          
          {/* Добавляем отображение ошибки */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Список товаров */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length > 0 ? (
            <Grid container spacing={0.5}>
              {filteredProducts.map((product) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={product.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    width: '100%',
                    p: '2.5px'
                  }}>
                    <ProductCard 
                      onClick={() => handleProductClick(product.id || 0)} 
                      sx={{ 
                        height: '580px',
                        position: 'relative',
                        width: '300px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ position: 'relative', height: '500px' }}>
                        <ProductImage
                          image={product.image}
                          title={product.title}
                          sx={{ height: '100%', width: '100%' }}
                        />
                        <FavoriteButton size="small">
                          <FavoriteBorderIcon sx={{ fontSize: '28px' }} />
                        </FavoriteButton>
                        
                        {product.status === 'sale' && (
                          <SaleBadge>
                            Распродажа
                          </SaleBadge>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1, 
                        flex: '1 1 auto',
                        position: 'relative'
                      }}>
                        <PriceWrapper status={product.status}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#fb2fd5', m: 0 }}>
                              {product.price} ₽
                            </Typography>
                          </Box>
                        </PriceWrapper>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            minHeight: '50px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: '#000',
                            lineHeight: '1.3',
                            fontWeight: '500',
                            fontSize: '16px',
                            m: 0
                          }}
                        >
                          {product.title.length > 50 ? `${product.title.substring(0, 50)}...` : product.title}
                        </Typography>
                      </Box>
                      
                      {/* Кнопка "Смотреть" */}
                      <Box sx={{ p: 2, pt: 0 }}>
                        <DeliveryDate>
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Смотреть
                          </Box>
                        </DeliveryDate>
                      </Box>
                    </ProductCard>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Товары не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Попробуйте изменить параметры поиска или сбросить фильтры
              </Typography>
            </Paper>
          )}
          
          {/* Пагинация */}
          {filteredProducts.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={1} color="primary" />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Marketplace; 