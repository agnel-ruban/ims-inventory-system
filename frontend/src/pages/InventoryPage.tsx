import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { inventoryService } from '@/services/inventoryService'
import { Inventory, Product, Warehouse } from '@/types'
import toast from 'react-hot-toast'

const InventoryPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  // Removed edit functionality - Inventory is read-only for tracking purposes

  useEffect(() => {
    loadInventories()
  }, [])

  const loadInventories = async () => {
    try {
      setLoading(true)
      const fetchedInventories = await inventoryService.getAllInventories()
      setInventories(fetchedInventories)
    } catch (error: any) {
      console.error('Failed to load inventories:', error)
      setError('Failed to load inventory data. Please try again.')
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  // All edit/delete functions removed - Inventory is read-only for tracking purposes

  const getStockStatus = (inventory: Inventory) => {
    const totalStock = inventory.quantityAvailable || 0
    const threshold = inventory.product?.minimumStockThreshold || 10

    if (totalStock === 0) return { status: 'Out of Stock', color: 'error', icon: <ErrorIcon /> }
    if (totalStock <= threshold) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon /> }
    return { status: 'In Stock', color: 'success', icon: <CheckCircleIcon /> }
  }

  const filteredInventories = inventories.filter((inventory) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      inventory.product?.name?.toLowerCase().includes(searchLower) ||
              inventory.product?.sku?.toLowerCase().includes(searchLower) ||
      inventory.warehouse?.name?.toLowerCase().includes(searchLower) ||
      inventory.warehouse?.location?.toLowerCase().includes(searchLower)
    )
  })

  if (loading && inventories.length === 0) {
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
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor stock levels across all warehouses (read-only tracking)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by product, Initial Stock Unit, or warehouse..."
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
      </Box>

      {/* Inventory Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {inventories.length}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Stock
                  </Typography>
                  <Typography variant="h4">
                    {inventories.reduce((sum, inv) => sum + (inv.quantityAvailable || 0), 0)}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4">
                    {inventories.filter(inv => {
                      const threshold = inv.product?.minimumStockThreshold || 10
                      return (inv.quantityAvailable || 0) <= threshold && (inv.quantityAvailable || 0) > 0
                    }).length}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4">
                    {inventories.filter(inv => (inv.quantityAvailable || 0) === 0).length}
                  </Typography>
                </Box>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Initial Stock Unit</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell align="right">Available</TableCell>
                <TableCell align="right">Reserved</TableCell>
                <TableCell align="right">Damaged</TableCell>
                <TableCell align="center">Status</TableCell>
                {/* Actions column removed - Inventory is read-only for tracking purposes */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventories.map((inventory) => {
                const stockStatus = getStockStatus(inventory)
                return (
                  <TableRow key={inventory.inventoryId} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {inventory.product?.name || 'Unknown Product'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {inventory.product?.model || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {inventory.product?.sku || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={inventory.product?.category?.name || 'Uncategorized'}
                        size="small"
                        icon={<CategoryIcon />}
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {inventory.warehouse?.name || 'Unknown Warehouse'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {inventory.warehouse?.location || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {inventory.quantityAvailable || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {inventory.quantityReserved || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {inventory.quantityDamaged || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={stockStatus.icon}
                        color={stockStatus.color as any}
                        size="small"
                        sx={{ minWidth: 32, '& .MuiChip-label': { display: 'none' } }}
                      />
                    </TableCell>
                    {/* Actions removed - Inventory is read-only for tracking purposes */}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredInventories.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No inventory records found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create products first to see inventory data'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Edit dialog removed - Inventory is read-only for tracking purposes */}
    </Container>
  )
}

export default InventoryPage 