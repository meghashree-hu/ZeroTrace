export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}