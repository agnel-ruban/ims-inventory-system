import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Inventory } from '@/types'
import toast from 'react-hot-toast'

interface InventoryState {
  inventory: Inventory[]
  loading: boolean
  error: string | null
}

const initialState: InventoryState = {
  inventory: [],
  loading: false,
  error: null,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('inventory/fetchInventory/pending', (state) => {
        state.loading = true
        state.error = null
      })
      .addCase('inventory/fetchInventory/fulfilled' as any, (state, action: PayloadAction<Inventory[]>) => {
          state.loading = false
          state.inventory = action.payload
        }
      )
      .addCase('inventory/fetchInventory/rejected' as any, (state, action: any) => {
        state.loading = false
        state.error =
          (action.payload as string) ??
          (action?.error?.message ?? 'Failed to fetch inventory')
      })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer 