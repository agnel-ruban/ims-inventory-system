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

// Example async thunk (replace with your actual implementation)
export const fetchAlerts = createAsyncThunk<Alert[]>('alerts/fetchAlerts', async () => {
  // ... fetch logic here ...
  return []
})

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
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<Alert[]>) => {
        state.loading = false
        state.alerts = action.payload
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false
        state.error = (action.error.message as string) || 'Failed to fetch alerts'
      })
  },
})

export const { clearError } = alertSlice.actions
export default alertSlice.reducer 