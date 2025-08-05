import axios from 'axios'
import { SalesOrder, SalesOrderItem } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const salesOrderService = {
  getAllSalesOrders: async (): Promise<SalesOrder[]> => {
    const response = await api.get('/sales-orders')
    return response.data
  },

  getSalesOrderById: async (id: string): Promise<SalesOrder> => {
    const response = await api.get(`/sales-orders/${id}`)
    return response.data
  },

  createSalesOrder: async (
    warehouseId: string,
    customerName: string,
    customerEmail: string,
    shippingAddress: string,
    billingAddress: string,
    notes: string,
    items: SalesOrderItem[]
  ): Promise<SalesOrder> => {
    const response = await api.post('/sales-orders', {
      warehouseId,
      customerName,
      customerEmail,
      shippingAddress,
      billingAddress,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes
      }))
    })
    return response.data
  },

  updateSalesOrderStatus: async (id: string, status: string): Promise<SalesOrder> => {
    const response = await api.put(`/sales-orders/${id}/status`, { status })
    return response.data
  },

  deleteSalesOrder: async (id: string): Promise<void> => {
    await api.delete(`/sales-orders/${id}`)
  },

  getSalesOrdersByCustomer: async (customerId: string): Promise<SalesOrder[]> => {
    const response = await api.get(`/sales-orders/customer/${customerId}`)
    return response.data
  },

  getSalesOrdersByStatus: async (status: string): Promise<SalesOrder[]> => {
    const response = await api.get(`/sales-orders/status/${status}`)
    return response.data
  }
} 