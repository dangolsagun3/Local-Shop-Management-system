// API utility functions for making requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export async function apiCall(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, headers = {} } = options

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

// Specific API functions
export const productAPI = {
  getAll: () => apiCall('/api/products'),
  getOne: (id: string) => apiCall(`/api/products/${id}`),
  create: (data: any) => apiCall('/api/products', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiCall(`/api/products/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/api/products/${id}`, { method: 'DELETE' }),
}

export const customerAPI = {
  getAll: () => apiCall('/api/customers'),
  getOne: (id: string) => apiCall(`/api/customers/${id}`),
  create: (data: any) => apiCall('/api/customers', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiCall(`/api/customers/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/api/customers/${id}`, { method: 'DELETE' }),
}

export const orderAPI = {
  getAll: () => apiCall('/api/orders'),
  getOne: (id: string) => apiCall(`/api/orders/${id}`),
  create: (data: any) => apiCall('/api/orders', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiCall(`/api/orders/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/api/orders/${id}`, { method: 'DELETE' }),
}

export const dashboardAPI = {
  getStats: () => apiCall('/api/dashboard/stats'),
}

export const reportAPI = {
  getReports: (startDate: string, endDate: string) =>
    apiCall(`/api/reports?startDate=${startDate}&endDate=${endDate}`),
}
