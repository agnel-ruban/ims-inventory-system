import { productService } from '@/services/productService'
import { RootState } from '@/store/store'
import { Product } from '@/types'
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Visibility as VisibilityIcon
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
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  // Refresh products when page comes into focus (e.g., after order approval)
  useEffect(() => {
    const handleFocus = () => {
      loadProducts()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const fetchedProducts = await productService.getProducts()
      setProducts(fetchedProducts)
    } catch (error: any) {
      console.error('Failed to load products:', error)
      setError('Failed to load products. Please try again.')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (product: Product) => {
    const availableStock = getTotalAvailableStock(product)
    if (availableStock === 0) {
      return 'Out of Stock'
    } else if (availableStock <= (product.minimumStockThreshold || 5)) {
      return 'Low Stock'
    } else {
      return 'In Stock'
    }
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'success'
      case 'Low Stock':
        return 'warning'
      case 'Out of Stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTotalAvailableStock = (product: Product) => {
    // Calculate total available stock from inventories
    if (!product.inventories || product.inventories.length === 0) {
      return 0
    }
    return product.inventories.reduce((total, inventory) => {
      return total + (inventory.quantityAvailable || 0)
    }, 0)
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  const customerFeatures = [
    '🛍️ **Browse Products**: View all available products with detailed information',
    '📦 **Product Categories**: Explore products by category (Electronics, Clothing, etc.)',
    '💰 **Pricing Information**: See product prices and availability',
    '📋 **Order History**: Track your previous orders and their status',
    '🚚 **Order Tracking**: Monitor the status of your current orders',
    '🔍 **Search & Filter**: Find products quickly using search and filters',
    '📱 **Responsive Design**: Access from any device - desktop, tablet, or mobile',
    '🔐 **Secure Access**: Your account is protected with secure authentication',
  ]

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'View all available products',
      icon: <StoreIcon />,
      path: '/products',
      color: '#1976d2',
    },
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: <LocalShippingIcon />,
      path: '/sales-orders',
      color: '#2e7d32',
    },
    {
      title: 'Product Categories',
      description: 'Explore by category',
      icon: <CategoryIcon />,
      path: '/products',
      color: '#ed6c02',
    },
  ]

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.fullName || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your customer dashboard - browse products and manage your orders
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: action.color,
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {action.icon}
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(action.path)
                  }}
                >
                  Access
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Available Products Preview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📦 Available Products ({products.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<StoreIcon />}
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Products Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products will appear here once the admin adds them to the catalog.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {products.slice(0, 6).map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.productId}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" noWrap gutterBottom>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {product.category?.name || 'Uncategorized'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          ₹{product.unitPrice}
                        </Typography>
                        <Chip
                          label={getStockStatus(product)}
                          color={getStockColor(getStockStatus(product)) as any}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Available: {getTotalAvailableStock(product)} units
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(product)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Customer Features
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              As a customer, you have access to these features:
            </Typography>
            <List dense>
              {customerFeatures.map((feature, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {index < customerFeatures.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Customer Information */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          👤 Your Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Username:</strong> {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Full Name:</strong> {user?.fullName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Account Type:</strong> Customer
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🧭 How to Navigate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Browse Products:</strong> Click "Browse Products" to view all available products with prices and stock information.
          <br />
          <strong>My Orders:</strong> Click "My Orders" to view your order history and track current orders.
          <br />
          <strong>Product Details:</strong> Click on any product to see detailed information, specifications, and stock levels.
          <br />
          <strong>Search & Filter:</strong> Use the search and filter options in the Products page to find specific items quickly.
        </Typography>
      </Box>

      {/* Product Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedProduct && (
          <>
                         <DialogTitle sx={{ 
               bgcolor: 'primary.main', 
               color: 'white',
               textAlign: 'center'
             }}>
               <Typography variant="h6">
                 Product Details
               </Typography>
             </DialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Product Image */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={selectedProduct.category?.imageBase64 || 'https://picsum.photos/300/200?random=0'}
                      alt={selectedProduct.name}
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                                         <Chip
                       label={getStockStatus(selectedProduct)}
                       color={getStockColor(getStockStatus(selectedProduct)) as any}
                       size="medium"
                       icon={<InventoryIcon />}
                       sx={{
                         position: 'absolute',
                         top: 16,
                         right: 16,
                         bgcolor: 'rgba(255, 255, 255, 0.95)',
                         fontWeight: 'bold',
                         fontSize: '0.9rem',
                         boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                       }}
                     />
                  </Box>
                </Grid>

                {/* Product Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" gutterBottom color="primary">
                    {selectedProduct.name}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {selectedProduct.description || 'No description available'}
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PriceIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Price"
                        secondary={`₹${selectedProduct.unitPrice.toLocaleString()}`}
                        secondaryTypographyProps={{ variant: 'h6', color: 'primary' }}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                                                 primary="Model"
                         secondary={selectedProduct.model || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CategoryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Category"
                        secondary={selectedProduct.category?.name || 'N/A'}
                      />
                    </ListItem>

                                         <ListItem>
                       <ListItemIcon>
                         <InventoryIcon color="primary" />
                       </ListItemIcon>
                       <ListItemText
                         primary="Stock Status"
                         secondary={`${getTotalAvailableStock(selectedProduct)} units available`}
                         secondaryTypographyProps={{ 
                           color: getStockColor(getStockStatus(selectedProduct)) === 'success' ? 'success.main' : 'warning.main'
                         }}
                       />
                     </ListItem>

                                         <ListItem>
                       <ListItemIcon>
                         <InfoIcon color="primary" />
                       </ListItemIcon>
                       <ListItemText
                         primary="Initial Stock Unit"
                                                    secondary={selectedProduct.sku || 'N/A'}
                       />
                     </ListItem>
                   </List>

                   <Divider sx={{ my: 2 }} />

                   {/* Warehouse Information */}
                   {selectedProduct.inventories && selectedProduct.inventories.length > 0 && (
                     <>
                       <Typography variant="h6" gutterBottom>
                         Warehouse Information
                       </Typography>
                       <List dense>
                         {selectedProduct.inventories.map((inventory, index) => (
                           <ListItem key={index}>
                             <ListItemIcon>
                               <LocationIcon color="primary" />
                             </ListItemIcon>
                             <ListItemText
                               primary={inventory.warehouse?.name || 'Unknown Warehouse'}
                               secondary={`${inventory.warehouse?.location || 'Unknown Location'} - Available: ${inventory.quantityAvailable} units`}
                             />
                           </ListItem>
                         ))}
                       </List>
                       <Divider sx={{ my: 2 }} />
                     </>
                   )}

                   {/* Product Specifications */}
                   {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                     <>
                       <Typography variant="h6" gutterBottom>
                         Product Specifications
                       </Typography>
                       <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                         {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                           <Box key={key}>
                             <Typography variant="body2" color="text.secondary">
                               {key}
                             </Typography>
                             <Typography variant="body1" fontWeight="bold">
                               {value}
                             </Typography>
                           </Box>
                         ))}
                       </Box>
                       <Divider sx={{ my: 2 }} />
                     </>
                   )}
                 </Grid>
               </Grid>
             </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleCloseModal}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                                      onClick={() => navigate('/sales-orders/new', {
                        state: {
                          preSelectedProduct: selectedProduct,
                          isFromProductCard: true
                        }
                      })}
              >
                Order Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default CustomerDashboardPage 