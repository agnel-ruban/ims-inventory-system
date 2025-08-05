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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { RootState } from '@/store/store'
import { PurchaseOrder } from '@/types'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import toast from 'react-hot-toast'

const PurchaseOrderDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    if (orderId) {
      loadOrder()
    }
  }, [isAdmin, navigate, orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await purchaseOrderService.getPurchaseOrderById(orderId!)
      setOrder(orderData)
    } catch (error: any) {
      console.error('Failed to load purchase order:', error)
      setError('Failed to load purchase order. Please try again.')
      toast.error('Failed to load purchase order')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'default'
    
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'APPROVED':
        return 'info'
      case 'RECEIVED':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    if (!status) return <ShoppingCartIcon />
    
    switch (status) {
      case 'PENDING':
        return <ScheduleIcon />
      case 'APPROVED':
        return <CheckCircleIcon />
      case 'RECEIVED':
        return <LocalShippingIcon />
      default:
        return <ShoppingCartIcon />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Purchase order not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/purchase-orders')}
        >
          Back to Purchase Orders
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/purchase-orders')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Purchase Order Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order ID: {order.purchaseOrderId}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Order Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              <Chip
                icon={getStatusIcon(order.status || '')}
                label={order.status || 'Unknown'}
                color={getStatusColor(order.status || '') as any}
                size="medium"
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(order.createdAt).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Order Information Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Warehouse Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6">Warehouse</Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {order.warehouse?.name || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.warehouse?.location || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {order.warehouse?.contactDetails || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" />
                <Typography variant="h6">Supplier</Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {order.supplierName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {order.contactInfo || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InventoryIcon color="primary" />
            <Typography variant="h6">Order Items</Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Initial Stock Unit</TableCell>
                  <TableCell align="right">Quantity Ordered</TableCell>
                  <TableCell align="right">Quantity Received</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.product?.name || 'Unknown Product'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.product?.brand || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.product?.initialStockUnit || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {item.quantityOrdered}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {item.quantityReceived || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(item.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.quantityOrdered * item.unitPrice)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6">
              Total: {formatCurrency(order.items.reduce((total, item) => total + (item.quantityOrdered * item.unitPrice), 0))}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2">
              {order.notes}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/purchase-orders')}
        >
          Back to Purchase Orders
        </Button>
      </Box>
    </Container>
  )
}

export default PurchaseOrderDetailPage 