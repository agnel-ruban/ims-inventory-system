# 🚀 IMS Application Deployment Guide - Render

This guide will help you deploy the Inventory Management System (IMS) to Render, providing a single URL for your organization to test the application.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Database**: PostgreSQL (provided by Render)

## 🎯 Deployment Strategy

We'll deploy:
- **Backend**: Spring Boot API (Java service)
- **Frontend**: React application (Static site)
- **Database**: PostgreSQL (Render managed)

## 📁 Repository Structure

Ensure your repository has this structure:
```
ims/
├── backend/                 # Spring Boot application
├── frontend/               # React application
├── render.yaml            # Render configuration
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## 🚀 Step-by-Step Deployment

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub.com
   - Create a new repository named `ims-inventory-system`
   - Make it public (for free Render deployment)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ims-inventory-system.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Sign up/Login
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select your `ims-inventory-system` repository

2. **Deploy**:
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy all services
   - Wait for deployment to complete (5-10 minutes)

#### Option B: Manual Deployment

If the Blueprint doesn't work, deploy services manually:

##### 1. Deploy Database
- **New +** → **PostgreSQL**
- **Name**: `ims-database`
- **Database**: `ims`
- **User**: `ims_user`
- **Plan**: Free

##### 2. Deploy Backend
- **New +** → **Web Service**
- **Name**: `ims-backend`
- **Environment**: Java
- **Build Command**: `cd backend && ./mvnw clean package -DskipTests`
- **Start Command**: `cd backend && java -jar target/ims-0.0.1-SNAPSHOT.jar`
- **Environment Variables**:
  ```
  SPRING_PROFILES_ACTIVE=prod
  SPRING_DATASOURCE_URL=<from database>
  SPRING_DATASOURCE_USERNAME=<from database>
  SPRING_DATASOURCE_PASSWORD=<from database>
  JWT_SECRET=<generate random string>
  APP_ADMIN_PASSWORD=Agnel@70050
  ```

##### 3. Deploy Frontend
- **New +** → **Static Site**
- **Name**: `ims-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**:
  ```
  VITE_API_BASE_URL=https://ims-backend.onrender.com
  ```

## 🔧 Configuration Details

### Backend Configuration (`application-prod.properties`)
- Uses PostgreSQL database
- JWT authentication
- CORS configured for frontend
- Production logging levels

### Frontend Configuration
- Environment variable for API URL
- Builds to static files
- Served by Render's CDN

### Database Configuration
- PostgreSQL 15
- Automatic backups
- Connection pooling

## 🌐 Access URLs

After deployment, you'll get:
- **Frontend**: `https://ims-frontend.onrender.com`
- **Backend API**: `https://ims-backend.onrender.com`
- **Database**: Managed by Render

## 👤 Admin Credentials

- **Username**: `admin`
- **Password**: `Agnel@70050`

## 🔍 Monitoring & Logs

### View Logs
1. Go to your Render dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor for errors or issues

### Health Checks
- Backend: `https://ims-backend.onrender.com/api/health`
- Frontend: `https://ims-frontend.onrender.com`

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Maven/Node.js versions
   - Verify all dependencies are in package.json/pom.xml
   - Check build logs in Render dashboard

2. **Database Connection Issues**:
   - Verify database credentials
   - Check if database is provisioned
   - Ensure CORS is configured correctly

3. **Frontend Not Loading**:
   - Check if backend URL is correct
   - Verify environment variables
   - Check browser console for errors

### Debug Commands

```bash
# Test backend locally
cd backend
./mvnw spring-boot:run

# Test frontend locally
cd frontend
npm install
npm run dev
```

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Test locally first
4. Contact Render support if needed

## 🎉 Success!

Once deployed, share the frontend URL with your organization:
**`https://ims-frontend.onrender.com`**

This single URL provides access to the complete IMS application with:
- ✅ User authentication
- ✅ Product management
- ✅ Inventory tracking
- ✅ Purchase orders
- ✅ Sales orders
- ✅ Alerts and notifications
- ✅ Dashboard analytics 