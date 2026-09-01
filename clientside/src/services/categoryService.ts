import api from "../lib/api";
import { Category, ApiResponse } from "../types";

export const categoryService = {
  async getCategories(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>("/category", { params: { limit: 100, ...params } });
    return response.data;
  },

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    const response = await api.get<ApiResponse<Category>>(`/category/${slug}`);
    return response.data;
  },

  async createCategory(data: FormData | Record<string, any>): Promise<ApiResponse<Category>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.post<ApiResponse<Category>>("/category", data, { headers });
    return response.data;
  },

  async updateCategory(slug: string, data: FormData | Record<string, any>): Promise<ApiResponse<Category>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.put<ApiResponse<Category>>(`/category/${slug}`, data, { headers });
    return response.data;
  },

  async deleteCategory(slug: string): Promise<ApiResponse<Category>> {
    const response = await api.delete<ApiResponse<Category>>(`/category/${slug}`);
    return response.data;
  }
};
