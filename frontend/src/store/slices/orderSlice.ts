import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { PurchaseOrder, SalesOrder } from '@/types'
import toast from 'react-hot-toast'

interface OrderState {
  purchaseOrders: PurchaseOrder[]
  salesOrders: SalesOrder[]
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  purchaseOrders: [],
  salesOrders: [],
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('orders/fetchPurchaseOrders/pending', (state) => {
        state.loading = true
        state.error = null
      })
      .addCase('orders/fetchPurchaseOrders/fulfilled', (state, action: PayloadAction<PurchaseOrder[]>) => {
        state.loading = false
        state.purchaseOrders = action.payload
      })
      .addCase('orders/fetchPurchaseOrders/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = orderSlice.actions
export default orderSlice.reducer 