import { Post } from '../../shared/types/post.types';

export interface PostCardProps {
  post: Post;
  onClick?: () => void;
} 