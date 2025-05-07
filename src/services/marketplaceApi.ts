import * as apiService from './api';
import { userStore } from '../shared/store/userStore';
import { API_URL } from '../config/api';

// Типы данных
export interface Company {
  name: string;
  rating: number;
  products_count: number;
  is_premium: boolean;
  has_ozon_delivery: boolean;
  return_period: number;
}

export interface Product {
  id?: number;
  title: string;
  price: number;
  old_price?: number;
  discount?: number;
  image: string;
  category: string;
  brand?: string;
  status: 'in-stock' | 'out-of-stock' | 'sale';
  rating: number;
  external_url: string;
  store: 'ozon' | 'wildberries' | 'aliexpress' | 'other';
  description?: string;
  company?: Company;
}

export interface ProductFilters {
  search?: string;
  categories?: string[];
  brands?: string[];
  stores?: string[];
  min_price?: number;
  max_price?: number;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'default';
}

// Функция для защищенных запросов (требующих авторизации)
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${userStore.accessToken}`
    }
  });

  if (response.status === 401) {
    // Пробуем обновить токен
    try {
      // Обновляем токен через API
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: userStore.refreshToken
        })
      });

      if (!refreshResponse.ok) {
        throw new Error('Не удалось обновить токен');
      }

      const authData = await refreshResponse.json();
      userStore.setAuth(authData);
      
      // Повторяем запрос с новым токеном
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${userStore.accessToken}`
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw new Error('Не удалось авторизоваться');
    }
  }

  return response;
};

// Функция для публичных запросов (не требующих авторизации)
const fetchPublic = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, options);
};

/**
 * Получение списка товаров с возможностью фильтрации
 */
export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.categories && filters.categories.length > 0) 
        params.append('categories', filters.categories.join(','));
      if (filters.brands && filters.brands.length > 0) 
        params.append('brands', filters.brands.join(','));
      if (filters.stores && filters.stores.length > 0) 
        params.append('stores', filters.stores.join(','));
      if (filters.min_price !== undefined) 
        params.append('min_price', filters.min_price.toString());
      if (filters.max_price !== undefined) 
        params.append('max_price', filters.max_price.toString());
      if (filters.sort && filters.sort !== 'default') 
        params.append('sort', filters.sort);
    }
    
    const response = await fetchPublic(`${API_URL}/marketplace/products${params.toString() ? `?${params.toString()}` : ''}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
};

/**
 * Получение товара по ID
 */
export const getProductById = async (productId: string | number): Promise<Product> => {
  try {
    const response = await fetchPublic(`${API_URL}/marketplace/products/${productId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Ошибка при получении товара ${productId}:`, error);
    throw error;
  }
};

/**
 * Добавление нового товара (только для администраторов)
 */
export const addProduct = async (productData: Product): Promise<Product> => {
  if (!userStore.isAdmin) {
    throw new Error('Недостаточно прав для выполнения операции');
  }
  
  try {
    // Преобразуем image в image_url для API
    const { image, status, store, ...restData } = productData;
    
    // Преобразуем статус
    const statusMap: Record<string, string> = {
      'in-stock': 'В наличии',
      'out-of-stock': 'Нет в наличии',
      'sale': 'Распродажа'
    };

    // Преобразуем название магазина
    const storeMap: Record<string, string> = {
      'ozon': 'Ozon',
      'wildberries': 'Wildberries',
      'aliexpress': 'Aliexpress',
      'other': 'Другие'
    };

    const dataToSend = {
      ...restData,
      image_url: image,
      status: statusMap[status] || status,
      store: storeMap[store] || store
    };

    const response = await fetchWithAuth(`${API_URL}/marketplace/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при добавлении товара');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении товара:', error);
    throw error;
  }
};

/**
 * Обновление товара (только для администраторов)
 */
export const updateProduct = async (productId: string | number, productData: Partial<Product>): Promise<Product> => {
  if (!userStore.isAdmin) {
    throw new Error('Недостаточно прав для выполнения операции');
  }
  
  try {
    const response = await fetchWithAuth(`${API_URL}/marketplace/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при обновлении товара');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Ошибка при обновлении товара ${productId}:`, error);
    throw error;
  }
};

/**
 * Удаление товара (только для администраторов)
 */
export const deleteProduct = async (productId: string | number): Promise<void> => {
  if (!userStore.isAdmin) {
    throw new Error('Недостаточно прав для выполнения операции');
  }
  
  try {
    const response = await fetchWithAuth(`${API_URL}/marketplace/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при удалении товара');
    }
  } catch (error) {
    console.error(`Ошибка при удалении товара ${productId}:`, error);
    throw error;
  }
};

/**
 * Получение списка всех категорий товаров
 */
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const response = await fetchPublic(`${API_URL}/marketplace/categories`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении категорий товаров:', error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductCategories
}; 