import api from "../lib/api";
import { DashboardStats, ChartDataPoint, Sale, ApiResponse } from "../types";

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return response.data;
  },

  async getChart(days = 7): Promise<ApiResponse<ChartDataPoint[]>> {
    const response = await api.get<ApiResponse<ChartDataPoint[]>>("/dashboard/chart", {
      params: { days }
    });
    return response.data;
  },

  async getRecentActivities(): Promise<ApiResponse<Sale[]>> {
    const response = await api.get<ApiResponse<Sale[]>>("/dashboard/recent");
    return response.data;
  },

  async getTopProducts(): Promise<ApiResponse<Array<{ _id: string; name: string; totalQuantity: number; totalRevenue: number }>>> {
    const response = await api.get<ApiResponse<any>>("/dashboard/top-products");
    return response.data;
  }
};
