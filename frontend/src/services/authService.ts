import axios from 'axios'
import { User, LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types'

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

export interface ChangePasswordResponse {
  message: string
}

export const authService = {
  // Login user
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', request)
    return response.data
  },

  // Validate token
  async validateToken(): Promise<{ valid: boolean; user: User }> {
    const response = await api.get('/auth/validate')
    return response.data
  },

  // Change password
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await api.post('/auth/change-password', request)
    return response.data
  },
} 