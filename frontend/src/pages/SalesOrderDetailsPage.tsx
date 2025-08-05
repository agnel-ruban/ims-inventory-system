import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShipIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { RootState } from '@/store/store'
import { SalesOrder } from '@/types'
import { salesOrderService } from '@/services/salesOrderService'
import toast from 'react-hot-toast'

const SalesOrderDetailsPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (orderId) {
      loadOrderDetails()
    }
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const orderData = await salesOrderService.getSalesOrderById(orderId!)
      setOrder(orderData)
    } catch (error: any) {
      console.error('Failed to load order details:', error)
      setError('Failed to load order details. Please try again.')
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONFIRMED':
        return 'success'
      case 'SHIPPED':
        return 'primary'
      case 'DELIVERED':
        return 'success'
      case 'CANCELLED':
        return 'error'
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
        return <ShipIcon />
      case 'DELIVERED':
        return <CheckCircleIcon />
      case 'CANCELLED':
        return <CancelIcon />
      default:
        return <ShoppingCartIcon />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !order) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'Order not found'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sales-orders')}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sales-orders')}
          >
            Back to Orders
          </Button>
          <Box>
            <Typography variant="h4" gutterBottom>
              Order Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order ID: {order.orderId}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={getStatusIcon(order.status)}
                label={order.status}
                color={getStatusColor(order.status) as any}
                size="medium"
              />
              <Typography variant="h6">
                Order Status: {order.status}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(order.createdAt)}
            </Typography>
            {order.updatedAt !== order.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Last Updated: {formatDate(order.updatedAt)}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Customer Name"
                  secondary={order.customerName}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={order.customerEmail}
                />
              </ListItem>
              {order.shippingAddress && (
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Shipping Address"
                    secondary={order.shippingAddress}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PriceIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Amount"
                  secondary={`₹${order.totalAmount.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InventoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Items"
                  secondary={`${order.items.length} item${order.items.length !== 1 ? 's' : ''}`}
                />
              </ListItem>
              {order.warehouse && (
                <ListItem>
                  <ListItemIcon>
                    <StoreIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Warehouse"
                    secondary={`${order.warehouse.name} - ${order.warehouse.location}`}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {order.items.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">
                        {item.product?.name || 'Product Name Not Available'}
                      </Typography>
                      {item.product?.brand && (
                        <Typography variant="body2" color="text.secondary">
                          Brand: {item.product.brand}
                        </Typography>
                      )}
                                      {item.product?.initialStockUnit && (
                  <Typography variant="body2" color="text.secondary">
                    Initial Stock Unit: {item.product.initialStockUnit}
                  </Typography>
                )}
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity
                      </Typography>
                      <Typography variant="h6">
                        {item.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Unit Price
                      </Typography>
                      <Typography variant="h6">
                        ₹{item.unitPrice.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{(item.quantity * item.unitPrice).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  {item.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Notes: {item.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Notes */}
        {order.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Notes
              </Typography>
              <Typography variant="body1">
                {order.notes}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Status Messages */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Order Status Information
            </Typography>
            {order.status === 'PENDING' && (
              <Alert severity="warning">
                ⏳ Your order is pending admin approval. You will be notified once it's processed.
              </Alert>
            )}
            {order.status === 'CONFIRMED' && (
              <Alert severity="success">
                ✅ Your order has been approved! It will be processed and shipped soon.
              </Alert>
            )}
            {order.status === 'SHIPPED' && (
              <Alert severity="info">
                🚚 Your order is on its way! Track your delivery for updates.
              </Alert>
            )}
            {order.status === 'DELIVERED' && (
              <Alert severity="success">
                📦 Your order has been delivered! Thank you for your purchase.
              </Alert>
            )}
            {order.status === 'CANCELLED' && (
              <Alert severity="error">
                ❌ Your order has been cancelled. Please contact support if you have questions.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default SalesOrderDetailsPage 