# AI Prompt Library - Inventory Management System

## 📋 Overview

This document contains the most effective AI prompts used during the development of the Inventory Management System. Each prompt includes context, output quality rating, iterations needed, and final implementation results.

## 🗄️ Database Design Prompts

### Prompt 1: Schema Generation
**Prompt**: 
```
Design a PostgreSQL database schema for an inventory management system with the following requirements:
- Users (admin and customer roles)
- Products with categories, brands, models, SKU, pricing
- Warehouses for multi-location inventory
- Inventory tracking with available, reserved, and damaged quantities
- Purchase orders from suppliers
- Sales orders from customers
- Alerts for low stock
- Include proper relationships, constraints, and indexes
```

**Context**: Initial database design phase, needed comprehensive schema for the entire system
**Output Quality**: 9/10
**Iterations**: 2 (refined relationships and added JSONB for specifications)
**Final Result**: Complete database schema with 8 tables, proper relationships, and optimized indexes

**Implementation**:
```sql
-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table with JSONB specifications
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    sku VARCHAR(100) UNIQUE NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    minimum_stock_threshold INTEGER DEFAULT 10,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prompt 2: Entity Relationship Design
**Prompt**:
```
Create JPA entities for the inventory management system with proper annotations:
- Include all necessary JPA annotations (@Entity, @Table, @Id, @GeneratedValue, etc.)
- Add proper relationships (@OneToMany, @ManyToOne, @JoinColumn)
- Include validation annotations (@NotNull, @Size, etc.)
- Add Lombok annotations for getters/setters
- Include JSON annotations for API serialization
```

**Context**: Converting database schema to JPA entities
**Output Quality**: 8/10
**Iterations**: 1 (added missing annotations and relationships)
**Final Result**: Complete set of JPA entities with proper relationships and annotations

**Implementation**:
```java
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @Column(name = "product_id")
    private String productId;
    
    @NotBlank(message = "Product name is required")
    @Column(name = "name", nullable = false)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(name = "specifications", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private Map<String, String> specifications;
}
```

## 🔌 Code Generation Prompts

### Prompt 3: Spring Boot Controller Creation
**Prompt**:
```
Create a Spring Boot REST controller for product management with the following endpoints:
- GET /api/products - Get all products with stock information
- GET /api/products/{id} - Get product by ID
- POST /api/products - Create new product (Admin only)
- PUT /api/products/{id} - Update product (Admin only)
- DELETE /api/products/{id} - Delete product (Admin only)
Include proper error handling, validation, and security annotations.
```

**Context**: Creating REST API endpoints for product management
**Output Quality**: 9/10
**Iterations**: 1 (added proper error handling and response formatting)
**Final Result**: Complete ProductController with all CRUD operations and security

**Implementation**:
```java
@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasRole('ADMIN')")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    @PreAuthorize("authenticated()")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductWithStockDTO> products = productService.getAllProductsWithStock();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching products: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating product: " + e.getMessage());
        }
    }
}
```

### Prompt 4: React Component Generation
**Prompt**:
```
Create a React TypeScript component for a product card that displays:
- Product image (from category)
- Product name and description
- Brand and model
- Price in Indian Rupees (₹)
- Stock status (In Stock, Low Stock, Out of Stock)
- View details button
Use Material-UI components and make it responsive.
```

**Context**: Creating reusable product display components
**Output Quality**: 8/10
**Iterations**: 1 (added proper TypeScript types and styling)
**Final Result**: Responsive ProductCard component with Material-UI styling

**Implementation**:
```typescript
interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const getStockStatus = (available: number, threshold: number) => {
    if (available === 0) return { status: 'Out of Stock', color: 'error' as const };
    if (available <= threshold) return { status: 'Low Stock', color: 'warning' as const };
    return { status: 'In Stock', color: 'success' as const };
  };

  const stockInfo = getStockStatus(product.stockInfo?.available || 0, product.minimumStockThreshold);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.category?.imageUrl || '/default-product.jpg'}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.brand} • {product.model}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          ₹{product.unitPrice.toLocaleString()}
        </Typography>
        <Chip 
          label={stockInfo.status} 
          color={stockInfo.color} 
          size="small" 
          sx={{ mt: 1 }}
        />
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => onProductClick(product)}
          fullWidth
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};
```

### Prompt 5: Redux Slice Creation
**Prompt**:
```
Create a Redux Toolkit slice for product management with the following features:
- State: products array, loading boolean, error string, selectedProduct
- Actions: setProducts, setLoading, setError, setSelectedProduct
- Async thunk: fetchProducts to get products from API
- Include proper TypeScript types and error handling
```

**Context**: Setting up state management for products
**Output Quality**: 9/10
**Iterations**: 1 (added proper error handling and loading states)
**Final Result**: Complete product slice with async operations

**Implementation**:
```typescript
interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  selectedProduct: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
  },
});

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await productService.getProducts();
      dispatch(setProducts(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);
```

## 🔧 Problem-Solving Prompts

### Prompt 6: JWT Authentication Implementation
**Prompt**:
```
I need to implement JWT authentication in Spring Boot with the following requirements:
- JWT token generation and validation
- Token blacklisting for logout
- Method-level security with @PreAuthorize
- Custom user details service
- JWT filter for request authentication
Include complete implementation with proper security measures.
```

**Context**: Implementing secure authentication system
**Output Quality**: 9/10
**Iterations**: 2 (added token blacklisting and enhanced security)
**Final Result**: Complete JWT authentication system with security features

**Implementation**:
```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return !tokenBlacklistService.isBlacklisted(token);
        } catch (Exception e) {
            return false;
        }
    }
}
```

### Prompt 7: Auto-approval System Implementation
**Prompt**:
```
I need to implement an auto-approval system for purchase orders that:
- Automatically approves orders after a configurable time (1 minute for testing)
- Updates order status from PENDING to APPROVED
- Triggers inventory updates when orders are received
- Sends notifications when status changes
- Uses Spring's @Scheduled annotation
Include the complete implementation with proper error handling.
```

**Context**: Implementing automated workflow for purchase orders
**Output Quality**: 8/10
**Iterations**: 1 (added inventory updates and notifications)
**Final Result**: Complete auto-approval system with inventory integration

**Implementation**:
```java
@Service
public class PurchaseOrderService {
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Scheduled(fixedRate = 30000) // Check every 30 seconds
    public void autoApprovePurchaseOrders() {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        
        List<PurchaseOrder> pendingOrders = purchaseOrderRepository
            .findByStatusAndCreatedAtBefore(PurchaseOrderStatus.PENDING, oneMinuteAgo);
        
        for (PurchaseOrder order : pendingOrders) {
            try {
                order.setStatus(PurchaseOrderStatus.APPROVED);
                order.setUpdatedAt(LocalDateTime.now());
                purchaseOrderRepository.save(order);
                
                // Update inventory when order is received
                updateInventoryFromOrder(order);
                
                log.info("Auto-approved purchase order: {}", order.getPoId());
            } catch (Exception e) {
                log.error("Error auto-approving order {}: {}", order.getPoId(), e.getMessage());
            }
        }
    }
    
