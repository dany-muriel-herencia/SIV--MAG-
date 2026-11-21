export enum UserRole {
  ADMIN = 1,
  CAJERO = 2,
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullName?: string;
  role?: UserRole;
  password?: string;
}
