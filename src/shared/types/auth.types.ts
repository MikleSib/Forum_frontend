export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
  about_me: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  about_me: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
} 