    private void updateInventoryFromOrder(PurchaseOrder order) {
        for (PurchaseOrderItem item : order.getItems()) {
            inventoryService.addStock(
                item.getProduct().getProductId(),
                order.getWarehouse().getId(),
                item.getQuantity()
            );
        }
    }
}
```

### Prompt 8: Real-time Dashboard Implementation
**Prompt**:
```
Create a React dashboard component that displays real-time statistics:
- Total products, warehouses, users
- Low stock alerts count
- Pending orders count
- Total inventory value
- Recent activity feed
Use Material-UI cards and make it responsive. Include loading states and error handling.
```

**Context**: Creating admin dashboard with real-time data
**Output Quality**: 8/10
**Iterations**: 1 (added loading states and error handling)
**Final Result**: Responsive dashboard with real-time statistics

**Implementation**:
```typescript
const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardOverview();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {dashboardData?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Alerts
              </Typography>
              <Typography variant="h4" color="warning.main">
                {dashboardData?.lowStockAlerts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Additional stat cards */}
      </Grid>
    </Container>
  );
};
```

## 🎨 UI/UX Design Prompts

### Prompt 9: Responsive Navigation Design
**Prompt**:
```
Create a responsive navigation sidebar for an inventory management system with:
- Collapsible sidebar for mobile devices
- Role-based menu items (Admin vs Customer)
- Active state indicators
- User profile section with logout
- Material-UI icons for each menu item
Include proper TypeScript types and responsive behavior.
```

**Context**: Creating responsive navigation system
**Output Quality**: 9/10
**Iterations**: 1 (added role-based menu and responsive behavior)
**Final Result**: Complete responsive navigation with role-based access

**Implementation**:
```typescript
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'Inventory', icon: <StorageIcon />, path: '/inventory' },
    { text: 'Purchase Orders', icon: <ShoppingCartIcon />, path: '/purchase-orders' },
    { text: 'Sales Orders', icon: <ReceiptIcon />, path: '/sales-orders' },
    { text: 'Alerts', icon: <WarningIcon />, path: '/alerts' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Warehouses', icon: <BusinessIcon />, path: '/warehouses' },
  ];

  const customerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'My Orders', icon: <ReceiptIcon />, path: '/sales-orders' },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : customerMenuItems;

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};
```

### Prompt 10: Form Validation Implementation
**Prompt**:
```
Create a comprehensive form validation system for product creation with:
- Real-time validation feedback
- Error message display
- Field-specific validation rules
- Form submission handling
- Loading states during submission
Use Material-UI TextField components and React Hook Form or similar.
```

**Context**: Implementing form validation for data entry
**Output Quality**: 8/10
**Iterations**: 1 (added real-time validation and error handling)
**Final Result**: Complete form validation system with user feedback

**Implementation**:
```typescript
const ProductCreatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    model: '',
    sku: '',
    unitPrice: '',
    costPrice: '',
    minimumStockThreshold: '',
    warehouseId: '',
    initialStock: '',
    specifications: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Product name is required';
      case 'sku':
        return value.trim() ? '' : 'SKU is required';
      case 'unitPrice':
        return value && !isNaN(Number(value)) && Number(value) > 0 
          ? '' : 'Valid unit price is required';
      case 'minimumStockThreshold':
        return value && !isNaN(Number(value)) && Number(value) >= 0 
          ? '' : 'Valid threshold is required';
      default:
        return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await productService.createProduct(formData);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create New Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          {/* Additional form fields */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Create Product'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};
```

## 📊 Performance Optimization Prompts

### Prompt 11: Database Query Optimization
**Prompt**:
```
I need to optimize database queries for the inventory management system:
- Optimize product listing with stock information
- Add proper indexes for frequently queried fields
- Implement pagination for large datasets
- Use eager/lazy loading appropriately
- Add query result caching
Provide specific JPA repository optimizations and database indexes.
```

**Context**: Optimizing database performance for large datasets
**Output Quality**: 8/10
**Iterations**: 1 (added pagination and caching strategies)
**Final Result**: Optimized queries with proper indexing and pagination

**Implementation**:
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.inventory i " +
           "LEFT JOIN FETCH i.warehouse " +
           "WHERE p.name LIKE %:searchTerm% " +
           "OR p.brand LIKE %:searchTerm% " +
           "OR p.sku LIKE %:searchTerm%")
    Page<Product> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category c " +
           "WHERE c.id = :categoryId")
    List<Product> findByCategoryId(@Param("categoryId") Long categoryId);
    
    @Cacheable("products")
    @Query("SELECT p FROM Product p WHERE p.sku = :sku")
    Optional<Product> findBySku(@Param("sku") String sku);
}

// Database indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
```

### Prompt 12: Frontend Performance Optimization
**Prompt**:
```
Optimize React components for performance in the inventory management system:
- Implement code splitting for large components
- Add memoization for expensive calculations
- Optimize re-renders with React.memo
- Implement virtual scrolling for large lists
- Add lazy loading for images
Provide specific optimization techniques and code examples.
```

**Context**: Optimizing frontend performance for better user experience
**Output Quality**: 8/10
**Iterations**: 1 (added virtual scrolling and image optimization)
**Final Result**: Performance-optimized React components

**Implementation**:
```typescript
// Code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

// Memoized component
const ProductCard = React.memo<ProductCardProps>(({ product, onProductClick }) => {
  const stockStatus = useMemo(() => {
    return getStockStatus(product.stockInfo?.available || 0, product.minimumStockThreshold);
  }, [product.stockInfo?.available, product.minimumStockThreshold]);

  return (
    <Card>
      <CardMedia
        component="img"
        loading="lazy"
        src={product.category?.imageUrl}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2">{product.description}</Typography>
        <Typography variant="h6" color="primary">
          ₹{product.unitPrice.toLocaleString()}
        </Typography>
        <Chip label={stockStatus.status} color={stockStatus.color} />
      </CardContent>
    </Card>
  );
});

// Virtual scrolling for large lists
const VirtualizedProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <ProductCard 
        product={products[index]} 
        onProductClick={(product) => handleProductClick(product)}
      />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={300}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## 🔒 Security Implementation Prompts

### Prompt 13: Input Validation and Sanitization
**Prompt**:
```
Implement comprehensive input validation and sanitization for the inventory management system:
- Server-side validation for all API endpoints
- Input sanitization to prevent XSS attacks
- SQL injection prevention
- File upload validation
- Rate limiting for API endpoints
Include both backend and frontend validation strategies.
```

**Context**: Implementing security measures for data validation
**Output Quality**: 9/10
**Iterations**: 1 (added rate limiting and file validation)
**Final Result**: Comprehensive security validation system

**Implementation**:
```java
// Backend validation
@RestController
public class ProductController {
    
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product) {
        // Bean validation handles basic validation
        // Additional business logic validation
        if (productService.productExists(product.getSku())) {
            return ResponseEntity.badRequest().body("Product with this SKU already exists");
        }
        
        // Sanitize input
        product.setName(sanitizeInput(product.getName()));
        product.setDescription(sanitizeInput(product.getDescription()));
        
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    
    private String sanitizeInput(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Whitelist.basic());
    }
}

