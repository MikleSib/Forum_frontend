export interface Author {
  id: number;
  username: string;
  full_name: string;
  about_me: string | null;
  avatar?: string;
}

export interface PostImage {
  image_url: string;
  id: number;
  post_id: number;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author: Author;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  comments: Comment[];
  likes: Like[];
  category_id?: number;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images: File[];
  category_id?: number;
}

export interface CreatePostResponse {
  success: boolean;
  post?: Post;
  error?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  created_at: string;
  updated_at: string;
  post_id: number;
  likes: Like[];
  is_edited: boolean;
  parent_id?: number;
}

export interface Like {
  id: number;
  user_id: number;
  post_id?: number;
  comment_id?: number;
  created_at: string;
}

export interface PostCardProps {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  author: Author;
  date: string;
  likes: Like[];
  comments: Comment[];
}