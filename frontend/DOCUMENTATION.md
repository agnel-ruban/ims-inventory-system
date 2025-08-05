# Frontend Documentation - Inventory Management System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Design](#architecture-design)
3. [Component Structure](#component-structure)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [UI/UX Design](#uiux-design)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)

## 🏗️ Project Overview

**Project**: Inventory Management System (IMS) Frontend
**Technology Stack**: React 18, TypeScript, Material-UI (MUI), Redux Toolkit, React Router, Axios
**Development Timeline**: 2 days intensive development
**AI Tools Used**: Cursor AI, GitHub Copilot, AWS Q Developer

### Core Features Implemented
- ✅ Responsive React Application with TypeScript
- ✅ Material-UI Component Library Integration
- ✅ Redux Toolkit State Management
- ✅ Role-based Authentication & Authorization
- ✅ Product Management Interface
- ✅ Order Processing Workflows
- ✅ Real-time Dashboard Analytics
- ✅ Alert Management System
- ✅ User Management Interface

## 🏛️ Architecture Design

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   React App     │    │   Spring Boot   │
│                 │◄──►│   (Frontend)    │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redux Store   │
                       │   (State Mgmt)  │
                       └─────────────────┘
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/      # API service layer
│   ├── store/         # Redux store configuration
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── assets/        # Static assets
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Public assets
├── package.json       # Dependencies and scripts
└── vite.config.ts     # Build configuration
```

### Technology Stack Decisions
- **React 18**: Latest stable version with concurrent features
- **TypeScript**: Type safety and better development experience
- **Material-UI**: Comprehensive UI component library
- **Redux Toolkit**: Simplified state management
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Vite**: Fast build tool and development server

## 🧩 Component Structure

### Layout Components
```
Layout/
└── Layout.tsx          # Main application layout with sidebar
```

### Page Components
```
pages/
├── LoginPage.tsx       # Authentication page
├── DashboardPage.tsx   # Admin dashboard
├── CustomerDashboardPage.tsx  # Customer dashboard
├── ProductsPage.tsx    # Product catalog
├── ProductCreatePage.tsx      # Product creation form
├── ProductDetailPage.tsx      # Product details modal
├── InventoryPage.tsx   # Inventory management
├── PurchaseOrdersPage.tsx     # Purchase order management
├── PurchaseOrderCreatePage.tsx # Purchase order creation
├── PurchaseOrderDetailPage.tsx # Purchase order details
├── SalesOrdersPage.tsx # Sales order management
├── SalesOrderCreatePage.tsx   # Sales order creation
├── SalesOrderDetailsPage.tsx  # Sales order details
├── AlertsPage.tsx      # Alert management
├── UserManagementPage.tsx     # User management
└── WarehousePage.tsx   # Warehouse management
```

### Common Components
```
components/
├── Common/
│   └── LoadingSpinner.tsx     # Loading indicator
├── ChangePasswordDialog.tsx   # Password change dialog
└── Layout/
    └── Layout.tsx             # Main layout component
```

### Component Hierarchy
```
App
├── Layout
│   ├── Sidebar (Navigation)
│   ├── Header (User info, logout)
│   └── Main Content Area
│       ├── DashboardPage
│       ├── ProductsPage
│       ├── InventoryPage
│       ├── PurchaseOrdersPage
│       ├── SalesOrdersPage
│       ├── AlertsPage
│       ├── UserManagementPage
│       └── WarehousePage
└── Modals/Dialogs
    ├── ProductDetailModal
    ├── ChangePasswordDialog
    └── Confirmation Dialogs
```

## 🔄 State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  products: ProductState;
  categories: CategoryState;
  inventory: InventoryState;
  orders: OrderState;
  alerts: AlertState;
  dashboard: DashboardState;
}
```

### Store Slices

#### Auth Slice
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

#### Product Slice
```typescript
interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}
```

#### Order Slice
```typescript
interface OrderState {
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  loading: boolean;
  error: string | null;
}
```

### State Management Flow
1. **User Action**: User interacts with UI component
2. **Dispatch Action**: Component dispatches Redux action
3. **Reducer Processing**: Reducer updates state based on action
4. **API Call**: Async thunk makes API request
5. **State Update**: Response updates Redux state
6. **UI Update**: Components re-render with new state

### Sample Redux Implementation
```typescript
// Slice definition
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

// Async thunk
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    const response = await productService.getProducts();
    dispatch(setProducts(response.data));
    return response.data;
  }
);
```

## 🔌 API Integration

### Service Layer Structure
```
services/
├── authService.ts      # Authentication API calls
├── productService.ts   # Product management API
├── categoryService.ts  # Category management API
├── inventoryService.ts # Inventory management API
├── purchaseOrderService.ts # Purchase order API
├── salesOrderService.ts    # Sales order API
├── alertService.ts     # Alert management API
├── userService.ts      # User management API
└── warehouseService.ts # Warehouse management API
```

### API Service Pattern
```typescript
class ProductService {
  private baseURL = '/api/products';
  
  async getProducts(): Promise<AxiosResponse<Product[]>> {
    return axios.get(this.baseURL, {
      headers: getAuthHeaders()
    });
  }
  
  async createProduct(product: CreateProductRequest): Promise<AxiosResponse<Product>> {
    return axios.post(this.baseURL, product, {
      headers: getAuthHeaders()
    });
  }
}
```

### Error Handling
```typescript
// Global error interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch(logout());
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
```

### Authentication Integration
```typescript
// Token management
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Login flow
const handleLogin = async (credentials: LoginRequest) => {
  try {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.data.token);
    dispatch(setUser(response.data.user));
    navigate('/dashboard');
  } catch (error) {
    toast.error('Login failed');
  }
};
```

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Material-UI default theme with custom colors
- **Typography**: Roboto font family with consistent hierarchy
- **Spacing**: 8px grid system for consistent spacing
- **Components**: Material-UI components with custom styling

### Responsive Design
```typescript
// Breakpoint system
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Responsive components
const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return { isMobile, isTablet, isDesktop };
};
```

### Component Styling
```typescript
// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease'
  }
}));

// Theme customization
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

### User Experience Features
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Toast notifications for errors
- **Success Feedback**: Confirmation messages
- **Form Validation**: Real-time validation with error messages
- **Responsive Navigation**: Collapsible sidebar for mobile
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing Strategy

### Testing Framework
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking for integration tests

### Test Categories
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **API Tests**: Service layer testing
4. **E2E Tests**: User workflow testing

### Sample Test Cases
```typescript
// Component test
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = mockProduct;
    render(<ProductCard product={product} />);
    
    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(`₹${product.unitPrice}`)).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const onProductClick = jest.fn();
    render(<ProductCard product={mockProduct} onProductClick={onProductClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onProductClick).toHaveBeenCalledWith(mockProduct);
  });
});

