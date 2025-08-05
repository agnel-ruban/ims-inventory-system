import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Category } from '@/types'
import { categoryService } from '@/services/categoryService'
import toast from 'react-hot-toast'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getAllCategories()
      return categories
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch categories'
      // Remove toast error for better UX - let the component handle it
      return rejectWithValue(message)
    }
  }
)

export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getAllCategories()
      return categories
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch all categories'
      // Remove toast error for better UX - let the component handle it
      return rejectWithValue(message)
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCategories: (state) => {
      state.categories = []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
        state.error = null
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchAllCategories
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
        state.error = null
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCategories } = categorySlice.actions
export default categorySlice.reducer 