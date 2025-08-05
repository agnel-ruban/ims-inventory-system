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
      .addCase('dashboard/fetchOverview/pending', (state) => {
        state.loading = true
        state.error = null
      })
      .addCase('dashboard/fetchOverview/fulfilled', (state, action: PayloadAction<DashboardOverview>) => {
        state.loading = false
        state.overview = action.payload
      })
      .addCase('dashboard/fetchOverview/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer 