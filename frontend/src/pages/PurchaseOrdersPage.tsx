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
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '@/store/store'
import { PurchaseOrder } from '@/types'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import toast from 'react-hot-toast'

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    loadOrders()
    
    // Set up auto-refresh every 30 seconds to show status changes
    const interval = setInterval(() => {
      loadOrders()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [isAdmin, navigate])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const allOrders = await purchaseOrderService.getAllPurchaseOrders()
      setOrders(allOrders)
    } catch (error: any) {
      console.error('Failed to load purchase orders:', error)
      setError('Failed to load purchase orders. Please try again.')
      toast.error('Failed to load purchase orders')
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

  const handleReceiveItems = async (orderId: string) => {
    try {
      setLoading(true)
      
      // For now, we'll just update the status to RECEIVED
      // In a real implementation, you'd have a form to specify received quantities
      await purchaseOrderService.updateOrderStatus(orderId, 'RECEIVED')
      
      // Reload orders to get updated data
      await loadOrders()
      
      toast.success('Items received successfully!')
    } catch (error: any) {
      console.error('Failed to receive items:', error)
      const errorMessage = error.response?.data?.message || 'Failed to receive items'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getTimeUntilAutoApproval = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const oneMinuteLater = new Date(created.getTime() + 60 * 1000) // 1 minute later
    
    if (now >= oneMinuteLater) {
      return 'Auto-approved'
    }
    
    const timeLeft = oneMinuteLater.getTime() - now.getTime()
    const minutes = Math.floor(timeLeft / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
    
    return `${minutes}m ${seconds}s`
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (order.purchaseOrderId?.toLowerCase() || '').includes(searchLower) ||
      (order.warehouse?.name?.toLowerCase() || '').includes(searchLower) ||
      (order.status?.toLowerCase() || '').includes(searchLower)
    )
  })

  if (!isAdmin) {
    return null
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Purchase Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage purchase orders with auto-approval after 1 minute
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/purchase-orders/new')}
        >
          Create Purchase Order
        </Button>
        
        <TextField
          placeholder="Search by order ID, warehouse, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300, ml: 'auto' }}
        />
      </Box>

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
               No Purchase Orders Found
             </Typography>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
               Purchase orders will appear here once created.
             </Typography>
             <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={() => navigate('/purchase-orders/new')}
             >
               Create First Purchase Order
             </Button>
           </Box>
         ) : (
           <TableContainer sx={{ maxHeight: 400 }}>
             <Table stickyHeader>
               <TableHead>
                 <TableRow>
                   <TableCell>Order ID</TableCell>
                   <TableCell>Warehouse</TableCell>
                   <TableCell>Status</TableCell>
                   <TableCell>Items</TableCell>
                   <TableCell>Created</TableCell>
                   <TableCell>Auto-Approval</TableCell>
                   <TableCell>Actions</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {filteredOrders.map((order) => (
                   <TableRow key={order.purchaseOrderId}>
                     <TableCell>
                       <Typography variant="body2" fontWeight="medium">
                         {order.purchaseOrderId}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       <Typography variant="body2">
                         {order.warehouse?.name || 'Unknown'}
                       </Typography>
                       <Typography variant="caption" color="text.secondary">
                         {order.warehouse?.location || 'N/A'}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       <Chip
                         icon={getStatusIcon(order.status || '')}
                         label={order.status || 'Unknown'}
                         color={getStatusColor(order.status || '') as any}
                         size="small"
                       />
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
                       <Typography variant="caption" color="text.secondary">
                         {new Date(order.createdAt).toLocaleTimeString()}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       {order.status === 'PENDING' ? (
                         <Typography variant="caption" color="warning.main">
                           {getTimeUntilAutoApproval(order.createdAt)}
                         </Typography>
                       ) : (
                         <Typography variant="caption" color="text.secondary">
                           {order.status === 'APPROVED' ? 'Auto-approved' : 'Approved'}
                         </Typography>
                       )}
                     </TableCell>
                     <TableCell>
                       <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                         <Button
                           size="small"
                           startIcon={<VisibilityIcon />}
                           onClick={() => navigate(`/purchase-orders/${order.purchaseOrderId}`)}
                         >
                           View
                         </Button>
                         
                         {order.status === 'APPROVED' && (
                           <Button
                             size="small"
                             variant="contained"
                             color="success"
                             startIcon={<CheckCircleIcon />}
                             onClick={() => handleReceiveItems(order.purchaseOrderId)}
                             disabled={loading}
                           >
                             Receive
                           </Button>
                         )}
                       </Box>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Approved Orders
                </Typography>
                <Typography variant="h4" color="info.main">
                  {orders.filter(order => order.status === 'APPROVED').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Received Orders
                </Typography>
                <Typography variant="h4" color="success.main">
                  {orders.filter(order => order.status === 'RECEIVED').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 Purchase Orders Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Auto-Approval System:</strong> Purchase orders are automatically approved after 1 minute.
          <br />
          <strong>Order Status:</strong> PENDING → APPROVED (auto) → RECEIVED (auto)
          <br />
          <strong>Inventory Update:</strong> When items are received, inventory is automatically increased.
          <br />
          <strong>Order Details:</strong> Click "View" to see complete order information.
        </Typography>
      </Box>
    </Container>
  )
}

export default PurchaseOrdersPage 