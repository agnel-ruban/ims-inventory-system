import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
} from '@mui/material'
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { warehouseService } from '@/services/warehouseService'
import { Category, CreateProductRequest, Warehouse } from '@/types'
import toast from 'react-hot-toast'

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [warehousesLoading, setWarehousesLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    warehouseId: '',
    brand: '',
    model: '',
    unitPrice: '',
    costPrice: '',
    initialStockUnit: '',
    minimumStockThreshold: '',
    initialStock: '',
    specifications: ''
  });

  useEffect(() => {
    loadCategories()
    loadWarehouses()
  }, [])

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const fetchedCategories = await categoryService.getAllCategories()
      setCategories(fetchedCategories)
    } catch (error: any) {
      console.error('Failed to load categories:', error)
      setError('Failed to load categories. Please try again.')
      toast.error('Failed to load categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const loadWarehouses = async () => {
    try {
      setWarehousesLoading(true)
      const fetchedWarehouses = await warehouseService.getAllWarehouses()
      setWarehouses(fetchedWarehouses)
    } catch (error: any) {
      console.error('Failed to load warehouses:', error)
      setError('Failed to load warehouses. Please try again.')
      toast.error('Failed to load warehouses')
    } finally {
      setWarehousesLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    if (error) setError('')
  }

  const handleWarehouseSelect = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required')
      return false
    }
    if (!selectedCategory) {
      setError('Please select a category')
      return false
    }
    if (!selectedWarehouse) {
      setError('Please select a warehouse')
      return false
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      setError('Unit price must be greater than 0')
      return false
    }
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      setError('Cost price must be greater than 0')
      return false
    }

    if (!formData.initialStockUnit.trim()) {
      setError('Initial Stock Unit is required')
      return false
    }
    if (!formData.minimumStockThreshold || parseInt(formData.minimumStockThreshold) < 0) {
      setError('Minimum stock threshold must be 0 or greater')
      return false
    }
    if (formData.initialStock.trim() && parseInt(formData.initialStock) < 0) {
      setError('Initial stock quantity must be 0 or greater')
      return false
    }
    return true
  }

  const parseSpecifications = (specText: string): Record<string, string> => {
    if (!specText.trim()) {
      return {}
    }
    
    const specs: Record<string, string> = {}
    const lines = specText.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        if (key && value) {
          specs[key] = value
        }
      }
    }
    
    return specs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: {
          categoryId: selectedCategory!.categoryId,
        },
        warehouseId: selectedWarehouse!.warehouseId,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        sku: formData.initialStockUnit.trim(),
        unitPrice: parseFloat(formData.unitPrice),
        costPrice: parseFloat(formData.costPrice),
        minimumStockThreshold: parseInt(formData.minimumStockThreshold),
        initialStock: formData.initialStock.trim() ? parseInt(formData.initialStock) : undefined,
        specifications: parseSpecifications(formData.specifications),
      }

      await productService.createProductWithCategory(productData)
      
      toast.success('Product created successfully!')
      navigate('/products')
    } catch (error: any) {
      console.error('Failed to create product:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create product. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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

  const getCategoryImage = (category: Category) => {
    // Special handling for all categories - use local images
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
    
    const categoryKey = category.name.toLowerCase()
    if (categoryImageMap[categoryKey]) {
      return categoryImageMap[categoryKey]
    }
    
    // First try to use the backend image
    if (category.imageBase64 && category.imageBase64.startsWith('data:image')) {
      return category.imageBase64
    }
    
    // Fallback to placeholder with category color
    const color = getCategoryColor(category.name)
    return `https://picsum.photos/300/120?random=${Math.floor(Math.random() * 1000)}`
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, category: Category) => {
    // If the image fails to load, use a fallback
    const color = getCategoryColor(category.name)
          event.currentTarget.src = `https://picsum.photos/300/120?random=${Math.floor(Math.random() * 1000)}`
  }

  if (categoriesLoading || warehousesLoading) {
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" gutterBottom>
          Create New Product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add a new product to your inventory catalog
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Category Selection */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Select Category
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a category for your product. Each category has its own color and image.
              </Typography>
              
              <Grid container spacing={2}>
                {categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={category.categoryId}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedCategory?.categoryId === category.categoryId ? 3 : 1,
                        borderColor: selectedCategory?.categoryId === category.categoryId ? 
                          getCategoryColor(category.name) : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={getCategoryImage(category)}
                        alt={category.name}
                        onError={(event) => handleImageError(event, category)}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {category.description}
                        </Typography>
                        {selectedCategory?.categoryId === category.categoryId && (
                          <Chip
                            label="Selected"
                            color="primary"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Warehouse Selection */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color="primary" />
                Select Warehouse
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a warehouse where this product will be stored.
              </Typography>
              
              <Grid container spacing={2}>
                {warehouses.map((warehouse) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={warehouse.warehouseId}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedWarehouse?.warehouseId === warehouse.warehouseId ? 3 : 1,
                        borderColor: selectedWarehouse?.warehouseId === warehouse.warehouseId ? 
                          '#4caf50' : 'divider', // Green border for selected
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleWarehouseSelect(warehouse)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {warehouse.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {warehouse.location}
                        </Typography>
                        {selectedWarehouse?.warehouseId === warehouse.warehouseId && (
                          <Chip
                            label="Selected"
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Product Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    helperText="Enter the product name"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    disabled={loading}
                    helperText="Provide a detailed description of the product"
                  />
                </Grid>
                

                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    disabled={loading}
                    helperText="Product brand name"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    disabled={loading}
                    helperText="Product model number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Initial Stock Unit"
                    name="initialStockUnit"
                    value={formData.initialStockUnit}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    helperText="Unique product identifier"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Pricing and Stock */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="primary" />
                Pricing & Stock
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Unit Price (₹)"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Selling price per unit in INR"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cost Price (₹)"
                    name="costPrice"
                    type="number"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Purchase cost per unit in INR"
                  />
                </Grid>
                

                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Minimum Stock Threshold"
                    name="minimumStockThreshold"
                    type="number"
                    value={formData.minimumStockThreshold}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        <InventoryIcon />
                      </InputAdornment>,
                    }}
                    helperText="Alert when stock falls below this number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Initial Stock Quantity"
                    name="initialStock"
                    type="number"
                    value={formData.initialStock}
                    onChange={handleInputChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        <InventoryIcon />
                      </InputAdornment>,
                    }}
                    helperText="Initial stock quantity (leave empty to use Initial Stock Unit value)"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Specifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Specifications (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter product specifications in the format: "Key: Value" (one per line)
              </Typography>
              <TextField
                fullWidth
                label="Specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                multiline
                rows={4}
                disabled={loading}
                placeholder="Color: Red&#10;Size: Large&#10;Material: Cotton&#10;Weight: 500g"
                helperText="Example: Color: Red, Size: Large, Material: Cotton"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading || !selectedCategory || !selectedWarehouse}
          >
            {loading ? 'Creating Product...' : 'Create Product'}
          </Button>
        </Box>
      </form>
    </Container>
  )
}

export default ProductCreatePage 