// Service test
describe('ProductService', () => {
  it('fetches products successfully', async () => {
    const mockProducts = [mockProduct];
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.json(mockProducts));
      })
    );
    
    const products = await productService.getProducts();
    expect(products).toEqual(mockProducts);
  });
});
```

### Test Coverage Goals
- **Component Coverage**: 80%+
- **Service Coverage**: 90%+
- **Utility Coverage**: 95%+
- **Overall Coverage**: 85%+

## 🚀 Deployment Guide

### Prerequisites
- Node.js 16+
- npm or yarn package manager

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
```typescript
// Environment variables
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Inventory Management System
VITE_APP_VERSION=1.0.0
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
});
```

### Production Deployment
1. **Build Application**: `npm run build`
2. **Static Hosting**: Deploy `dist/` folder to hosting service
3. **Environment Setup**: Configure production API endpoints
4. **SSL Certificate**: Enable HTTPS for security
5. **CDN Setup**: Configure content delivery network

### Deployment Platforms
- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site hosting with CI/CD
- **AWS S3**: Scalable static hosting
- **Firebase Hosting**: Google's hosting platform

### Performance Optimization
```typescript
// Code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

// Image optimization
<img 
  src={product.image} 
  loading="lazy"
  alt={product.name}
  width={300}
  height={200}
/>

// Bundle optimization
import { debounce } from 'lodash-es';
```

## 📊 Performance Metrics

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s

### Bundle Analysis
- **Main Bundle**: < 500KB
- **Vendor Bundle**: < 1MB
- **Total Bundle**: < 2MB

### Runtime Performance
- **Component Render Time**: < 16ms
- **State Updates**: < 50ms
- **API Response Time**: < 200ms

## 🔧 Development Workflow

### Code Quality Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for pre-commit checks

### Development Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript check
```

### Git Workflow
1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement features with tests
3. **Code Review**: Submit pull request for review
4. **Testing**: Automated tests run on PR
5. **Merge**: Merge to main after approval
6. **Deploy**: Automatic deployment to staging/production

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team 