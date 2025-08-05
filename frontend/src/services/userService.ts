import axios from 'axios'
import { User } from '@/types'

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

export interface CreateCustomerRequest {
  username: string
  email: string
  password: string
  fullName: string
}

export interface CreateCustomerResponse {
  message: string
  userId: string
  username: string
  email: string
  fullName: string
  role: string
  enabled: boolean
}

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users')
    return response.data
  },

  // Create customer user
  async createCustomer(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    const response = await api.post('/users/create-customer', request)
    return response.data
  },

  // Delete user
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  },

  // Toggle user status
  async toggleUserStatus(userId: string): Promise<User> {
    const response = await api.put(`/users/${userId}/toggle-status`)
    return response.data
  },

  // Reset user password
  async resetUserPassword(userId: string): Promise<{ message: string; newPassword: string }> {
    const response = await api.put(`/users/${userId}/reset-password`)
    return response.data
  },
} 