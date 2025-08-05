import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Fab,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  Search,
  Add,
  Visibility,
  ShoppingCart,
  Inventory,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  AttachMoney as PriceIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '@/store/store'
import { fetchProducts } from '@/store/slices/productSlice'
import { fetchCategories } from '@/store/slices/categorySlice'
import LoadingSpinner from '@/components/Common/LoadingSpinner'
import { Product, Category } from '@/types'

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.products)
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories)
  const { user } = useSelector((state: RootState) => state.auth)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  // Refresh products when page comes into focus (e.g., after order approval)
  useEffect(() => {
    const handleFocus = () => {
      dispatch(fetchProducts())
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [dispatch])

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                          (product.category && product.category.name === selectedCategory)
    return matchesSearch && matchesCategory
  })

  // Use categories from Redux store if available, otherwise fallback to product categories
  const availableCategories = categories.length > 0 ? categories : 
    Array.from(new Set(products.map((p: Product) => p.category?.name).filter(Boolean)))
  
  const categoryNames = ['all', ...availableCategories.map((cat: any) => 
    typeof cat === 'string' ? cat : cat.name
  )]

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

  const getProductImage = (product: Product) => {
    // Special handling for all categories - use local images
    if (product.category) {
      const categoryImageMap: Record<string, string> = {
        'electronics': '/images/categories/electronics.png',
        'toys & games': '/images/categories/toys.png',
        'jewelry & watches': '/images/categories/jewel.png',
        'sports & fitness': '/images/categories/sports.png',
        'health & beauty': '/images/categories/health.png',
        'clothing & fashion': '/images/categories/cloth.png',
        'home & garden': '/images/categories/home.png',
        'automotive': '/images/categories/auto.png',
        'books & stationery': '/images/categories/books.png',
        'food & beverages': '/images/categories/food.png'
      }
      
      const categoryKey = product.category.name.toLowerCase()
      if (categoryImageMap[categoryKey]) {
        return categoryImageMap[categoryKey]
      }
    }
    
    // Use category image if available and valid
    if (product.category && product.category.imageBase64 && product.category.imageBase64.startsWith('data:image')) {
      return product.category.imageBase64
    }
    
    // Fallback to placeholder based on category name
    const categoryName = product.category?.name || 'Unknown'
    const imageMap: Record<string, string> = {
      'Electronics': 'https://picsum.photos/300/200?random=1',
      'Clothing & Fashion': 'https://picsum.photos/300/200?random=2',
      'Books & Stationery': 'https://picsum.photos/300/200?random=3',
      'Home & Garden': 'https://picsum.photos/300/200?random=4',
      'Sports & Fitness': 'https://picsum.photos/300/200?random=5',
      'Automotive': 'https://picsum.photos/300/200?random=6',
      'Health & Beauty': 'https://picsum.photos/300/200?random=7',
      'Toys & Games': 'https://picsum.photos/300/200?random=8',
      'Food & Beverages': 'https://picsum.photos/300/200?random=9',
      'Jewelry & Watches': 'https://picsum.photos/300/200?random=10',
    }
    return imageMap[categoryName] || 'https://picsum.photos/300/200?random=0'
  }

  const handleProductImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, product: Product) => {
    // If the image fails to load, try local images first
    if (product.category) {
      const categoryImageMap: Record<string, string> = {
        'electronics': '/images/categories/electronics.png',
        'toys & games': '/images/categories/toys.png',
        'jewelry & watches': '/images/categories/jewel.png',
        'sports & fitness': '/images/categories/sports.png',
        'health & beauty': '/images/categories/health.png',
        'clothing & fashion': '/images/categories/cloth.png',
        'home & garden': '/images/categories/home.png',
        'automotive': '/images/categories/auto.png',
        'books & stationery': '/images/categories/books.png',
        'food & beverages': '/images/categories/food.png'
      }
      
      const categoryKey = product.category.name.toLowerCase()
      if (categoryImageMap[categoryKey]) {
        event.currentTarget.src = categoryImageMap[categoryKey]
        return
      }
    }
    
    // Fallback to placeholder based on category name
    const categoryName = product.category?.name || 'Unknown'
    const imageMap: Record<string, string> = {
      'Electronics': 'https://picsum.photos/300/200?random=1',
      'Clothing & Fashion': 'https://picsum.photos/300/200?random=2',
      'Books & Stationery': 'https://picsum.photos/300/200?random=3',
      'Home & Garden': 'https://picsum.photos/300/200?random=4',
      'Sports & Fitness': 'https://picsum.photos/300/200?random=5',
      'Automotive': 'https://picsum.photos/300/200?random=6',
      'Health & Beauty': 'https://picsum.photos/300/200?random=7',
      'Toys & Games': 'https://picsum.photos/300/200?random=8',
      'Food & Beverages': 'https://picsum.photos/300/200?random=9',
      'Jewelry & Watches': 'https://picsum.photos/300/200?random=10',
    }
    event.currentTarget.src = imageMap[categoryName] || 'https://picsum.photos/300/200?random=0'
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

  const getTotalAvailableStock = (product: Product) => {
    // Calculate total available stock from inventories
    if (!product.inventories || product.inventories.length === 0) {
      return 0
    }
    return product.inventories.reduce((total, inventory) => {
      return total + (inventory.quantityAvailable || 0)
    }, 0)
  }

  const isInStock = (product: Product) => {
    return getTotalAvailableStock(product) > 0
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  if (productsLoading || categoriesLoading) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage your product catalog
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categoryNames.map((category: string) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {user?.role === 'ADMIN' && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate('/products/create')}
            sx={{ ml: 'auto' }}
          >
            <Add />
          </Fab>
        )}
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product: Product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={getProductImage(product)}
                alt={product.name}
                onError={(event) => handleProductImageError(event, product)}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {product.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {product.description || 'No description available'}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    ₹{product.unitPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Brand: {product.brand || 'N/A'}
                  </Typography>
                  {product.category && (
                    <Typography variant="body2" color="text.secondary">
                      Category: {product.category.name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getStockStatus(product)}
                    color={getStockColor(getStockStatus(product)) as any}
                    size="small"
                    icon={<Inventory />}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Available: {getTotalAvailableStock(product)} units
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(product)}
                    fullWidth
                  >
                    View Details
                  </Button>
                  {user?.role === 'CUSTOMER' && isInStock(product) && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => navigate('/sales-orders/new', {
                        state: {
                          preSelectedProduct: product,
                          isFromProductCard: true
                        }
                      })}
                    >
                      Order
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}

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
                      src={getProductImage(selectedProduct)}
                      alt={selectedProduct.name}
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(event) => handleProductImageError(event, selectedProduct)}
                    />
                                         <Chip
                       label={getStockStatus(selectedProduct)}
                       color={getStockColor(getStockStatus(selectedProduct)) as any}
                       size="medium"
                       icon={<Inventory />}
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
                        primary="Brand"
                        secondary={selectedProduct.brand || 'N/A'}
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
                        <Inventory color="primary" />
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

                   {/* Additional Details */}
                   <Typography variant="h6" gutterBottom>
                     Additional Information
                   </Typography>
                   
                   <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                           <Box>
                        <Typography variant="body2" color="text.secondary">
                          Minimum Stock Threshold
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedProduct.minimumStockThreshold || 'Not set'} units
                        </Typography>
                      </Box>
                      

                   </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleCloseModal}
              >
                Back to Products
              </Button>
                             {user?.role === 'CUSTOMER' && isInStock(selectedProduct) && (
                 <Button
                   variant="contained"
                   startIcon={<ShoppingCart />}
                   onClick={() => navigate('/sales-orders/new', {
                     state: {
                       preSelectedProduct: selectedProduct,
                       isFromProductCard: true
                     }
                   })}
                 >
                   Order Now
                 </Button>
               )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default ProductsPage 