export interface LoginRequest {
  username: string;
  password: string;
}

// Representación única del usuario en memoria
export interface UserSession {
  userId?: string;
  username: string;
  fullName?: string;
  role: 'Admin' | 'Cajero';
}

export interface AuthResponse {
  userId: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Cajero';
  accessTokenExpiry: string;
}

export interface UserMeResponse {
  userId: string;
  username: string;
  role: 'Admin' | 'Cajero';
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
}