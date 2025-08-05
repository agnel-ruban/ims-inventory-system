import axios from 'axios'
import { PurchaseOrder, PurchaseOrderItem } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
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

export const purchaseOrderService = {
  // Get all purchase orders
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders')
    return response.data
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchase-orders/${id}`)
    return response.data
  },

  // Create new purchase order
  createPurchaseOrder: async (
    warehouseId: string,
    supplierName: string,
    contactInfo: string,
    notes: string,
    items: PurchaseOrderItem[]
  ): Promise<PurchaseOrder> => {
    const response = await api.post('/purchase-orders', items, {
      params: {
        warehouseId,
        supplierName,
        contactInfo,
        notes,
      },
    })
    return response.data
  },

  // Update purchase order status
  updateOrderStatus: async (id: string, status: string): Promise<PurchaseOrder> => {
    const response = await api.put(`/purchase-orders/${id}/status`, null, {
      params: { newStatus: status },
    })
    return response.data
  },

  // Receive items for a purchase order
  receiveItems: async (id: string, receivedItems: PurchaseOrderItem[]): Promise<PurchaseOrder> => {
    const response = await api.post(`/purchase-orders/${id}/receive`, receivedItems)
    return response.data
  },

  // Get purchase orders by status
  getPurchaseOrdersByStatus: async (status: string): Promise<PurchaseOrder[]> => {
    const response = await api.get(`/purchase-orders/status/${status}`)
    return response.data
  },

  // Get purchase orders by warehouse
  getPurchaseOrdersByWarehouse: async (warehouseId: string): Promise<PurchaseOrder[]> => {
    const response = await api.get(`/purchase-orders/warehouse/${warehouseId}`)
    return response.data
  },

  // Get purchase orders in date range
  getOrdersInDateRange: async (startDate: string, endDate: string): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders/date-range', {
      params: { startDate, endDate },
    })
    return response.data
  },

  // Delete purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`)
  },
} 