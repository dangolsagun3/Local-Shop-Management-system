import api from "../lib/api";
import { Sale, ApiResponse } from "../types";

export interface CreateSalePayload {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    discount?: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'credit' | 'split';
  notes?: string;
}

export interface SaleFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  startDate?: string;
  endDate?: string;
  today?: boolean | string;
}

export const posService = {
  async createSale(payload: CreateSalePayload): Promise<ApiResponse<Sale>> {
    const response = await api.post<ApiResponse<Sale>>("/sale", payload);
    return response.data;
  },

  async getSales(params?: SaleFilterParams): Promise<ApiResponse<Sale[]>> {
    const response = await api.get<ApiResponse<Sale[]>>("/sale", { params });
    return response.data;
  },

  async getSaleDetail(idOrInvoice: string): Promise<ApiResponse<Sale>> {
    const response = await api.get<ApiResponse<Sale>>(`/sale/${idOrInvoice}`);
    return response.data;
  },

  async cancelSale(id: string): Promise<ApiResponse<Sale>> {
    const response = await api.post<ApiResponse<Sale>>(`/sale/${id}/cancel`);
    return response.data;
  }
};
