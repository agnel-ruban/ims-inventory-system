import axios from 'axios'
import { Inventory } from '@/types'

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

export const inventoryService = {
  // Get all inventories with product and warehouse details
  async getAllInventories(): Promise<Inventory[]> {
    const response = await api.get('/inventory')
    return response.data
  },

  // Get inventory by ID
  async getInventoryById(id: string): Promise<Inventory> {
    const response = await api.get(`/inventory/${id}`)
    return response.data
  },

  // Get inventory by product and warehouse
  async getInventoryByProductAndWarehouse(productId: string, warehouseId: string): Promise<Inventory> {
    const response = await api.get(`/inventory/product/${productId}/warehouse/${warehouseId}`)
    return response.data
  },

  // Create new inventory record
  async createInventory(inventoryData: Partial<Inventory>): Promise<Inventory> {
    const response = await api.post('/inventory', inventoryData)
    return response.data
  },

  // Update inventory quantities
  async updateInventory(id: string, inventoryData: Partial<Inventory>): Promise<Inventory> {
    const response = await api.put(`/inventory/${id}`, inventoryData)
    return response.data
  },

  // Delete inventory record
  async deleteInventory(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`)
  },

  // Get low stock inventories
  async getLowStockInventories(): Promise<Inventory[]> {
    const response = await api.get('/inventory/low-stock')
    return response.data
  },

  // Get inventory by warehouse
  async getInventoriesByWarehouse(warehouseId: string): Promise<Inventory[]> {
    const response = await api.get(`/inventory/warehouse/${warehouseId}`)
    return response.data
  },

  // Get inventory by product
  async getInventoriesByProduct(productId: string): Promise<Inventory[]> {
    const response = await api.get(`/inventory/product/${productId}`)
    return response.data
  },
} 