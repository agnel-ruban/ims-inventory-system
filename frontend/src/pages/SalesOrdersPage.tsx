import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import {
  Add as AddIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShipIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '@/store/store'
import { SalesOrder } from '@/types'
import { salesOrderService } from '@/services/salesOrderService'
import toast from 'react-hot-toast'

const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      if (isAdmin) {
        // Admin can see all orders
        const allOrders = await salesOrderService.getAllSalesOrders()
        console.log('=== LOADED ORDERS (ADMIN) ===')
        console.log('Total orders:', allOrders.length)
        allOrders.forEach((order, index) => {
          console.log(`Order ${index + 1}:`, {
            orderId: order.orderId,
            customerName: order.customerName,
            status: order.status,
            totalAmount: order.totalAmount
          })
        })
        setOrders(allOrders)
      } else {
        // Customers can only see their own orders
        const customerOrders = await salesOrderService.getSalesOrdersByCustomer(user?.email || '')
        console.log('=== LOADED ORDERS (CUSTOMER) ===')
        console.log('Total orders:', customerOrders.length)
        customerOrders.forEach((order, index) => {
          console.log(`Order ${index + 1}:`, {
            orderId: order.orderId,
            customerName: order.customerName,
            status: order.status,
            totalAmount: order.totalAmount
          })
        })
        setOrders(customerOrders)
      }
    } catch (error: any) {
      console.error('Failed to load orders:', error)
      setError('Failed to load orders. Please try again.')
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONFIRMED':
        return 'info'
      case 'SHIPPED':
        return 'primary'
      case 'DELIVERED':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ShoppingCartIcon />
      case 'CONFIRMED':
        return <CheckCircleIcon />
      case 'SHIPPED':
        return <LocalShippingIcon />
      case 'DELIVERED':
        return <CheckCircleIcon />
      default:
        return <ShoppingCartIcon />
    }
  }

  const handleViewOrder = (order: SalesOrder) => {
    // Navigate to order details page
    navigate(`/sales-orders/${order.orderId}`)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true)
      
      console.log(`=== FRONTEND STATUS UPDATE ===`)
      console.log(`Order ID being sent: "${orderId}"`)
      console.log(`Order ID type: ${typeof orderId}`)
      console.log(`Order ID length: ${orderId?.length}`)
      console.log(`New Status: ${newStatus}`)
      
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is missing or empty')
      }
      
      // Call the actual API
      await salesOrderService.updateSalesOrderStatus(orderId, newStatus)
      
      // Reload orders to get updated data
      await loadOrders()
      
      const statusText = newStatus === 'CONFIRMED' ? 'approved' : 
                        newStatus === 'CANCELLED' ? 'rejected' : 
                        newStatus.toLowerCase()
      
      toast.success(`Order ${statusText} successfully!`)
    } catch (error: any) {
      console.error('Failed to update order status:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update order status'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const canUpdateStatus = (currentStatus: string, newStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return newStatus === 'CONFIRMED' || newStatus === 'CANCELLED'
      case 'CONFIRMED':
        return newStatus === 'SHIPPED' || newStatus === 'CANCELLED'
      case 'SHIPPED':
        return newStatus === 'DELIVERED'
      default:
        return false
    }
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isAdmin ? 'Customer Purchased Orders' : 'Purchase Products'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? 'Review and approve customer purchase requests' 
            : 'Create new orders and track your purchase history'
          }
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      {!isAdmin && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sales-orders/new')}
          >
            Create New Order
          </Button>
        </Box>
      )}

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocalShippingIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {isAdmin ? 'No Customer Purchased Orders' : 'No Purchase Orders Yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isAdmin 
                ? 'Customer purchased orders will appear here once customers place orders.'
                : 'Your purchase history will appear here once you place orders.'
              }
            </Typography>
            {!isAdmin && (
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  {isAdmin && <TableCell>Customer</TableCell>}
                  <TableCell>Status</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                                 {orders.map((order) => (
                   <TableRow key={order.orderId}>
                     <TableCell>
                       <Typography variant="body2" fontWeight="medium">
                         {order.orderId}
                       </Typography>
                     </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant="body2">
                          {order.customerName || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customerEmail}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </Button>
                          
                          {/* Status Update Buttons - Admin can only approve/reject pending orders */}
                          {order.status === 'PENDING' && (
                            <>
                                                             <Button
                                 size="small"
                                 variant="contained"
                                 color="success"
                                 startIcon={<CheckCircleIcon />}
                                 onClick={() => handleStatusUpdate(order.orderId, 'CONFIRMED')}
                                 disabled={loading}
                               >
                                 Approve
                               </Button>
                               <Button
                                 size="small"
                                 variant="outlined"
                                 color="error"
                                 startIcon={<CancelIcon />}
                                 onClick={() => handleStatusUpdate(order.orderId, 'CANCELLED')}
                                 disabled={loading}
                               >
                                 Reject
                               </Button>
                            </>
                          )}
                          
                          {/* For other statuses, admin can only view */}
                          {order.status !== 'PENDING' && (
                            <Typography variant="caption" color="text.secondary">
                              {order.status === 'CONFIRMED' && '✅ Order approved'}
                              {order.status === 'CANCELLED' && '❌ Order rejected'}
                              {order.status === 'SHIPPED' && '🚚 Order shipped'}
                              {order.status === 'DELIVERED' && '📦 Order delivered'}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        /* Customer View - Show Status Messages */
                        <Box>
                                                     <Button
                             size="small"
                             startIcon={<VisibilityIcon />}
                             onClick={() => navigate(`/sales-orders/${order.orderId}`)}
                           >
                             View Details
                           </Button>
                          {order.status === 'PENDING' && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                              ⏳ Waiting for admin approval
                            </Typography>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                              ✅ Your order has been approved!
                            </Typography>
                          )}
                          {order.status === 'SHIPPED' && (
                            <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 1 }}>
                              🚚 Your order is on its way!
                            </Typography>
                          )}
                          {order.status === 'DELIVERED' && (
                            <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                              📦 Your order has been delivered!
                            </Typography>
                          )}
                          {order.status === 'CANCELLED' && (
                            <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1 }}>
                              ❌ Your order has been rejected
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Statistics */}
      {orders.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4" color="primary">
                  {orders.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Value
                </Typography>
                <Typography variant="h4" color="primary">
                  ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Orders
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {orders.filter(order => order.status === 'PENDING').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Confirmed Orders
                </Typography>
                <Typography variant="h4" color="success.main">
                  {orders.filter(order => order.status === 'CONFIRMED').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rejected Orders
                </Typography>
                <Typography variant="h4" color="error.main">
                  {orders.filter(order => order.status === 'CANCELLED').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
                      📋 {isAdmin ? 'Customer Purchased Orders Management' : 'Purchase Information'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isAdmin ? (
            <>
              <strong>Order Review:</strong> Review and approve/reject customer purchase requests.
              <br />
              <strong>Pending Orders:</strong> Only PENDING orders can be approved or rejected.
              <br />
              <strong>Stock Management:</strong> Approved orders automatically decrease product stock.
              <br />
              <strong>Customer Information:</strong> See customer details and delivery address for each order.
            </>
          ) : (
            <>
              <strong>Purchase History:</strong> View all your previous and current purchase orders.
              <br />
              <strong>Order Status:</strong> Track your order from PENDING approval to final status.
              <br />
              <strong>Create Orders:</strong> Click "Create New Order" to place new purchase orders.
              <br />
              <strong>Order Details:</strong> Click "View Details" to see complete order information.
            </>
          )}
        </Typography>
      </Box>
    </Container>
  )
}

export default SalesOrdersPage 