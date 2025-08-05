import axios from 'axios'
import { Warehouse } from '@/types'

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

export const warehouseService = {
  // Get all warehouses
  async getAllWarehouses(): Promise<Warehouse[]> {
    const response = await api.get('/warehouses')
    return response.data
  },

  // Get warehouse by ID
  async getWarehouseById(id: string): Promise<Warehouse> {
    const response = await api.get(`/warehouses/${id}`)
    return response.data
  },

  // Create new warehouse
  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.post('/warehouses', warehouseData)
    return response.data
  },

  // Update warehouse
  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put(`/warehouses/${id}`, warehouseData)
    return response.data
  },

  // Delete warehouse
  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`)
  },

  async getWarehouseWithProducts(id: string): Promise<{ warehouseId: string; hasProducts: boolean; hasProductsWithStock: boolean }> {
    const response = await api.get(`/warehouses/${id}/with-products`)
    return response.data
  },
} 