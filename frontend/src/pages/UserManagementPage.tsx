import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  PersonOff as CustomerIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { userService, CreateCustomerRequest } from '@/services/userService'
import { User } from '@/types'
import toast from 'react-hot-toast'

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState<User[]>([])

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const fetchedUsers = await userService.getAllUsers()
      setUsers(fetchedUsers)
    } catch (error: any) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
      setError('Failed to load users. Please try again.')
    } finally {
      setUsersLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validate form
    if (!formData.username || !formData.email || !formData.fullName || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const request: CreateCustomerRequest = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
      }

      const response = await userService.createCustomer(request)
      
      // Add the new user to the list
      const newUser: User = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        role: response.role as 'ADMIN' | 'CUSTOMER',
        enabled: response.enabled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setUsers([...users, newUser])
      setSuccess('Customer user created successfully!')
      toast.success('Customer user created successfully!')
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        fullName: '',
        password: '',
      })
      setOpenDialog(false)
    } catch (error: any) {
      console.error('Failed to create user:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.userId) {
      setError('You cannot delete your own account')
      toast.error('You cannot delete your own account')
      return
    }

    try {
      await userService.deleteUser(userId)
      setUsers(users.filter(user => user.userId !== userId))
      setSuccess('User deleted successfully!')
      toast.success('User deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete user:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete user'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <AdminIcon /> : <CustomerIcon />
  }

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : 'primary'
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage customer accounts for your inventory system
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Customer User
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadUsers}
          disabled={usersLoading}
        >
          Refresh Users
        </Button>
      </Box>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
                      <TableContainer>
              <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.enabled ? 'Active' : 'Inactive'}
                        color={user.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.userId)}
                        disabled={user.userId === currentUser?.userId}
                        title={user.userId === currentUser?.userId ? "Cannot delete your own account" : "Delete user"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Customer User</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  helperText="Username for login"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  helperText="User's email address"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  helperText="User's full name"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  helperText="Minimum 6 characters"
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 User Management Instructions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Create Customer Users:</strong> Click "Create Customer User" to add new customer accounts.
          <br />
          <strong>Customer Access:</strong> Customers can view products and place orders but cannot manage inventory.
          <br />
          <strong>Admin Access:</strong> Only admin users can access this user management page.
          <br />
          <strong>Security:</strong> Users can change their own passwords after logging in.
          <br />
          <strong>Database:</strong> All users are saved to the database and can be used for login.
        </Typography>
      </Box>
    </Container>
  )
}

export default UserManagementPage 