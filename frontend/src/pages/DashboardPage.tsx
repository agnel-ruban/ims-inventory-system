import React from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const quickActions = [
    {
      title: 'Products',
      description: 'Manage product catalog',
      icon: <StoreIcon />,
      path: '/products',
      color: '#1976d2',
    },
    {
      title: 'Inventory',
      description: 'View stock levels',
      icon: <InventoryIcon />,
      path: '/inventory',
      color: '#2e7d32',
    },
    {
      title: 'Purchase Orders',
      description: 'Manage supplier orders',
      icon: <ShoppingCartIcon />,
      path: '/purchase-orders',
      color: '#ed6c02',
    },
    {
      title: 'Sales Orders',
      description: 'View customer orders',
      icon: <LocalShippingIcon />,
      path: '/sales-orders',
      color: '#9c27b0',
    },
    {
      title: 'Alerts',
      description: 'Monitor system alerts',
      icon: <NotificationsIcon />,
      path: '/alerts',
      color: '#d32f2f',
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: <PeopleIcon />,
      path: '/users',
      color: '#7b1fa2',
    },
  ]

  const navigationFeatures = [
    '📊 **Dashboard**: Overview and analytics',
    '📦 **Products**: Add, edit, and manage products',
    '📋 **Inventory**: Real-time stock monitoring',
    '🛒 **Purchase Orders**: Supplier order management',
    '🚚 **Sales Orders**: Customer order tracking',
    '⚠️ **Alerts**: Low stock and system notifications',
    '👥 **User Management**: Create customer accounts',
    '🔍 **Search & Filter**: Find products quickly',
    '📱 **Responsive Design**: Works on all devices',
    '🔐 **Role-Based Access**: Admin vs Customer views',
  ]

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.fullName || user?.username}! Manage your inventory system from here.
        </Typography>
      </Box>

      {/* Quick Actions Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={action.title}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: action.color,
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {action.icon}
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(action.path)
                  }}
                >
                  Access
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Navigation Features */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Available Navigation Features
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              As an admin, you have access to all system features:
            </Typography>
            <List dense>
              {navigationFeatures.map((feature, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {index < navigationFeatures.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚀 Quick Start Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get started with these steps:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="1. Create Customer Accounts"
                  secondary="Go to User Management to create customer users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StoreIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="2. Add Products"
                  secondary="Navigate to Products to create your product catalog"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InventoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="3. Monitor Inventory"
                  secondary="Check stock levels and manage inventory"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="4. Set Up Alerts"
                  secondary="Configure low stock alerts and notifications"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🧭 Navigation Instructions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Left Sidebar Menu:</strong> Use the navigation menu on the left to access different sections.
          <br />
          <strong>Quick Actions:</strong> Click on the cards above for instant access to features.
          <br />
          <strong>Breadcrumbs:</strong> Navigate back using browser back/forward buttons.
          <br />
          <strong>Role-Based Access:</strong> Admin users can access all features, customers have limited access.
        </Typography>
      </Box>
    </Container>
  )
}

export default DashboardPage 