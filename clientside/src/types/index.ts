export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  image?: { url: string; path: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  image?: { url: string; path: string } | null;
  status: 'active' | 'inactive';
  parentId?: Category | null;
  createdAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  image?: { url: string; path: string } | null;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  category?: Category | { _id: string; name: string; slug: string } | null;
  brand?: Brand | { _id: string; name: string; slug: string } | null;
  costPrice: number;
  price: number;
  discount: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  image?: { url: string; path: string; filename?: string } | null;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured?: boolean;
  createdBy?: User | { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface SaleItem {
  product: string | Product;
  name: string;
  sku?: string;
  price: number;
  costPrice?: number;
  quantity: number;
  discount?: number;
  unit?: string;
  total: number;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: CustomerInfo;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  dueAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'credit' | 'split';
  paymentStatus: 'paid' | 'partial' | 'due';
  orderStatus: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  cashier?: User | { _id: string; name: string; email: string } | null;
  cashierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    thisMonth: number;
    totalDiscount: number;
  };
  orders: {
    total: number;
    today: number;
    thisMonth: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStockUnits: number;
    costValuation: number;
    retailValuation: number;
    estimatedProfit: number;
  };
  users: {
    total: number;
    customers: number;
  };
}

export interface ChartDataPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  meta?: any;
}
