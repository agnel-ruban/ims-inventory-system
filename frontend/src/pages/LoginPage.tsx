import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '@/store/store'
import { login, clearError } from '@/store/slices/authSlice'

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle successful login redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/dashboard')
      } else {
        navigate('/customer-dashboard')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, rgba(255, 219, 120, 0.3) 0%, transparent 50%)
          `,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)
          `,
          backgroundSize: '60px 60px',
          animation: 'shimmer 3s ease-in-out infinite',
          zIndex: 1,
        },
        '@keyframes shimmer': {
          '0%, 100%': {
            opacity: 0.3,
          },
          '50%': {
            opacity: 0.6,
          },
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(180deg)',
          },
        },
      }}
    >
      {/* Floating geometric shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          borderRadius: '20px',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '20%',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          borderRadius: '30px',
          animation: 'float 7s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          right: '10%',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          borderRadius: '50%',
          animation: 'float 9s ease-in-out infinite reverse',
          zIndex: 1,
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
                                           <Paper
              elevation={24}
              sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '25px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 35px 65px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  borderRadius: '25px 25px 0 0',
                  zIndex: 1,
                },
              }}
            >
                     <Box
             sx={{
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
               borderRadius: '50%',
               width: 70,
               height: 70,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               mb: 3,
               boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
               position: 'relative',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: '-2px',
                 left: '-2px',
                 right: '-2px',
                 bottom: '-2px',
                 background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)',
                 borderRadius: '50%',
                 zIndex: -1,
                 animation: 'rotate 3s linear infinite',
               },
               '@keyframes rotate': {
                 '0%': {
                   transform: 'rotate(0deg)',
                 },
                 '100%': {
                   transform: 'rotate(360deg)',
                 },
               },
             }}
           >
             <LockOutlined sx={{ color: 'white', fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
           </Box>
          
                     <Typography 
             component="h1" 
             variant="h4" 
             gutterBottom
             sx={{
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
               backgroundClip: 'text',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               fontWeight: 'bold',
               textShadow: '0 2px 4px rgba(0,0,0,0.1)',
               mb: 1,
             }}
           >
             IMS Login
           </Typography>
           
           <Typography 
             variant="body2" 
             align="center" 
             sx={{ 
               mb: 3,
               color: 'rgba(0, 0, 0, 0.7)',
               fontWeight: 500,
               letterSpacing: '0.5px',
             }}
           >
             Inventory Management System
           </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

                     <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                           <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #667eea',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'rgba(0, 0, 0, 0.9)',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.7)',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#667eea',
                      fontWeight: 600,
                    },
                  },
                }}
              />
                           <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #667eea',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'rgba(0, 0, 0, 0.9)',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.7)',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#667eea',
                      fontWeight: 600,
                    },
                  },
                }}
              />
                         <Button
               type="submit"
               fullWidth
               variant="contained"
               sx={{ 
                 mt: 3, 
                 mb: 2,
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                 borderRadius: '12px',
                 height: '48px',
                 fontSize: '16px',
                 fontWeight: 'bold',
                 textTransform: 'none',
                 boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                 transition: 'all 0.3s ease',
                 position: 'relative',
                 overflow: 'hidden',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #e085e8 100%)',
                   boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                   transform: 'translateY(-2px)',
                 },
                 '&:active': {
                   transform: 'translateY(0px)',
                 },
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   top: 0,
                   left: '-100%',
                   width: '100%',
                   height: '100%',
                   background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                   transition: 'left 0.5s',
                 },
                 '&:hover::before': {
                   left: '100%',
                 },
               }}
               disabled={loading}
             >
               {loading ? 'Signing In...' : 'Sign In'}
             </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
    </Box>
  )
}

export default LoginPage 