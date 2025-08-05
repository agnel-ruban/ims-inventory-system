# 🏪 Inventory Management System (IMS)

A comprehensive full-stack application for managing inventory, products, orders, and users with role-based access control. This system is designed to help businesses efficiently manage their inventory, track products, handle customer orders, and maintain stock levels across multiple warehouses.

## 📋 Project Overview

This IMS application consists of:
- **Backend**: Spring Boot REST API with PostgreSQL database
- **Frontend**: React TypeScript application with Material-UI interface

## 🎯 Application Flow - Complete User Guide

### 👨‍💼 **ADMIN VIEW - Complete Workflow**

The admin is the system administrator who has full control over the entire inventory management system. Here's the complete admin workflow:

#### **1. Initial Setup & Login**
- **Default Admin Credentials**: Username: `admin`, Password: `Agnel@70050` (configurable in application.properties)
- **First Login**: Admin logs in and sees the main dashboard with system overview
- **Password Management**: Admin can change their password anytime through the system

#### **2. User Management**
- **Create Customer Accounts**: Admin can create new customer accounts for people who want to purchase products
- **Customer Details**: For each customer, admin sets:
  - Username and password
  - Full name and email
  - Account status (enabled/disabled)
- **Password Reset**: Admin can reset customer passwords if needed
- **View All Users**: See list of all registered users in the system

#### **3. Warehouse Management**
- **Create Warehouses**: Set up different storage locations
- **Warehouse Details**: For each warehouse, specify:
  - Warehouse name (e.g., "Chennai Distribution Center")
  - Location (e.g., "Chennai, Tamil Nadu")
  - Contact details
- **Multiple Warehouses**: System supports multiple warehouses for better inventory distribution

#### **4. Category Management**
- **Create Product Categories**: Organize products into categories like:
  - Electronics
  - Clothing & Fashion
  - Books & Stationery
  - Home & Garden
  - Sports & Fitness
  - Automotive
  - Health & Beauty
  - Toys & Games
  - Food & Beverages
  - Jewelry & Watches
- **Category Images**: Upload images for each category to make the interface more appealing
- **Category Descriptions**: Add detailed descriptions for each category

#### **5. Product Management**
- **Create Products**: Add new products to the inventory system
- **Product Information**: For each product, specify:
  - **Product Name**: Clear, descriptive name
  - **Description**: Detailed product description
  - **Category**: Assign to appropriate category
  - **Brand**: Product brand name
  - **Model**: Product model number
  - **Initial Stock Unit (SKU)**: Unique product identifier (e.g., "LAPTOP-001")
  - **Unit Price**: Selling price per unit in Indian Rupees (₹)
  - **Cost Price**: Purchase cost per unit
  - **Minimum Stock Threshold**: Alert level when stock gets low
  - **Initial Stock Quantity**: Starting inventory (optional - can use SKU value)
  - **Warehouse**: Select which warehouse to store the product
  - **Specifications**: Additional product details (Color, Size, Material, etc.)

#### **6. Inventory Management**
- **Real-time Stock Tracking**: Monitor current stock levels across all warehouses
- **Stock Information**: View for each product:
  - Available quantity
  - Reserved quantity (for pending orders)
  - Damaged quantity
  - Total stock status
- **Stock Status Indicators**:
  - 🟢 **In Stock**: Sufficient inventory
  - 🟡 **Low Stock**: Below minimum threshold
  - 🔴 **Out of Stock**: No inventory available
- **Read-only Tracking**: Inventory is automatically updated based on orders and purchases

#### **7. Purchase Order Management**
- **Create Purchase Orders**: Order new products from suppliers
- **Purchase Order Details**:
  - **Supplier Information**: Supplier name and contact details
  - **Warehouse**: Select destination warehouse
  - **Products**: Add products to order with quantities and unit prices
  - **Notes**: Additional order information
- **Order Status Tracking**:
  - 🔄 **PENDING**: Order created, waiting for auto-approval
  - ✅ **APPROVED**: Automatically approved after 1 minute
  - 📦 **RECEIVED**: Products received and added to inventory
- **Auto-Approval System**: Orders are automatically approved after 1 minute for faster processing
- **Inventory Update**: When orders are received, product stock levels automatically increase

#### **8. Alert Management**
- **Low Stock Alerts**: System automatically creates alerts when products fall below minimum threshold
- **Alert Information**: Each alert shows:
  - Product details
  - Current stock level
  - Minimum threshold
  - Warehouse information
  - Suggested reorder quantity
- **Quick Actions**: From alerts, admin can:
  - Create purchase orders directly
  - View product details
  - Check warehouse information
- **Alert Status**: Track alerts as Active, Resolved, or Acknowledged

#### **9. Dashboard & Analytics**
- **System Overview**: Real-time statistics including:
  - Total products in system
  - Total warehouses
  - Total users (admin + customers)
  - Low stock alerts count
  - Pending purchase orders
  - Pending sales orders
  - Total inventory value
