import api from "../lib/api";
import { User, ApiResponse } from "../types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'seller' | 'customer';
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData & User>> {
    const response = await api.post<ApiResponse<AuthResponseData & User>>("/auth/register", payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/login", payload);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  async seedData(): Promise<ApiResponse<boolean>> {
    const response = await api.post<ApiResponse<boolean>>("/seed");
    return response.data;
  }
};
