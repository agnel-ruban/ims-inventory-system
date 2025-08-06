import profileAvatar from '@/assets/profile-avatar.png'
import { alertService } from '@/services/alertService'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store/store'
import {
  Dashboard,
  Inventory,
  LocalShipping,
  Lock as LockIcon,
  Logout,
  Menu as MenuIcon,
  Notifications,
  People,
  ShoppingCart,
  Store,
  Warehouse as WarehouseIcon
} from '@mui/icons-material'
import {
  AppBar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import ChangePasswordDialog from '../ChangePasswordDialog'

const drawerWidth = 240

const Layout: React.FC = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout() as any)
    navigate('/login')
  }

  const handleChangePassword = () => {
    handleProfileMenuClose()
    setChangePasswordOpen(true)
  }

  const handlePasswordChangeSuccess = () => {
    // Password changed successfully, logout user
    dispatch(logout() as any)
    navigate('/login')
  }

  // Load alert count for admin users
  useEffect(() => {
    const loadAlertCount = async () => {
      if (user?.role === 'ADMIN') {
        try {
          const count = await alertService.getLowStockAlertsCount()
          setAlertCount(count)
        } catch (error) {
          console.error('Failed to load alert count:', error)
        }
      }
    }

    loadAlertCount()
    // Refresh alert count every 30 seconds
    const interval = setInterval(loadAlertCount, 30000)
    return () => clearInterval(interval)
  }, [user?.role])

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['ADMIN'],
    },
    {
      text: 'Dashboard',
      icon: <Store />,
      path: '/customer-dashboard',
      roles: ['CUSTOMER'],
    },
    {
      text: 'Browse Products',
      icon: <Inventory />,
      path: '/products',
      roles: ['CUSTOMER'],
    },
    {
      text: 'Products',
      icon: <Inventory />,
      path: '/products',
      roles: ['ADMIN'],
    },
    {
      text: 'Inventory',
      icon: <Inventory />,
      path: '/inventory',
      roles: ['ADMIN'],
    },
    {
      text: 'Purchase Orders',
      icon: <ShoppingCart />,
      path: '/purchase-orders',
      roles: ['ADMIN'],
    },
    {
      text: 'Purchase Products',
      icon: <LocalShipping />,
      path: '/sales-orders',
      roles: ['CUSTOMER'],
    },
    {
              text: 'Customer Purchased Orders',
      icon: <LocalShipping />,
      path: '/sales-orders',
      roles: ['ADMIN'],
    },
    {
      text: 'Alerts',
      icon: (
        <Badge badgeContent={alertCount} color="error">
          <Notifications />
        </Badge>
      ),
      path: '/alerts',
      roles: ['ADMIN'],
    },
    {
      text: 'User Management',
      icon: <People />,
      path: '/users',
      roles: ['ADMIN'],
    },
    {
      text: 'Warehouse Management',
      icon: <WarehouseIcon />,
      path: '/warehouses',
      roles: ['ADMIN'],
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  )

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          IMS System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundImage: `url(${profileAvatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer'
              }}
            />
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem>
              <Typography variant="body2">
                {user?.fullName} ({user?.role})
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleChangePassword}>
              <ListItemIcon>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              Change Password
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </Box>
  )
}

export default Layout 