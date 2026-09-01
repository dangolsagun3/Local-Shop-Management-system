import api from "../lib/api";
import { Product, ApiResponse } from "../types";

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  low_stock?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>("/product", { params });
    return response.data;
  },

  async getProduct(idOrSlug: string): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(`/product/${idOrSlug}`);
    return response.data;
  },

  async createProduct(data: FormData | Record<string, any>): Promise<ApiResponse<Product>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.post<ApiResponse<Product>>("/product", data, { headers });
    return response.data;
  },

  async updateProduct(idOrSlug: string, data: FormData | Record<string, any>): Promise<ApiResponse<Product>> {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.put<ApiResponse<Product>>(`/product/${idOrSlug}`, data, { headers });
    return response.data;
  },

  async deleteProduct(idOrSlug: string): Promise<ApiResponse<Product>> {
    const response = await api.delete<ApiResponse<Product>>(`/product/${idOrSlug}`);
    return response.data;
  },

  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>("/product/low-stock");
    return response.data;
  },

  async adjustStock(productId: string, changeAmount: number, reason?: string): Promise<ApiResponse<Product>> {
    const response = await api.post<ApiResponse<Product>>("/product/adjust-stock", {
      productId,
      changeAmount,
      reason
    });
    return response.data;
  }
};
