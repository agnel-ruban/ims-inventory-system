# 🔐 IMS Authentication Guide

## 📋 Overview

The IMS application uses a **login-only authentication system** with pre-configured users. No registration is required - users are created automatically with default credentials.

## 👥 Default Users

### 🔧 Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `ADMIN`
- **Access:** Full system access (all features)

### 🛒 Customer Users
- **Created by:** Admin via API
- **Role:** `CUSTOMER`
- **Access:** Limited access (view products, place orders, view own orders)
- **Password:** Set by admin, can be changed by customer

## 🔄 Authentication Flow

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "admin",
    "expiresAt": "2025-07-31T21:51:42.902+05:30",
    "issuedAt": "2025-07-31T20:51:42.902+05:30",
    "expiresIn": "3600000"
}
```

### 2. Use Token
```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 3. Change Password (Optional)
```http
POST /api/auth/change-password
Authorization: Bearer <your-token>
Content-Type: application/json

{
    "currentPassword": "admin123",
    "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
    "message": "Password changed successfully. Please login again with your new password.",
    "logoutRequired": true
}
```

### 4. Token Validation
```http
POST /api/auth/validate
Authorization: Bearer <your-token>
```

## 🛡️ Security Features

### ✅ Password Requirements
- Minimum 6 characters
- Cannot be empty
- Must be different from current password

### ✅ Token Security
- JWT-based authentication
- 1-hour expiration
- **Token blacklisting** after password change
- **Immediate invalidation** of old tokens

### ✅ Role-Based Access
- **ADMIN:** Full system access
- **CUSTOMER:** Limited access (view products, place orders)

## 🚀 Production Deployment

### 📝 Pre-Deployment Checklist
1. ✅ Change admin password after first login
2. ✅ Create customer users via admin API
3. ✅ Configure proper database credentials
4. ✅ Set up HTTPS in production
5. ✅ Configure proper JWT secret key
6. ✅ Set up monitoring and logging

## 👥 User Management (Admin Only)

### ✅ Create Customer User
```http
POST /api/users/create-customer
Authorization: Bearer <admin-token>
Content-Type: application/json

{
    "username": "customer1",
    "email": "customer1@example.com",
    "password": "tempPassword123",
    "fullName": "John Customer"
}
```

### ✅ List All Users
```http
GET /api/users
Authorization: Bearer <admin-token>
```

### ✅ Reset User Password
```http
PUT /api/users/{userId}/reset-password
Authorization: Bearer <admin-token>
```

### ✅ Toggle User Status
```http
PUT /api/users/{userId}/toggle-status
Authorization: Bearer <admin-token>
```

### ✅ Delete User
```http
DELETE /api/users/{userId}
Authorization: Bearer <admin-token>
```

### 🔧 Environment Variables
```properties
# JWT Configuration
jwt.secret=your-secure-jwt-secret-key
jwt.expiration=3600000

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/ims
spring.datasource.username=your-db-user
spring.datasource.password=your-db-password
```

## 📱 Frontend Integration

### Login Form
```javascript
const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
    }
};
```

### API Calls
```javascript
const apiCall = async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};
```

### Password Change
```javascript
const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (response.ok) {
        // Clear token and redirect to login
        localStorage.clear();
        window.location.href = '/login';
    }
};
```

## ⚠️ Important Notes

1. **Default Passwords:** Change default passwords immediately after deployment
2. **Token Storage:** Store tokens securely (localStorage for demo, secure cookies for production)
3. **Password Policy:** Implement stronger password policies for production
4. **User Management:** Add admin interface for user management if needed
5. **Audit Logging:** Implement audit logs for security events

## 🆘 Troubleshooting

### Common Issues
1. **401 Unauthorized:** Check token validity and expiration
2. **403 Forbidden:** Check user role and permissions
3. **Token Expired:** Re-login to get new token
4. **Token Blacklisted:** Token invalidated due to password change - re-login required
5. **Password Change Failed:** Verify current password and new password requirements

### Support
For authentication issues, check:
1. User credentials in database
2. JWT secret configuration
3. Token expiration settings
4. Role-based access configuration 