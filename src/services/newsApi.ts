import axios from 'axios';
import { NewsItem } from '../shared/types/news.types';
import API_URL from '../config/api';

interface CategoryStats {
  news: number;
  guides: number;
  fish_species: number;
}

// Получение списка новостей
export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/news/`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    return [];
  }
};

export const newsApi = {
  // Получение списка новостей
  getNews: async (): Promise<NewsItem[]> => {
    try {
      const response = await axios.get(`${API_URL}/news/`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении новостей:', error);
      return [];
    }
  },

  // Получение конкретной новости по ID
  getNewsById: async (id: number): Promise<NewsItem | null> => {
    try {
      const response = await axios.get(`${API_URL}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении новости:', error);
      return null;
    }
  },

  // Получение статистики по категориям
  getCategoryStats: async (): Promise<CategoryStats> => {
    try {
      const response = await axios.get(`${API_URL}/news/stats/categories`);
      const data = response.data || {};
      
      // Убеждаемся, что все поля присутствуют
      return {
        news: data.news || 0,
        guides: data.guides || 0,
        fish_species: data.fish_species || 0
      };
    } catch (error) {
      console.error('Ошибка при получении статистики категорий:', error);
      return {
        news: 0,
        guides: 0,
        fish_species: 0
      };
    }
  }
}; 