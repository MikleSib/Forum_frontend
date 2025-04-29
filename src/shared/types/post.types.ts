export interface Author {
  name: string;
  avatar?: string;
  id: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: Author;
  date: string;
  likes: number;
  comments: number;
}

export interface PostCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  author: Author;
  date: string;
} 