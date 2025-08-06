import { PurchaseOrder, SalesOrder } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
      .addCase('orders/fetchPurchaseOrders/fulfilled' as any, (state, action: PayloadAction<PurchaseOrder[]>) => {
        state.loading = false
        state.purchaseOrders = action.payload
      })
      .addCase('orders/fetchPurchaseOrders/rejected' as any, (state, action: any) => {
        state.loading = false
        state.error = (action.payload as string) ?? (action?.error?.message ?? 'Failed to fetch purchase orders')
      })
  },
})

export const { clearError } = orderSlice.actions
export default orderSlice.reducer 