import api from "../lib/api";
import { Brand, ApiResponse } from "../types";

export const brandService = {
  async getBrands(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<Brand[]>> {
    const response = await api.get<ApiResponse<Brand[]>>("/brand", { params: { limit: 100, ...params } });
    return response.data;
  },

  async getBrand(slug: string): Promise<ApiResponse<Brand>> {
    const response = await api.get<ApiResponse<Brand>>(`/brand/${slug}`);
    return response.data;
  },

  async createBrand(data: FormData | Record<string, any>): Promise<ApiResponse<Brand>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.post<ApiResponse<Brand>>("/brand", data, { headers });
    return response.data;
  },

  async updateBrand(slug: string, data: FormData | Record<string, any>): Promise<ApiResponse<Brand>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.put<ApiResponse<Brand>>(`/brand/${slug}`, data, { headers });
    return response.data;
  },

  async deleteBrand(slug: string): Promise<ApiResponse<Brand>> {
    const response = await api.delete<ApiResponse<Brand>>(`/brand/${slug}`);
    return response.data;
  }
};
