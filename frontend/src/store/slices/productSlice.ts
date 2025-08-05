import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '@/types'
import { productService } from '@/services/productService'
import toast from 'react-hot-toast'

interface ProductState {
  products: Product[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productService.getProducts()
      return products
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch products'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id)
      return product
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch product'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: any, { rejectWithValue }) => {
    try {
      const product = await productService.createProduct(productData)
      toast.success('Product created successfully')
      return product
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create product'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }: { id: string; productData: any }, { rejectWithValue }) => {
    try {
      const product = await productService.updateProduct(id, productData)
      toast.success('Product updated successfully')
      return product
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update product'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id)
      toast.success('Product deleted successfully')
      return id
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete product'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearProducts: (state) => {
      state.products = []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // createProduct
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.products.push(action.payload)
      })
      // updateProduct
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.products.findIndex(p => p.productId === action.payload.productId)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.currentProduct?.productId === action.payload.productId) {
          state.currentProduct = action.payload
        }
      })
      // deleteProduct
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.products = state.products.filter(p => p.productId !== action.payload)
        if (state.currentProduct?.productId === action.payload) {
          state.currentProduct = null
        }
      })
  },
})

export const { clearError, clearCurrentProduct, clearProducts } = productSlice.actions
export default productSlice.reducer 