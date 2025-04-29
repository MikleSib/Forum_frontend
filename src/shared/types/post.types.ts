export interface Author {
  id: number;
  username: string;
  full_name: string;
  about_me: string | null;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author: Author;
  created_at: string;
  updated_at: string;
  images: string[];
  comments: any[];
  likes: any[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images: File[];
}

export interface CreatePostResponse {
  success: boolean;
  post?: Post;
  error?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  date: string;
  postId: string;
  likes?: number;
  isEdited?: boolean;
  parentId?: string; // Для вложенных комментариев
}

export interface PostCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  author: Author;
  date: string;
} 