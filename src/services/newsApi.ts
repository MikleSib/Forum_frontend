import axios from 'axios';
import { NewsItem } from '../shared/types/news.types';

const API_URL = 'http://localhost:8000';

interface CategoryStats {
  main: number;
  guides: number;
  events: number;
  fish_species: number;
}

export const newsApi = {
  getAllNews: async (): Promise<NewsItem[]> => {
    const response = await axios.get(`${API_URL}/news/`);
    return response.data;
  },

  getNewsById: async (id: number): Promise<NewsItem> => {
    const response = await axios.get(`${API_URL}/news/${id}`);
    return response.data;
  },

  getCategoryStats: async (): Promise<CategoryStats> => {
    const response = await axios.get(`${API_URL}/news/stats/categories`);
    return response.data;
  }
}; 