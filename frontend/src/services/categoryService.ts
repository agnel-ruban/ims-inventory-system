import axios from 'axios'
import { Category } from '@/types'

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

export const categoryService = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  },

  // Get active categories only
  async getActiveCategories(): Promise<Category[]> {
    const response = await api.get('/categories/active')
    return response.data
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Get category by name
  async getCategoryByName(name: string): Promise<Category> {
    const response = await api.get(`/categories/name/${name}`)
    return response.data
  },
} 