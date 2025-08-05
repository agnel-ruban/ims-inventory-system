import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Alert } from '@/types'
import toast from 'react-hot-toast'

interface AlertState {
  alerts: Alert[]
  loading: boolean
  error: string | null
}

const initialState: AlertState = {
  alerts: [],
  loading: false,
  error: null,
}

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('alerts/fetchAlerts/pending', (state) => {
        state.loading = true
        state.error = null
      })
      .addCase('alerts/fetchAlerts/fulfilled', (state, action: PayloadAction<Alert[]>) => {
        state.loading = false
        state.alerts = action.payload
      })
      .addCase('alerts/fetchAlerts/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = alertSlice.actions
export default alertSlice.reducer 