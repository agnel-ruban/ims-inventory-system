import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import { validateToken } from './store/slices/authSlice'
import { AppDispatch, RootState } from './store/store'

// Pages
import AlertsPage from './pages/AlertsPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import LoginPage from './pages/LoginPage'
import ProductCreatePage from './pages/ProductCreatePage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import PurchaseOrderCreatePage from './pages/PurchaseOrderCreatePage'
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import SalesOrderCreatePage from './pages/SalesOrderCreatePage'
import SalesOrderDetailsPage from './pages/SalesOrderDetailsPage'
import SalesOrdersPage from './pages/SalesOrdersPage'
import UserManagementPage from './pages/UserManagementPage'
import WarehousePage from './pages/WarehousePage'

// Components
import LoadingSpinner from './components/Common/LoadingSpinner'
import Layout from './components/Layout/Layout'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Validate token on app start if token exists
    if (localStorage.getItem('token')) {
      dispatch(validateToken())
    }
  }, [dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PurchaseOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PurchaseOrderCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders/:orderId"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PurchaseOrderDetailPage />
            </ProtectedRoute>
          }
        />
                         <Route
                   path="sales-orders"
                   element={
                     <ProtectedRoute>
                       <SalesOrdersPage />
                     </ProtectedRoute>
                   }
                 />
                         <Route
          path="sales-orders/new"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <SalesOrderCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales-orders/:orderId"
          element={
            <ProtectedRoute>
              <SalesOrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="alerts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <WarehousePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App 