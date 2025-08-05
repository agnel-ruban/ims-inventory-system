import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { DashboardOverview } from '@/types'
import toast from 'react-hot-toast'

interface DashboardState {
  overview: DashboardOverview | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
}

// Example async thunk (replace with your actual implementation)
export const fetchOverview = createAsyncThunk<DashboardOverview>('dashboard/fetchOverview', async () => {
  // ... fetch logic here ...
  return {} as DashboardOverview
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOverview.fulfilled, (state, action: PayloadAction<DashboardOverview>) => {
        state.loading = false
        state.overview = action.payload
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false
        state.error = (action.error.message as string) || 'Failed to fetch overview'
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer 