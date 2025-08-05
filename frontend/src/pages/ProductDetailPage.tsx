import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Business as BrandIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { productService } from '@/services/productService'
import { Product, Category } from '@/types'
import toast from 'react-hot-toast'

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const fetchedProduct = await productService.getProductById(productId!)
      setProduct(fetchedProduct)
    } catch (error: any) {
      console.error('Failed to load product:', error)
      setError('Failed to load product details. Please try again.')
      toast.error('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product: Product) => {
    if (product.category && product.category.imageBase64 && product.category.imageBase64.startsWith('data:image')) {
      return product.category.imageBase64
    }
    
    const categoryName = product.category?.name || 'Unknown'
    const imageMap: Record<string, string> = {
          'Electronics': 'https://picsum.photos/400/300?random=1',
    'Clothing & Fashion': 'https://picsum.photos/400/300?random=2',
    'Books & Stationery': 'https://picsum.photos/400/300?random=3',
    'Home & Garden': 'https://picsum.photos/400/300?random=4',
    'Sports & Fitness': 'https://picsum.photos/400/300?random=5',
    'Automotive': 'https://picsum.photos/400/300?random=6',
    'Health & Beauty': 'https://picsum.photos/400/300?random=7',
    'Toys & Games': 'https://picsum.photos/400/300?random=8',
    'Food & Beverages': 'https://picsum.photos/400/300?random=9',
    'Jewelry & Watches': 'https://picsum.photos/400/300?random=10',
  }
  return imageMap[categoryName] || 'https://picsum.photos/400/300?random=0'
  }

  const getStockStatus = (product: Product) => {
    const totalStock = product.inventories?.reduce((sum, inv) => sum + (inv.quantityAvailable || 0), 0) || 0
    const threshold = product.minimumStockThreshold || 0

    if (totalStock === 0) return { status: 'Out of Stock', color: 'error', icon: <ErrorIcon /> }
    if (totalStock <= threshold) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon /> }
    return { status: 'In Stock', color: 'success', icon: <CheckCircleIcon /> }
  }

  const getTotalAvailableStock = (product: Product) => {
    return product.inventories?.reduce((sum, inv) => sum + (inv.quantityAvailable || 0), 0) || 0
  }

  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      'Electronics': '#1976d2',
      'Clothing & Fashion': '#dc004e',
      'Books & Stationery': '#2e7d32',
      'Home & Garden': '#ed6c02',
      'Sports & Fitness': '#9c27b0',
      'Automotive': '#ff6f00',
      'Health & Beauty': '#d07cb7',
      'Toys & Games': '#ff9700',
      'Food & Beverages': '#8bc34a',
      'Jewelry & Watches': '#ffc107',
    }
    return colorMap[categoryName] || '#666666'
  }

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mb: 2 }}
          >
            Back to Products
          </Button>
        </Box>
        <Alert severity="error">
          {error || 'Product not found'}
        </Alert>
      </Container>
    )
  }

  const stockStatus = getStockStatus(product)
  const totalStock = getTotalAvailableStock(product)

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" gutterBottom>
          Product Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Product Image */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={getProductImage(product)}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {/* Product Information */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              <Chip
                icon={stockStatus.icon}
                label={stockStatus.status}
                color={stockStatus.color as any}
                size="medium"
              />
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Category"
                  secondary={
                    <Chip
                      label={product.category?.name || 'Uncategorized'}
                      size="small"
                      sx={{ backgroundColor: getCategoryColor(product.category?.name || ''), color: 'white' }}
                    />
                  }
                />
              </ListItem>

              {product.brand && (
                <ListItem>
                  <ListItemIcon>
                    <BrandIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Brand" secondary={product.brand} />
                </ListItem>
              )}

              {product.model && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Model" secondary={product.model} />
                </ListItem>
              )}

              <ListItem>
                <ListItemIcon>
                  <InventoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Stock"
                  secondary={`${totalStock} units`}
                />
              </ListItem>

                             <ListItem>
                 <ListItemIcon>
                   <MoneyIcon color="primary" />
                 </ListItemIcon>
                 <ListItemText
                   primary="Unit Price"
                   secondary={`₹${product.unitPrice?.toFixed(2) || '0.00'}`}
                 />
               </ListItem>



              {product.initialStockUnit && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Initial Stock Unit" secondary={product.initialStockUnit} />
                </ListItem>
              )}
            </List>

            {product.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
              </Box>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" />
                  Specifications
                </Typography>
                <Box>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>{key}:</strong> {value}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Stock Threshold Alert */}
        {product.minimumStockThreshold && totalStock <= product.minimumStockThreshold && (
          <Grid item xs={12}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="h6" gutterBottom>
                Low Stock Alert
              </Typography>
              <Typography variant="body2">
                Current stock ({totalStock} units) is at or below the minimum threshold ({product.minimumStockThreshold} units).
                Consider placing a purchase order to replenish inventory.
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Warehouse Inventory Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              Warehouse Inventory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Stock levels across different warehouse locations
            </Typography>

            {product.inventories && product.inventories.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Warehouse</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.inventories.map((inventory) => (
                      <TableRow key={inventory.inventoryId}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {inventory.warehouse?.name || 'Unknown Warehouse'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {inventory.warehouse?.location || 'Unknown Location'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            {inventory.quantityAvailable || 0} units
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={inventory.quantityAvailable && inventory.quantityAvailable > 0 ? 'Available' : 'Out of Stock'}
                            color={inventory.quantityAvailable && inventory.quantityAvailable > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No inventory records found for this product.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Product Metadata */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Product ID
                </Typography>
                <Typography variant="body1">
                  {product.productId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(product.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Minimum Threshold
                </Typography>
                <Typography variant="body1">
                  {product.minimumStockThreshold || 0} units
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ProductDetailPage 