- **Recent Activity**: View latest alerts and orders
- **Quick Actions**: Direct access to create orders, manage products, etc.

#### **10. Sales Order Monitoring**
- **View Customer Orders**: See all orders placed by customers
- **Order Details**: Track customer orders including:
  - Customer information
  - Products ordered
  - Quantities and prices
  - Order status
  - Shipping details
- **Order Status Management**: Update order status as it progresses through fulfillment

---

### 👤 **CUSTOMER VIEW - Complete Workflow**

Customers are end-users who browse products and place orders. Here's the complete customer workflow:

#### **1. Account Access**
- **Login**: Customers log in using credentials provided by admin
- **Account Information**: View their profile details and order history
- **Password Management**: Change their password anytime

#### **2. Product Browsing**
- **Product Catalog**: Browse all available products in the system
- **Product Categories**: Filter products by category (Electronics, Clothing, etc.)
- **Search Functionality**: Search products by name, brand, or description
- **Product Information**: For each product, customers can see:
  - Product name and description
  - Brand and model
  - Category
  - Price in Indian Rupees (₹)
  - Stock availability
  - Product specifications
  - Warehouse location

#### **3. Product Details**
- **Detailed View**: Click on any product to see comprehensive details
- **Product Images**: View category-based product images
- **Stock Information**: See current availability and stock status
- **Specifications**: View detailed product specifications
- **Warehouse Information**: See which warehouse has the product

#### **4. Order Placement**
- **Shopping Cart**: Add products to cart with desired quantities
- **Order Information**: Provide order details including:
  - Customer name and email
  - Shipping address
  - Billing address (if different)
  - Order notes
- **Order Review**: Review order details before confirmation
- **Order Confirmation**: Submit order for processing

#### **5. Order Tracking**
- **Order History**: View all past and current orders
- **Order Status**: Track order progress through:
  - 📋 **PENDING**: Order submitted, waiting for confirmation
  - ✅ **CONFIRMED**: Order confirmed by system
  - 🚚 **SHIPPED**: Order shipped to customer
  - 📦 **DELIVERED**: Order successfully delivered
  - ❌ **CANCELLED**: Order cancelled (if applicable)
- **Order Details**: View complete order information including:
  - Products ordered
  - Quantities and prices
  - Total order value
  - Order dates
  - Status updates

#### **6. Customer Dashboard**
- **Welcome Screen**: Personalized greeting with customer name
- **Quick Actions**: Easy access to:
  - Browse products
  - View order history
  - Explore product categories
- **Recent Products**: Preview of available products
- **Account Information**: View and manage profile details

---

## 🔄 **SYSTEM AUTOMATION & INTEGRATION**

### **Automatic Processes**
1. **Auto-Approval**: Purchase orders are automatically approved after 1 minute
2. **Inventory Updates**: Stock levels automatically update when orders are processed
3. **Alert Generation**: Low stock alerts are automatically created
4. **Status Tracking**: Order statuses automatically progress based on actions

### **Real-time Updates**
- **Stock Levels**: Updated immediately when orders are placed or received
- **Order Status**: Changes reflect instantly across the system
- **Alerts**: New alerts appear in real-time
- **Dashboard**: Statistics update automatically

### **Data Flow**
1. **Admin creates products** → Products appear in customer catalog
2. **Customer places order** → Inventory automatically decreases
3. **Low stock detected** → Alert automatically generated
4. **Admin creates purchase order** → Order auto-approved after 1 minute
5. **Purchase order received** → Inventory automatically increases
6. **Stock restored** → Alert automatically resolved

---

## 🛠️ Technical Setup (For Developers)

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+

### Backend Setup
```bash
cd backend
# Update application.properties with your database credentials
# Update app.admin.password for admin login
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Access
- **Admin**: Username: `admin`, Password: `Agnel@70050` (configurable)
- **Customer**: Created by admin via User Management

---

## 🎯 **Key Benefits**

### **For Admins**
- ✅ Complete inventory control
- ✅ Automated order processing
- ✅ Real-time stock monitoring
- ✅ Customer management
- ✅ Multi-warehouse support
- ✅ Automated alerts
- ✅ Comprehensive reporting

### **For Customers**
- ✅ Easy product browsing
- ✅ Real-time stock information
- ✅ Simple order placement
- ✅ Order tracking
- ✅ Account management
- ✅ Mobile-responsive interface

### **For Business**
- ✅ Reduced manual work
- ✅ Improved accuracy
- ✅ Better customer service
- ✅ Efficient inventory management
- ✅ Cost savings
- ✅ Scalable solution

---

## 📞 **Support & Documentation**

This system is designed to be user-friendly for both technical and non-technical users. The interface provides clear navigation, helpful tooltips, and intuitive workflows to ensure smooth operation.

For technical support or questions about the system functionality, please refer to the system documentation or contact the development team.

---

**🏪 Happy Inventory Management! 🎉** 