import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '@/store/store'
import { PurchaseOrderItem, Product, Warehouse } from '@/types'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { productService } from '@/services/productService'
import { warehouseService } from '@/services/warehouseService'
import toast from 'react-hot-toast'

const PurchaseOrderCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  // Pre-filled data from alert (if coming from alert page)
  const preSelectedProduct = location.state?.preSelectedProduct as Product
  const preSelectedWarehouse = location.state?.preSelectedWarehouse as Warehouse
  const suggestedQuantity = location.state?.suggestedQuantity as number
  const optimalStockLevel = location.state?.optimalStockLevel as number
  const isFromAlert = location.state?.isFromAlert as boolean
  const alertId = location.state?.alertId as string

  // Filter products based on selected warehouse
  const filterProductsByWarehouse = (warehouseId: string) => {
    if (!warehouseId) {
      setFilteredProducts(products)
      return
    }
    
    const filtered = products.filter(product => {
      // Check if product has inventory in the selected warehouse
      return product.inventories?.some(inventory => 
        inventory.warehouse?.warehouseId === warehouseId
      )
    })
    setFilteredProducts(filtered)
  }

  // Handle warehouse selection change
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId)
    filterProductsByWarehouse(warehouseId)
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [isAdmin, navigate])

  // Update filtered products when products or selected warehouse changes
  useEffect(() => {
    filterProductsByWarehouse(selectedWarehouse)
  }, [products, selectedWarehouse])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, warehousesData] = await Promise.all([
        productService.getProducts(),
        warehouseService.getAllWarehouses()
      ])
      setProducts(productsData)
      setWarehouses(warehousesData)
      setFilteredProducts(productsData) // Initially show all products

      // Pre-fill data if coming from alert
      if (isFromAlert && preSelectedWarehouse) {
        setSelectedWarehouse(preSelectedWarehouse.warehouseId)
        setSupplierName('Default Supplier') // Can be enhanced with supplier management
        setContactInfo('supplier@example.com')
        setNotes(`Reorder from alert - Target stock level: ${optimalStockLevel}`)
        
        // Add pre-selected product with suggested quantity
        if (preSelectedProduct && suggestedQuantity) {
          const newItem: PurchaseOrderItem = {
            id: Date.now().toString(),
            productId: preSelectedProduct.productId,
            quantityOrdered: suggestedQuantity,
            quantityReceived: 0,
                            unitPrice: preSelectedProduct.unitPrice,
            notes: `Suggested reorder quantity from alert system`,
            product: preSelectedProduct
          }
          setItems([newItem])
        }
      }
    } catch (error: any) {
      console.error('Failed to load data:', error)
      setError('Failed to load products and warehouses')
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first')
      return
    }
    
    if (filteredProducts.length === 0) {
      toast.error('No products available for the selected warehouse')
      return
    }
    
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      productId: '',
      quantityOrdered: 1,
      quantityReceived: 0,
      unitPrice: 0,
      notes: ''
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleItemChange = (itemId: string, field: keyof PurchaseOrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        
        // Auto-fill product details when product is selected
        if (field === 'productId') {
          const selectedProduct = filteredProducts.find(p => p.productId === value)
          if (selectedProduct) {
            updatedItem.product = selectedProduct
                          updatedItem.unitPrice = selectedProduct.unitPrice
          }
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const validateForm = () => {
    if (!selectedWarehouse) {
      setError('Please select a warehouse')
      return false
    }
    if (!supplierName.trim()) {
      setError('Please enter supplier name')
      return false
    }
    if (items.length === 0) {
      setError('Please add at least one item')
      return false
    }
    for (const item of items) {
      if (!item.productId) {
        setError('Please select a product for all items')
        return false
      }
      if (item.quantityOrdered <= 0) {
        setError('Quantity must be greater than 0')
        return false
      }
      if (item.unitPrice <= 0) {
        setError('Unit price must be greater than 0')
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')
      
      console.log('=== CREATING PURCHASE ORDER ===')
      console.log('Warehouse ID:', selectedWarehouse)
      console.log('Supplier Name:', supplierName)
      console.log('Contact Info:', contactInfo)
      console.log('Notes:', notes)
      console.log('Items:', items)

      const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
        selectedWarehouse,
        supplierName,
        contactInfo,
        notes,
        items
      )

             toast.success('Purchase order created successfully!')
       
       // If this was created from an alert, show additional message after 1 second
       if (isFromAlert) {
         setTimeout(() => {
           toast.success('Refill order created! Will be auto-approved in 1 minute.')
         }, 1000)
       }
      
      navigate('/purchase-orders')
    } catch (error: any) {
      console.error('Failed to create purchase order:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      const errorMessage = error.response?.data?.message || 'Failed to create purchase order'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantityOrdered * item.unitPrice), 0)
  }

  if (!isAdmin) {
    return null
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
              Create Purchase Order
            </Typography>
                         <Typography variant="body1" color="text.secondary">
               {isFromAlert ? 'Refill product from low stock alert' : 'Create new purchase order'}
             </Typography>
          </Box>
        </Box>
      </Box>

             {/* Alert Info Card */}
       {isFromAlert && preSelectedProduct && (
         <Alert severity="info" sx={{ mb: 3 }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <WarningIcon />
             <Typography variant="body2">
               <strong>Low Stock Alert:</strong> {preSelectedProduct.name} needs refilling. 
               Suggested quantity: <strong>{suggestedQuantity} units</strong> to reach target of {optimalStockLevel} units.
               <br />
               <em>You can edit the quantity below if needed.</em>
             </Typography>
           </Box>
         </Alert>
       )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={loading || isFromAlert}>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={selectedWarehouse}
                    label="Warehouse"
                    onChange={(e) => handleWarehouseChange(e.target.value)}
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.warehouseId} value={warehouse.warehouseId}>
                        {warehouse.name} - {warehouse.location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Supplier Name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Information"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Items: {items.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Quantity: {items.reduce((sum, item) => sum + item.quantityOrdered, 0)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6" color="primary">
                ₹{calculateTotal().toLocaleString()}
              </Typography>
            </Box>
                         {isFromAlert && (
               <Alert severity="warning" sx={{ mt: 2 }}>
                 This refill order will be automatically approved after 1 hour
               </Alert>
             )}
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Order Items</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={loading}
              >
                Add Item
              </Button>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Items Added
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Item" to start building your purchase order
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price (₹)</TableCell>
                      <TableCell>Total (₹)</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <FormControl fullWidth disabled={loading}>
                            <Select
                              value={item.productId}
                              onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select a product
                              </MenuItem>
                              {filteredProducts.length === 0 ? (
                                <MenuItem value="" disabled>
                                  No products available for selected warehouse
                                </MenuItem>
                              ) : (
                                filteredProducts.map((product) => (
                                  <MenuItem key={product.productId} value={product.productId}>
                                    {product.name} ({product.initialStockUnit})
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantityOrdered}
                            onChange={(e) => handleItemChange(item.id, 'quantityOrdered', parseInt(e.target.value))}
                            disabled={loading}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                            disabled={loading}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ₹{(item.quantityOrdered * item.unitPrice).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                            disabled={loading}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/purchase-orders')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Create Purchase Order'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PurchaseOrderCreatePage 