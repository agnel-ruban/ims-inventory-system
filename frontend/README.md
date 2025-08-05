# IMS Frontend

React-based frontend for the Inventory Management System (IMS).

## 🚀 Features

- **Modern React 18** with TypeScript
- **Material-UI (MUI)** for beautiful, responsive UI
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API communication
- **Role-based access control** (Admin/Customer)
- **Responsive design** for all devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Common/         # Common components (LoadingSpinner, etc.)
│   └── Layout/         # Layout components
├── pages/              # Page components
├── services/           # API services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🔐 Authentication

The app uses JWT-based authentication with role-based access:

- **Admin**: Full access to all features
- **Customer**: Limited access to products and orders

### Default Credentials
- **Admin**: `admin` / `admin123`
- **Customer**: Created by admin via API

## 🎨 UI Components

Built with Material-UI featuring:
- Responsive design
- Dark/light theme support
- Custom color palette
- Modern card-based layouts
- Interactive data grids
- Toast notifications

## 🔄 API Integration

The frontend communicates with the backend via:
- RESTful API calls using Axios
- Automatic token management
- Error handling and user feedback
- Real-time data updates

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

## 🚀 Next Steps

This is Phase 1 of the frontend implementation. Future phases will include:

1. **Phase 2**: Complete dashboard with charts and analytics
2. **Phase 3**: Advanced product management with images
3. **Phase 4**: Order processing workflows
4. **Phase 5**: Real-time notifications
5. **Phase 6**: Advanced reporting and exports

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use:**
   ```bash
   # Kill the process or use a different port
   npm run dev -- --port 3001
   ```

2. **Backend connection issues:**
   - Ensure backend is running on `http://localhost:8080`
   - Check CORS configuration in backend

3. **Authentication issues:**
   - Clear browser localStorage
   - Check token expiration
   - Verify backend authentication endpoints

## 📄 License

This project is part of the IMS (Inventory Management System) application. 