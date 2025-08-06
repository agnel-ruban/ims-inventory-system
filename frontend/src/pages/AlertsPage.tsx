import { alertService } from '@/services/alertService'
import { RootState } from '@/store/store'
import { Alert as AlertType } from '@/types'
import {
  CheckCircle as CheckCircleIcon,
  BugReport as DebugIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const AlertsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<Set<string>>(new Set())

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    loadAlerts()
  }, [isAdmin, navigate])

  const handleDebugTrigger = async () => {
    try {
      setLoading(true)
      console.log('Triggering manual alert check...')
      
      // Call the debug endpoint
      const response = await fetch('/api/alerts/trigger-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const result = await response.json()
      console.log('Debug trigger result:', result)
      
      // Also check inventory status
      const inventoryResponse = await fetch('/api/alerts/debug/inventory-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const inventoryResult = await inventoryResponse.json()
      console.log('Inventory debug result:', inventoryResult)
      
      toast.success('Debug trigger completed. Check console for details.')
      
      // Reload alerts after trigger
      await loadAlerts()
    } catch (error) {
      console.error('Debug trigger error:', error)
      toast.error('Debug trigger failed')
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      setLoading(true)
      console.log('=== LOADING ALERTS ===')
      const allAlerts = await alertService.getAllAlerts()
      console.log('Alerts loaded:', allAlerts)
      setAlerts(allAlerts)
      setError('') // Clear any previous errors
      
      // Clear pending orders on page load to prevent stale state
      setPendingOrders(new Set())
    } catch (error: any) {
      console.error('Failed to load alerts:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      setError('Failed to load alerts. Please try again.')
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertService.acknowledgeAlert(alertId)
      await loadAlerts()
      toast.success('Alert acknowledged')
    } catch (error: any) {
      console.error('Failed to acknowledge alert:', error)
      toast.error('Failed to acknowledge alert')
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId)
      await loadAlerts()
      toast.success('Alert resolved')
    } catch (error: any) {
      console.error('Failed to resolve alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await alertService.deleteAlert(alertId)
      await loadAlerts()
      toast.success('Alert deleted')
    } catch (error: any) {
      console.error('Failed to delete alert:', error)
      toast.error('Failed to delete alert')
    }
  }

  const handleCreatePurchaseOrder = (alert: AlertType) => {
    // Check if there's already a pending order for this alert
    if (pendingOrders.has(alert.alertId)) {
      toast.error('Purchase order already created for this alert!')
      return
    }

    // Add to pending orders to prevent duplicates
    setPendingOrders(prev => new Set(prev).add(alert.alertId))
    
    // Navigate to purchase order page with pre-filled product info and reorder suggestions
    navigate('/purchase-orders/new', {
      state: {
        preSelectedProduct: alert.product,
        preSelectedWarehouse: alert.warehouse,
        suggestedQuantity: alert.suggestedReorderQuantity || 1,
        optimalStockLevel: alert.optimalStockLevel,
        isFromAlert: true,
        alertId: alert.alertId
      }
    })
  }

  const getAlertIcon = (alertType?: string) => {
    switch (alertType) {
      case 'LOW_STOCK':
        return <WarningIcon color="warning" />
      case 'OUT_OF_STOCK':
        return <ErrorIcon color="error" />
      case 'EXPIRY_WARNING':
        return <WarningIcon color="warning" />
      default:
        return <WarningIcon color="warning" />
    }
  }

  const getAlertColor = (alertType?: string) => {
    switch (alertType) {
      case 'LOW_STOCK':
        return 'warning'
      case 'OUT_OF_STOCK':
        return 'error'
      case 'EXPIRY_WARNING':
        return 'warning'
      default:
        return 'warning'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'error'
      case 'ACKNOWLEDGED':
        return 'warning'
      case 'RESOLVED':
        return 'success'
      default:
        return 'default'
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      alert.product?.name?.toLowerCase().includes(searchLower) ||
              alert.product?.initialStockUnit?.toLowerCase().includes(searchLower) ||
      alert.warehouse?.name?.toLowerCase().includes(searchLower) ||
      alert.message.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const activeAlerts = alerts.filter(alert => alert.status === 'ACTIVE')
  const lowStockAlerts = alerts.filter(alert => alert.alertType === 'LOW_STOCK')
  const outOfStockAlerts = alerts.filter(alert => alert.alertType === 'OUT_OF_STOCK')

  if (!isAdmin) {
    return null
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Badge badgeContent={activeAlerts.length} color="error">
            <NotificationsIcon sx={{ fontSize: 40, color: 'error.main' }} />
          </Badge>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'error.main' }}>
              Alerts & Notifications
            </Typography>
                         <Typography variant="body1" color="text.secondary">
               Monitor low stock alerts and create purchase orders to refill inventory
             </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Alert Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {activeAlerts.length}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {lowStockAlerts.length}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.dark', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {outOfStockAlerts.length}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {alerts.filter(alert => alert.status === 'RESOLVED').length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by product, Initial Stock Unit, warehouse, or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <TextField
          select
          label="Status Filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </TextField>

        <Button
          variant="outlined"
          startIcon={<DebugIcon />}
          onClick={handleDebugTrigger}
          disabled={loading}
          color="warning"
        >
          Debug Trigger
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAlerts}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
                 ) : alerts.length === 0 ? (
           <Box sx={{ textAlign: 'center', py: 8 }}>
             <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
             <Typography variant="h6" color="text.secondary" gutterBottom>
               No Low Stock Alerts Found
             </Typography>
             <Typography variant="body2" color="text.secondary">
               All products are above their minimum stock thresholds.
             </Typography>
           </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'error.light' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Alert Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Warehouse</TableCell>
                                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Current Stock</TableCell>
                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Threshold</TableCell>
                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reorder Suggestion</TableCell>
                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow 
                    key={alert.alertId} 
                    hover
                    sx={{ 
                      bgcolor: alert.status === 'ACTIVE' ? 'error.50' : 'inherit',
                      '&:hover': { bgcolor: alert.status === 'ACTIVE' ? 'error.100' : 'inherit' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAlertIcon(alert.alertType || 'LOW_STOCK')}
                        <Chip
                          label={(alert.alertType || 'LOW_STOCK').replace('_', ' ')}
                          color={getAlertColor(alert.alertType || 'LOW_STOCK') as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {alert.product?.name || 'Unknown Product'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Initial Stock Unit: {alert.product?.initialStockUnit || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {alert.warehouse?.name || 'Unknown Warehouse'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {alert.warehouse?.location || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                                         <TableCell>
                       <Box>
                         <Typography 
                           variant="subtitle2" 
                           color={alert.currentStock === 0 ? 'error.main' : 'warning.main'}
                           fontWeight="bold"
                         >
                           {alert.currentStock}
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           Below threshold ({alert.threshold})
                         </Typography>
                       </Box>
                     </TableCell>
                                         <TableCell>
                       <Typography variant="subtitle2">
                         {alert.threshold}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       <Box>
                         <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                           {alert.suggestedReorderQuantity || 'N/A'} units
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           Target: {alert.optimalStockLevel || 'N/A'}
                         </Typography>
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Chip
                         label={alert.status}
                         color={getStatusColor(alert.status) as any}
                         size="small"
                       />
                     </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setDialogOpen(true)
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                                                                         {alert.status === 'ACTIVE' && (
                          <>
                            {pendingOrders.has(alert.alertId) ? (
                              <Tooltip title="Purchase order already created for this alert">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  disabled
                                >
                                  Order Created
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Go to Purchase Order page to refill this product">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<ShoppingCartIcon />}
                                  onClick={() => handleCreatePurchaseOrder(alert)}
                                >
                                  Refill Product
                                </Button>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Acknowledge">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleAcknowledgeAlert(alert.alertId)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {alert.status === 'ACKNOWLEDGED' && (
                          <Tooltip title="Resolve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleResolveAlert(alert.alertId)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
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

      {/* Alert Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
              Alert Details
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Product Information</Typography>
                  <Typography><strong>Name:</strong> {selectedAlert.product?.name}</Typography>
                  <Typography><strong>Initial Stock Unit:</strong> {selectedAlert.product?.initialStockUnit}</Typography>
                  <Typography><strong>Model:</strong> {selectedAlert.product?.model}</Typography>
                  <Typography><strong>Category:</strong> {selectedAlert.product?.category?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Warehouse Information</Typography>
                  <Typography><strong>Name:</strong> {selectedAlert.warehouse?.name}</Typography>
                  <Typography><strong>Location:</strong> {selectedAlert.warehouse?.location}</Typography>
                  <Typography><strong>Contact:</strong> {selectedAlert.warehouse?.contactDetails}</Typography>
                </Grid>
                                 <Grid item xs={12}>
                   <Typography variant="h6" gutterBottom>Alert Information</Typography>
                   <Typography><strong>Type:</strong> {(selectedAlert.alertType || 'LOW_STOCK').replace('_', ' ')}</Typography>
                   <Typography><strong>Message:</strong> {selectedAlert.message}</Typography>
                                       <Typography><strong>Current Stock:</strong> {selectedAlert.currentStock || 'N/A'}</Typography>
                   <Typography><strong>Threshold:</strong> {selectedAlert.threshold}</Typography>
                   <Typography><strong>Status:</strong> {selectedAlert.status}</Typography>
                                       <Typography><strong>Created:</strong> {selectedAlert.createdAt ? new Date(selectedAlert.createdAt).toLocaleString() : 'N/A'}</Typography>
                 </Grid>
                 <Grid item xs={12}>
                   <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                     📦 Reorder Suggestions
                   </Typography>
                   <Typography><strong>Suggested Quantity:</strong> {selectedAlert.suggestedReorderQuantity || 'N/A'} units</Typography>
                   <Typography><strong>Optimal Stock Level:</strong> {selectedAlert.optimalStockLevel || 'N/A'} units</Typography>
                                       <Typography><strong>Stock Deficit:</strong> {(selectedAlert.optimalStockLevel || 0) - (selectedAlert.currentStock || 0)} units</Typography>
                 </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedAlert.status === 'ACTIVE' && (
                                 <Button
                   variant="contained"
                   color="primary"
                   startIcon={<ShoppingCartIcon />}
                   onClick={() => {
                     handleCreatePurchaseOrder(selectedAlert)
                     setDialogOpen(false)
                   }}
                 >
                   Go to Purchase Order Page
                 </Button>
              )}
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 Alert Management System
        </Typography>
                 <Typography variant="body2" color="text.secondary">
           <strong>Low Stock Monitoring:</strong> Products below minimum threshold are automatically flagged.
           <br />
           <strong>Smart Reorder Suggestions:</strong> System calculates optimal refill quantities based on current stock and product value.
           <br />
           <strong>Quick Refill Process:</strong> Click "Refill Product" to go to Purchase Order page with pre-filled details.
           <br />
           <strong>Auto-Resolution:</strong> Alerts automatically disappear when stock is replenished above threshold.
         </Typography>
      </Box>
    </Container>
  )
}

export default AlertsPage 