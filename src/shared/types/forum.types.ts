export interface ForumCategory {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  parent_id: number | null;
  parent_title?: string;
  topics_count: number;
  messages_count: number;
  subcategories?: ForumCategory[];
}

export interface ForumTopic {
  id: number;
  title: string;
  category_id: number;
  tags: string[];
  author_id: number;
  created_at: string;
  is_closed: boolean;
  is_pinned: boolean;
  views_count: number;
  posts_count: number;
  last_post_id: number | null;
  last_post_author_id: number | null;
  last_post_date: string | null;
  author_username?: string;
  author_avatar?: string;
  author_fullname?: string;
  category_title?: string;
  parent_category_id?: number;
  parent_category_title?: string;
  last_post_author_username?: string;
  last_post_author_avatar?: string;
}

export interface ForumUserData {
  id: number;
  username: string;
  fullname?: string;
  avatar?: string;
  registration_date?: string;
  posts_count?: number;
  role?: string;
}

export interface ForumPost {
  id: number;
  topic_id: number;
  author_id: number;
  content: string;
  quoted_post_id: number | null;
  created_at: string;
  updated_at: string;
  is_topic_starter: boolean;
  is_edited: boolean;
  likes_count: number;
  dislikes_count: number;
  author_username?: string;
  author_avatar?: string;
  author_signature?: string;
  author_post_count?: number;
  images?: ForumPostImage[];
  quoted_content?: string;
  quoted_author?: string;
  user?: ForumUserData;
}

export interface ForumPostImage {
  id: number;
  image_url: string;
  thumbnail_url: string;
  dimensions: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CreateTopicRequest {
  title: string;
  category_id: number;
  tags: string[];
  content: string;
}

export interface CreatePostRequest {
  topic_id: number;
  content: string;
  quoted_post_id?: number | null;
  images?: File[];
}

export interface CreateCategoryRequest {
  title: string;
  description: string;
  icon: string;
  parent_id?: number | null;
  order?: number;
} 