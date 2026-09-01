import api from "../lib/api";
import { User, ApiResponse } from "../types";

export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>("/user", { params });
    return response.data;
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/user/${id}`);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/user/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.delete<ApiResponse<User>>(`/user/${id}`);
    return response.data;
  }
};