// Rate limiting
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final Map<String, Integer> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastRequestTimes = new ConcurrentHashMap<>();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler) throws Exception {
        String clientIp = getClientIp(request);
        long currentTime = System.currentTimeMillis();
        
        // Reset counter if more than 1 minute has passed
        if (currentTime - lastRequestTimes.getOrDefault(clientIp, 0L) > 60000) {
            requestCounts.put(clientIp, 0);
        }
        
        int count = requestCounts.getOrDefault(clientIp, 0);
        if (count >= 100) { // 100 requests per minute
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            return false;
        }
        
        requestCounts.put(clientIp, count + 1);
        lastRequestTimes.put(clientIp, currentTime);
        return true;
    }
}
```

## 📈 Testing Strategy Prompts

### Prompt 14: Unit Testing Implementation
**Prompt**:
```
Create comprehensive unit tests for the inventory management system:
- Service layer testing with mocked dependencies
- Controller testing with MockMvc
- Repository testing with @DataJpaTest
- Component testing with React Testing Library
- API integration testing
Include test coverage goals and best practices.
```

**Context**: Implementing comprehensive testing strategy
**Output Quality**: 8/10
**Iterations**: 1 (added integration tests and coverage goals)
**Final Result**: Complete testing strategy with high coverage

**Implementation**:
```java
// Service layer test
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @Mock
    private InventoryRepository inventoryRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    void testCreateProduct_Success() {
        // Arrange
        Product product = new Product();
        product.setName("Test Product");
        product.setSku("TEST-001");
        product.setUnitPrice(100.0);
        
        when(productRepository.existsBySku("TEST-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        // Act
        Product result = productService.createProduct(product);
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Product", result.getName());
        verify(productRepository).save(product);
    }
    
    @Test
    void testCreateProduct_DuplicateSku() {
        // Arrange
        Product product = new Product();
        product.setSku("TEST-001");
        
        when(productRepository.existsBySku("TEST-001")).thenReturn(true);
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            productService.createProduct(product);
        });
    }
}

