import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as marketplaceApi from '../../services/marketplaceApi';
import { Product, Company } from '../../services/marketplaceApi';

const categories = ['Спиннинги', 'Катушки', 'Приманки', 'Леска и шнуры', 'Аксессуары', 'Ящики и сумки'];
const stores = [
  { value: 'ozon', label: 'Ozon' },
  { value: 'wildberries', label: 'Wildberries' },
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'other', label: 'Другие' }
];
const statusOptions = [
  { value: 'in-stock', label: 'В наличии' },
  { value: 'out-of-stock', label: 'Нет в наличии' },
  { value: 'sale', label: 'Распродажа' }
];

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Данные о товаре
  const [productData, setProductData] = useState<Product>({
    title: '',
    price: 0,
    old_price: undefined,
    discount: undefined,
    image: '',
    category: '',
    brand: '',
    status: 'in-stock',
    rating: 5,
    external_url: '',
    store: 'ozon',
    description: '',
  });
  
  // Данные о компании
  const [includeCompany, setIncludeCompany] = useState(false);
  const [companyData, setCompanyData] = useState<Company>({
    name: '',
    rating: 5,
    products_count: 0,
    is_premium: false,
    has_ozon_delivery: false,
    return_period: 14
  });
  
  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Обработчик изменения полей товара
  const handleProductChange = (field: keyof Product, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки при вводе
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Обработчик изменения полей компании
  const handleCompanyChange = (field: keyof Company, value: any) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки при вводе
    if (errors[`company.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`company.${field}`];
        return newErrors;
      });
    }
  };
  
  // Обработчик обратно к списку товаров
  const handleBackToList = () => {
    navigate('/marketplace');
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Обязательные поля товара
    if (!productData.title) {
      newErrors.title = 'Название товара обязательно';
    } else if (productData.title.length > 100) {
      newErrors.title = 'Название товара не должно превышать 100 символов';
    }
    
    if (!productData.price || productData.price <= 0) {
      newErrors.price = 'Укажите корректную цену';
    }
    
    if (!productData.image) {
      newErrors.image = 'URL изображения обязателен';
    } else if (!isValidUrl(productData.image)) {
      newErrors.image = 'Укажите корректный URL изображения';
    }
    
    if (!productData.category) {
      newErrors.category = 'Категория обязательна';
    }
    
    if (!productData.external_url) {
      newErrors.external_url = 'Ссылка на товар обязательна';
    } else if (!isValidUrl(productData.external_url)) {
      newErrors.external_url = 'Укажите корректный URL';
    }
    
    if (productData.rating < 0 || productData.rating > 5) {
      newErrors.rating = 'Рейтинг должен быть от 0 до 5';
    }
    
    // Опциональные поля с проверкой формата
    if (productData.old_price !== undefined && (productData.old_price <= 0 || productData.old_price <= productData.price)) {
      newErrors.old_price = 'Старая цена должна быть больше текущей';
    }
    
    if (productData.discount !== undefined && (productData.discount < 1 || productData.discount > 99)) {
      newErrors.discount = 'Скидка должна быть от 1% до 99%';
    }
    
    // Проверка компании если включена
    if (includeCompany) {
      if (!companyData.name) {
        newErrors['company.name'] = 'Название компании обязательно';
      }
      
      if (companyData.rating < 0 || companyData.rating > 5) {
        newErrors['company.rating'] = 'Рейтинг должен быть от 0 до 5';
      }
      
      if (companyData.products_count < 0) {
        newErrors['company.products_count'] = 'Количество товаров не может быть отрицательным';
      }
      
      if (companyData.return_period < 0) {
        newErrors['company.return_period'] = 'Срок возврата не может быть отрицательным';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Проверка URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Подготовка данных для отправки
    const dataToSend: Product = {
      ...productData,
      company: includeCompany ? companyData : undefined
    };
    
    try {
      const result = await marketplaceApi.addProduct(dataToSend);
      setSuccess(true);
      
      // Сброс формы после успешного добавления
      setTimeout(() => {
        navigate(`/marketplace/product/${result.id}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и кнопка назад */}
      <Box sx={{ display: 'flex', mb: 4, alignItems: 'center' }}>
        <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Добавление нового товара
        </Typography>
      </Box>
      
      {/* Сообщения об успехе или ошибке */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Товар успешно добавлен! Переход на страницу товара...
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Основная информация о товаре */}
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Основная информация
              </Typography>
            </Grid>
            
            <Grid size={{xs: 12}}>
              <TextField
                label="Название товара"
                fullWidth
                required
                value={productData.title}
                onChange={(e) => handleProductChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                inputProps={{ maxLength: 100 }}
              />
              <FormHelperText>
                Максимум 100 символов. Осталось: {100 - productData.title.length}
              </FormHelperText>
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <TextField
                label="Цена (₽)"
                fullWidth
                required
                type="number"
                value={productData.price}
                onChange={(e) => handleProductChange('price', Number(e.target.value))}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <TextField
                label="Старая цена (₽)"
                fullWidth
                type="number"
                value={productData.old_price || ''}
                onChange={(e) => handleProductChange('old_price', e.target.value ? Number(e.target.value) : undefined)}
                error={!!errors.old_price}
                helperText={errors.old_price}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <TextField
                label="Скидка (%)"
                fullWidth
                type="number"
                value={productData.discount || ''}
                onChange={(e) => handleProductChange('discount', e.target.value ? Number(e.target.value) : undefined)}
                error={!!errors.discount}
                helperText={errors.discount}
                InputProps={{ inputProps: { min: 1, max: 99 } }}
              />
            </Grid>
            
            <Grid size={{xs: 12}}>
              <TextField
                label="URL изображения"
                fullWidth
                required
                value={productData.image}
                onChange={(e) => handleProductChange('image', e.target.value)}
                error={!!errors.image}
                helperText={errors.image}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            
            <Grid size={{xs: 12, md: 6}}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={productData.category}
                  label="Категория"
                  onChange={(e) => handleProductChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                label="Бренд"
                fullWidth
                value={productData.brand || ''}
                onChange={(e) => handleProductChange('brand', e.target.value)}
              />
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <FormControl fullWidth required>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={productData.status}
                  label="Статус"
                  onChange={(e) => handleProductChange('status', e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <FormControl fullWidth required>
                <InputLabel>Магазин</InputLabel>
                <Select
                  value={productData.store}
                  label="Магазин"
                  onChange={(e) => handleProductChange('store', e.target.value)}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.value} value={store.value}>
                      {store.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{xs: 12, md: 4}}>
              <TextField
                label="Рейтинг (0-5)"
                fullWidth
                required
                type="number"
                value={productData.rating}
                onChange={(e) => handleProductChange('rating', Number(e.target.value))}
                error={!!errors.rating}
                helperText={errors.rating}
                InputProps={{ inputProps: { min: 0, max: 5, step: 0.1 } }}
              />
            </Grid>
            
            <Grid size={{xs: 12}}>
              <TextField
                label="Ссылка на товар (внешний маркетплейс)"
                fullWidth
                required
                value={productData.external_url}
                onChange={(e) => handleProductChange('external_url', e.target.value)}
                error={!!errors.external_url}
                helperText={errors.external_url}
                placeholder="https://marketplace.com/product/123"
              />
            </Grid>
            
            <Grid size={{xs: 12}}>
              <TextField
                label="Описание товара"
                fullWidth
                multiline
                rows={4}
                value={productData.description || ''}
                onChange={(e) => handleProductChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid size={{xs: 12}}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Информация о компании-продавце */}
            <Grid size={{xs: 12}}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                  Информация о компании-продавце
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCompany}
                      onChange={(e) => setIncludeCompany(e.target.checked)}
                    />
                  }
                  label="Добавить информацию о компании"
                />
              </Box>
            </Grid>
            
            {includeCompany && (
              <>
                <Grid size={{xs: 12, md: 6}}>
                  <TextField
                    label="Название компании"
                    fullWidth
                    required
                    value={companyData.name}
                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                    error={!!errors['company.name']}
                    helperText={errors['company.name']}
                  />
                </Grid>
                
                <Grid size={{xs: 12, md: 6}}>
                  <TextField
                    label="Рейтинг компании (0-5)"
                    fullWidth
                    required
                    type="number"
                    value={companyData.rating}
                    onChange={(e) => handleCompanyChange('rating', Number(e.target.value))}
                    error={!!errors['company.rating']}
                    helperText={errors['company.rating']}
                    InputProps={{ inputProps: { min: 0, max: 5, step: 0.1 } }}
                  />
                </Grid>
                
                <Grid size={{xs: 12, md: 4}}>
                  <TextField
                    label="Количество товаров"
                    fullWidth
                    required
                    type="number"
                    value={companyData.products_count}
                    onChange={(e) => handleCompanyChange('products_count', Number(e.target.value))}
                    error={!!errors['company.products_count']}
                    helperText={errors['company.products_count']}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid size={{xs: 12, md: 4}}>
                  <TextField
                    label="Срок возврата (дней)"
                    fullWidth
                    type="number"
                    value={companyData.return_period}
                    onChange={(e) => handleCompanyChange('return_period', Number(e.target.value))}
                    error={!!errors['company.return_period']}
                    helperText={errors['company.return_period']}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid size={{xs: 12, md: 4}}>
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={companyData.is_premium}
                          onChange={(e) => handleCompanyChange('is_premium', e.target.checked)}
                        />
                      }
                      label="Премиум-магазин"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={companyData.has_ozon_delivery}
                          onChange={(e) => handleCompanyChange('has_ozon_delivery', e.target.checked)}
                        />
                      }
                      label="Доставка через Ozon"
                    />
                  </FormControl>
                </Grid>
              </>
            )}
            
            <Grid size={{xs: 12}}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Кнопки управления */}
            <Grid size={{xs: 12}} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBackToList}
                disabled={loading}
              >
                Отмена
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Добавление...' : 'Добавить товар'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct; 