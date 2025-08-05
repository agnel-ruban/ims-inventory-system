import axios from 'axios'
import { Alert } from '@/types'

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

export const alertService = {
  // Get all active alerts
  getAllAlerts: async (): Promise<Alert[]> => {
    const response = await api.get('/alerts')
    return response.data
  },

  // Get alerts by status
  getAlertsByStatus: async (status: string): Promise<Alert[]> => {
    const response = await api.get(`/alerts/status/${status}`)
    return response.data
  },

  // Get alerts by product
  getAlertsByProduct: async (productId: string): Promise<Alert[]> => {
    const response = await api.get(`/alerts/product/${productId}`)
    return response.data
  },

  // Get alerts by warehouse
  getAlertsByWarehouse: async (warehouseId: string): Promise<Alert[]> => {
    const response = await api.get(`/alerts/warehouse/${warehouseId}`)
    return response.data
  },

  // Get low stock alerts count (for notification badge)
  getLowStockAlertsCount: async (): Promise<number> => {
    const response = await api.get('/alerts/count/low-stock')
    return response.data.count
  },

  // Acknowledge an alert
  acknowledgeAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.put(`/alerts/${alertId}/acknowledge`)
    return response.data
  },

  // Resolve an alert
  resolveAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.put(`/alerts/${alertId}/resolve`)
    return response.data
  },

  // Delete an alert
  deleteAlert: async (alertId: string): Promise<void> => {
    await api.delete(`/alerts/${alertId}`)
  },
} 