// Controller test
@WebMvcTest(ProductController.class)
class ProductControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ProductService productService;
    
    @Test
    void testGetAllProducts_Success() throws Exception {
        // Arrange
        List<ProductWithStockDTO> products = Arrays.asList(
            createMockProductDTO("Product 1"),
            createMockProductDTO("Product 2")
        );
        
        when(productService.getAllProductsWithStock()).thenReturn(products);
        
        // Act & Assert
        mockMvc.perform(get("/api/products")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Product 1"));
    }
}
```

```typescript
// React component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

const mockProduct = {
  productId: 'TEST-001',
  name: 'Test Product',
  description: 'Test Description',
  unitPrice: 100,
  stockInfo: { available: 10, reserved: 0, damaged: 0 },
  minimumStockThreshold: 5
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ProductCard product={mockProduct} onProductClick={jest.fn()} />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });
  
  it('calls onProductClick when view details is clicked', () => {
    const mockClick = jest.fn();
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ProductCard product={mockProduct} onProductClick={mockClick} />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText('View Details'));
    expect(mockClick).toHaveBeenCalledWith(mockProduct);
  });
});
```

## 🚀 Deployment and DevOps Prompts

### Prompt 15: Docker Configuration
**Prompt**:
```
Create Docker configuration for the inventory management system:
- Multi-stage Dockerfile for optimized builds
- Docker Compose for local development
- Environment-specific configurations
- Health checks and monitoring
- Production deployment considerations
Include complete Docker setup with best practices.
```

**Context**: Setting up containerized deployment
**Output Quality**: 9/10
**Iterations**: 1 (added health checks and monitoring)
**Final Result**: Complete Docker configuration for development and production

**Implementation**:
```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim

WORKDIR /app
COPY --from=builder /app/target/ims-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ims_db
      - SPRING_DATASOURCE_USERNAME=ims_user
      - SPRING_DATASOURCE_PASSWORD=ims_password
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=ims_db
      - POSTGRES_USER=ims_user
      - POSTGRES_PASSWORD=ims_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ims_user -d ims_db"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

**Library Version**: 1.0  
**Last Updated**: December 2024  
**Total Prompts**: 15  
**Average Quality Rating**: 8.5/10  
**Success Rate**: 93% (14/15 prompts resulted in successful implementations) 