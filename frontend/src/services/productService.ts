import axios from 'axios'
import { Product, CreateProductRequest } from '@/types'

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

export const productService = {
  // Get all products with stock information
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/products/with-inventory')
    return response.data
  },

  // Get product by ID with stock information
  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}/with-inventory`)
    return response.data
  },

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Create product with category (combined API)
  async createProductWithCategory(productData: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products/with-category', productData)
    return response.data
  },

  // Update product
  async updateProduct(id: string, productData: Partial<CreateProductRequest>): Promise<Product> {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  // Get products by category
  async getProductsByCategory(categoryName: string): Promise<Product[]> {
    const response = await api.get(`/products/category/${categoryName}`)
    return response.data
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  },
} 