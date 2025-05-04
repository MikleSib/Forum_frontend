export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
  about_me: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface EmailVerification {
  required: boolean;
  message: string;
  email: string;
  expires_in: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  email_verification?: EmailVerification;
  requiresEmailVerification?: boolean;
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