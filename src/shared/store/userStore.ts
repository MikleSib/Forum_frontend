export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  firstName?: string;
  lastName?: string;
  about?: string;
  avatar?: string;
  full_name?: string;
  about_me?: string;
  signature?: string;
  registration_date?: string;
  posts_count?: number;
  role?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

class UserStore {
  private static instance: UserStore;
  private _user: User | null = null;
  private _isAdmin: boolean = false;
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;

  private constructor() {
    // Загружаем данные из localStorage при инициализации
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const auth: AuthResponse = JSON.parse(savedAuth);
      this._user = auth.user;
      this._isAdmin = auth.user.is_admin;
      this._accessToken = auth.access_token;
      this._refreshToken = auth.refresh_token;
    }
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  public setAuth(auth: AuthResponse) {
    this._user = auth.user;
    this._isAdmin = auth.user.is_admin;
    this._accessToken = auth.access_token;
    this._refreshToken = auth.refresh_token;
    
    // Сохраняем в localStorage
    localStorage.setItem('auth', JSON.stringify(auth));
  }

  public clear() {
    this._user = null;
    this._isAdmin = false;
    this._accessToken = null;
    this._refreshToken = null;
    localStorage.removeItem('auth');
  }

  public updateUser(userData: Partial<User>) {
    if (!this._user) return;
    
    // Обновляем данные пользователя
    this._user = { ...this._user, ...userData };
    
    // Обновляем в localStorage, сохраняя текущие токены
    if (this._accessToken && this._refreshToken) {
      const auth = {
        user: this._user,
        access_token: this._accessToken,
        refresh_token: this._refreshToken
      };
      localStorage.setItem('auth', JSON.stringify(auth));
    }
  }

  get user(): User | null {
    return this._user;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get accessToken(): string | null {
    return this._accessToken;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  set user(user: User | null) {
    this._user = user;
  }
}

export const userStore = UserStore.getInstance(); 