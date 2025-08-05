// User Types
export interface User {
  userId: string
  username: string
  email: string
  fullName: string
  role: 'ADMIN' | 'CUSTOMER'
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// Category Types
export interface Category {
  categoryId: string
  name: string
  description: string
  imageBase64: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Product Types
export interface Product {
  productId: string
  name: string
  description: string
  category: Category
  warehouse: Warehouse
  brand: string
  model: string
  sku?: string
  unitPrice: number
  costPrice: number
  minimumStockThreshold: number
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
  inventories?: Inventory[],
  initialStockUnit?: string
}

export interface ProductWithStock extends Product {
  totalAvailableStock: number
  totalReservedStock: number
  totalDamagedStock: number
  inStock: boolean
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

// Warehouse Types
export interface Warehouse {
  warehouseId: string
  name: string
  location: string
  contactDetails: string
}

// Inventory Types
export interface Inventory {
  inventoryId: string
  productId: string
  warehouseId: string
  quantityAvailable: number
  quantityReserved: number
  quantityDamaged: number
  lastUpdated: string
  product?: Product
  warehouse?: Warehouse
}

// Purchase Order Types
export interface PurchaseOrderItem {
  id: string
  productId: string
  quantityOrdered: number
  quantityReceived: number
  unitPrice: number
  notes?: string
  product?: Product
}

export interface PurchaseOrder {
  purchaseOrderId: string
  warehouseId: string
  supplierName: string
  contactInfo?: string
  status: 'PENDING' | 'APPROVED' | 'RECEIVED'
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  items: PurchaseOrderItem[]
  warehouse?: Warehouse
}

// Sales Order Types
export interface SalesOrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  notes?: string
  product?: Product
}

export interface SalesOrder {
  orderId: string
  customerName: string
  customerEmail: string
  shippingAddress?: string
  billingAddress?: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  items: SalesOrderItem[]
  customer?: User
  warehouse?: Warehouse
}

// Alert Types
export interface Alert {
  alertId: string
  productId: string
  warehouseId: string
  alertType?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY_WARNING'
  message: string
  status?: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED'
  threshold?: number
  currentStock?: number
  suggestedReorderQuantity?: number
  optimalStockLevel?: number
  createdAt?: string
  product?: Product
  warehouse?: Warehouse
}

// Dashboard Types
export interface DashboardOverview {
  totalProducts: number
  totalWarehouses: number
  totalUsers: number
  lowStockAlerts: number
  pendingPurchaseOrders: number
  pendingSalesOrders: number
  totalInventoryValue: number
  recentAlerts: Alert[]
  recentOrders: (PurchaseOrder | SalesOrder)[]
}

// Auth Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form Types
export interface CreateProductRequest {
  name: string
  description: string
  category: {
    categoryId: string
  }
  warehouseId: string
  brand: string
  model: string
  sku: string
  unitPrice: number
  costPrice: number
  minimumStockThreshold: number
  specifications: Record<string, string>
  initialStock?: number
}

export interface CreateCustomerRequest {
  username: string
  email: string
  password: string
  fullName: string
} 