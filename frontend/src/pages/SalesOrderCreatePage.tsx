import { salesOrderService } from '@/services/salesOrderService'
import { RootState } from '@/store/store'
import { Product, Warehouse } from '@/types'
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  Save as SaveIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const SalesOrderCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const isCustomer = user?.role === 'CUSTOMER'
  const preSelectedProduct = location.state?.preSelectedProduct as Product
  const isFromProductCard = location.state?.isFromProductCard

  useEffect(() => {
    if (!isCustomer) {
      navigate('/dashboard')
      return
    }
    if (!preSelectedProduct) {
      navigate('/products')
      return
    }
    loadWarehouses()
  }, [isCustomer, navigate, preSelectedProduct])

  const loadWarehouses = async () => {
    try {
      setLoading(true)
      
      // Use warehouses from the pre-selected product instead of loading all warehouses
      if (preSelectedProduct?.inventories && preSelectedProduct.inventories.length > 0) {
        const availableWarehouses = preSelectedProduct.inventories
          .filter(inv => inv.quantityAvailable > 0)
          .map(inv => inv.warehouse)
          .filter((warehouse): warehouse is Warehouse => warehouse !== null && warehouse !== undefined)

        setWarehouses(availableWarehouses)

        if (availableWarehouses.length === 1) {
          setSelectedWarehouse(availableWarehouses[0]?.warehouseId || '')
        } else if (availableWarehouses.length > 1) {
          // If multiple warehouses, select the first one with most stock
          const bestWarehouse = preSelectedProduct.inventories
            .filter(inv => inv.quantityAvailable > 0)
            .sort((a, b) => b.quantityAvailable - a.quantityAvailable)[0]
          
          if (bestWarehouse?.warehouse?.warehouseId) {
            setSelectedWarehouse(bestWarehouse.warehouse.warehouseId)
          }
        }
      } else {
        setError('No warehouses have stock for this product')
        toast.error('No warehouses have stock for this product')
      }
    } catch (error: any) {
      console.error('Failed to process warehouse information:', error)
      setError('Failed to process warehouse information')
      toast.error('Failed to process warehouse information')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableStock = () => {
    if (!preSelectedProduct?.inventories || !selectedWarehouse) return 0
    
    const inventory = preSelectedProduct.inventories.find(
      inv => inv.warehouse?.warehouseId === selectedWarehouse
    )
    return inventory?.quantityAvailable || 0
  }

  const getAvailableWarehouses = () => {
    if (!preSelectedProduct?.inventories) return []
    
    return preSelectedProduct.inventories
      .filter(inv => inv.quantityAvailable > 0)
      .map(inv => inv.warehouse)
      .filter(Boolean)
  }

  const validateForm = () => {
    if (!selectedWarehouse) {
      setError('Please select a warehouse')
      return false
    }
    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address')
      return false
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than 0')
      return false
    }
    if (quantity > getAvailableStock()) {
      setError(`Only ${getAvailableStock()} units available in selected warehouse`)
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')

      const items = [{
        id: Date.now().toString(),
        productId: preSelectedProduct.productId,
        quantity: quantity,
        unitPrice: preSelectedProduct.unitPrice,
        notes: notes || `Order for ${preSelectedProduct.name}`
      }]

      console.log('=== FRONTEND ORDER DATA ===')
      console.log('Selected Warehouse:', selectedWarehouse)
      console.log('Customer Name:', user?.fullName || user?.username || '')
      console.log('Customer Email:', user?.email || '')
      console.log('Delivery Address:', deliveryAddress)
      console.log('Notes:', notes)
      console.log('Items:', items)

      const salesOrder = await salesOrderService.createSalesOrder(
        selectedWarehouse,
        user?.fullName || user?.username || '',
        user?.email || '',
        deliveryAddress,
        deliveryAddress, // billing address same as delivery
        notes,
        items
      )

      toast.success('Order placed successfully! Your order is pending admin approval.')
      navigate('/sales-orders')
    } catch (error: any) {
      console.error('Failed to create sales order:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to place order'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return quantity * (preSelectedProduct?.unitPrice || 0)
  }

  if (!isCustomer || !preSelectedProduct) {
    return null
  }

  const availableWarehouses = getAvailableWarehouses()
  const availableStock = getAvailableStock()

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/products')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Place Order
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete your order for {preSelectedProduct.name}
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

      <Grid container spacing={3}>
        {/* Product Information Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Product Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ShoppingCartIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Product Name"
                      secondary={preSelectedProduct.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PriceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Unit Price"
                      secondary={`₹${preSelectedProduct.unitPrice.toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InventoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Available Stock"
                      secondary={`${availableStock} units`}
                      secondaryTypographyProps={{ 
                        color: availableStock > 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Product Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preSelectedProduct.description || 'No description available'}
                  </Typography>
                  {preSelectedProduct.brand && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Brand:</strong> {preSelectedProduct.brand}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Order Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Grid container spacing={2}>
              {/* Warehouse Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    disabled={loading || availableWarehouses.length === 0}
                  >
                    {availableWarehouses.map((warehouse) => {
                      const stock = preSelectedProduct.inventories?.find(
                        inv => inv.warehouse?.warehouseId === warehouse?.warehouseId
                      )?.quantityAvailable || 0
                      
                      return (
                        <MenuItem key={warehouse?.warehouseId} value={warehouse?.warehouseId}>
                          <Box>
                            <Typography variant="body2">
                              {warehouse?.name} - {warehouse?.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Available: {stock} units
                            </Typography>
                          </Box>
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
                {availableWarehouses.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    No warehouses have stock for this product
                  </Alert>
                )}
              </Grid>

              {/* Quantity Selection */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  disabled={loading || availableStock === 0}
                  inputProps={{ 
                    min: 1, 
                    max: availableStock,
                    step: 1
                  }}
                  helperText={`Maximum available: ${availableStock} units`}
                />
              </Grid>

              {/* Delivery Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Address *"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  disabled={loading}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
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
                <ListItemText
                  primary="Product"
                  secondary={preSelectedProduct.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Quantity"
                  secondary={`${quantity} units`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Unit Price"
                  secondary={`₹${preSelectedProduct.unitPrice.toLocaleString()}`}
                />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText
                  primary="Total Amount"
                  secondary={`₹${calculateTotal().toLocaleString()}`}
                  secondaryTypographyProps={{ 
                    variant: 'h6', 
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Order Status:</strong> Will be pending until admin approval
              </Typography>
            </Alert>

            {availableStock < quantity && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Insufficient Stock:</strong> Only {availableStock} units available
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={loading || availableStock === 0 || quantity > availableStock}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default SalesOrderCreatePage 