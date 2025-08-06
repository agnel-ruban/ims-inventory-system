import { warehouseService } from '@/services/warehouseService'
import { RootState } from '@/store/store'
import { Warehouse } from '@/types'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const WarehousePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseProducts, setWarehouseProducts] = useState<Record<string, { hasProducts: boolean; hasProductsWithStock: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactDetails: '',
  })

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      setLoading(true)
      const fetchedWarehouses = await warehouseService.getAllWarehouses()
      setWarehouses(fetchedWarehouses)
      
      // Check which warehouses have products
      const productsMap: Record<string, { hasProducts: boolean; hasProductsWithStock: boolean }> = {}
      for (const warehouse of fetchedWarehouses) {
        try {
          const result = await warehouseService.getWarehouseWithProducts(warehouse.warehouseId)
          productsMap[warehouse.warehouseId] = {
            hasProducts: result.hasProducts,
            hasProductsWithStock: result.hasProductsWithStock
          }
        } catch (error) {
          console.error(`Failed to check products for warehouse ${warehouse.warehouseId}:`, error)
          productsMap[warehouse.warehouseId] = { hasProducts: false, hasProductsWithStock: false }
        }
      }
      setWarehouseProducts(productsMap)
    } catch (error: any) {
      console.error('Failed to load warehouses:', error)
      setError('Failed to load warehouses. Please try again.')
      toast.error('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse)
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
        contactDetails: warehouse.contactDetails,
      })
    } else {
      setEditingWarehouse(null)
      setFormData({
        name: '',
        location: '',
        contactDetails: '',
      })
    }
    setDialogOpen(true)
    setError('')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingWarehouse(null)
    setFormData({
      name: '',
      location: '',
      contactDetails: '',
    })
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Warehouse name is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.warehouseId, formData)
        toast.success('Warehouse updated successfully!')
      } else {
        await warehouseService.createWarehouse(formData)
        toast.success('Warehouse created successfully!')
      }
      
      handleCloseDialog()
      loadWarehouses()
    } catch (error: any) {
      console.error('Failed to save warehouse:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save warehouse. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    // Check if warehouse has products
    if (warehouseProducts[warehouse.warehouseId]?.hasProducts) {
      toast.error(`Cannot delete "${warehouse.name}" because it has products. Remove all products first.`)
      return
    }

    if (!window.confirm(`Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      await warehouseService.deleteWarehouse(warehouse.warehouseId)
      toast.success('Warehouse deleted successfully!')
      loadWarehouses()
    } catch (error: any) {
      console.error('Failed to delete warehouse:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete warehouse. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getLocationColor = (location: string) => {
    const locationColors: Record<string, string> = {
      'Mumbai': '#1976d2',
      'Chennai': '#dc004e',
      'Pune': '#2e7d32',
      'Delhi': '#ed6c02',
      'Bangalore': '#9c27b0',
      'Hyderabad': '#ff6f00',
      'Kolkata': '#d07cb7',
      'Ahmedabad': '#ff9700',
    }
    
    for (const [city, color] of Object.entries(locationColors)) {
      if (location.includes(city)) {
        return color
      }
    }
    return '#666666'
  }

  if (loading && warehouses.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Warehouse Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your warehouse locations and inventory distribution centers
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Warehouse Cards View */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {warehouses.map((warehouse) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={warehouse.warehouseId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarehouseIcon sx={{ color: getLocationColor(warehouse.location), mr: 1 }} />
                  <Typography variant="h6" component="h2" noWrap>
                    {warehouse.name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={<LocationIcon />}
                    label={warehouse.location}
                    size="small"
                    sx={{ mb: 1, backgroundColor: getLocationColor(warehouse.location), color: 'white' }}
                  />
                                     {warehouseProducts[warehouse.warehouseId]?.hasProducts && (
                     <Chip
                       label={warehouseProducts[warehouse.warehouseId]?.hasProductsWithStock ? "Has Stock" : "Has Products"}
                       size="small"
                       color={warehouseProducts[warehouse.warehouseId]?.hasProductsWithStock ? "success" : "warning"}
                       sx={{ ml: 1 }}
                     />
                   )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {warehouse.contactDetails}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                 <Button
                   size="small"
                   startIcon={<EditIcon />}
                   onClick={() => handleOpenDialog(warehouse)}
                   disabled={warehouseProducts[warehouse.warehouseId]?.hasProducts}
                   title={warehouseProducts[warehouse.warehouseId]?.hasProducts ? 
                     `Cannot edit: ${warehouse.name} has products` : 
                     `Edit ${warehouse.name}`}
                 >
                   Edit
                 </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteWarehouse(warehouse)}
                                     disabled={warehouseProducts[warehouse.warehouseId]?.hasProducts}
                   title={warehouseProducts[warehouse.warehouseId]?.hasProducts ? 
                     `Cannot delete: ${warehouse.name} has products` : 
                     `Delete ${warehouse.name}`}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Warehouse FAB */}
      <Fab
        color="primary"
        aria-label="add warehouse"
        onClick={() => handleOpenDialog()}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Warehouse Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWarehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Warehouse Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
              helperText="Enter the warehouse name (e.g., Mumbai Central Warehouse)"
            />
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
              helperText="Enter the location (e.g., Mumbai, Maharashtra)"
            />
            
            <TextField
              fullWidth
              label="Contact Details"
              name="contactDetails"
              value={formData.contactDetails}
              onChange={handleInputChange}
              multiline
              rows={4}
              disabled={loading}
              helperText="Enter contact information (phone, email, address)"
              placeholder="Contact: +91-22-12345678&#10;Email: mumbai@ims.com&#10;Address: Andheri East, Mumbai"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : (editingWarehouse ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default WarehousePage 