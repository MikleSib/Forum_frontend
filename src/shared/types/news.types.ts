export type ContentType = 'text' | 'image' | 'video';

export interface NewsContent {
  type: ContentType;
  content: string;
  order: number;
}

export interface Author {
  id: number;
  name: string;
  avatar: string;
}

export interface NewsItem {
  id: number;
  title: string;
  contents: NewsContent[];
  category: NewsCategory;
  author: Author;
  author_id: number;
  created_at: string;
  updated_at: string;
  likes: number;
}

export enum NewsCategory {
  NEWS = 'news',
  GUIDES = 'guides',
  FISH_SPECIES = 'fish_species',
  EVENTS = 'events'
}

export const NEWS_CATEGORIES = {
  [NewsCategory.NEWS]: {
    title: 'Новости',
    description: 'Последние новости от администраторов'
  },
  [NewsCategory.FISH_SPECIES]: {
    title: 'Виды рыб',
    description: 'Информация о различных видах рыб'
  },
  [NewsCategory.EVENTS]: {
    title: 'События',
    description: 'Анонсы мероприятий и соревнований'
  }
}; 