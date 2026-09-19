---
description: Repository Information Overview
alwaysApply: true
---

# React Admin Dashboard Repository

## Summary

This is a full-stack admin dashboard application combining a React frontend with a Node.js/Express backend. The frontend provides a comprehensive administrative interface with Syncfusion components, real-time data visualization, and authentication. The backend handles API operations, user management, expense tracking, sales data, and MongoDB integration.

## Repository Structure

- **React-Admin-DashBoard-main/**: Frontend React application with Syncfusion UI components, state management via Zustand, and Tailwind CSS styling
- **Backend/**: Node.js/Express API server with MongoDB integration, JWT authentication, and CORS configuration
- **Root package.json & node_modules**: Shared dependencies for the backend server

### Main Components

- **Frontend**: React-based admin dashboard with dashboard views, expense management, sales tracking, user management, and category management
- **Backend**: REST API with authentication, role-based access control, file uploads, and database operations
- **Database**: MongoDB for persistent data storage
- **Authentication**: JWT-based auth with bcryptjs password hashing

## Frontend: React Admin Dashboard

**Configuration File**: `React-Admin-DashBoard-main/package.json`

### Language & Runtime

**Language**: JavaScript (JSX)  
**React Version**: 17.0.2  
**Node.js**: Required (LTS recommended)  
**Build Tool**: Create React App (react-scripts 5.0.0)  
**CSS Framework**: Tailwind CSS 3.0.19

### Dependencies

**Main Dependencies**:
- **@syncfusion/ej2-react-*** (19.4.x) - UI components (charts, calendars, grids, dropdowns, kanban, schedule)
- **axios** (1.10.0) - HTTP client for API communication
- **react-router-dom** (6.2.1) - Client-side routing
- **zustand** (4.4.7) - State management
- **@react-pdf/renderer** (4.3.0) - PDF generation
- **jspdf** (3.0.1) & **jspdf-autotable** (5.0.2) - PDF utilities
- **xlsx** (0.18.5) - Excel file handling
- **react-toastify** (8.2.0) - Notifications
- **react-image-crop** (11.0.10) - Image cropping
- **react-icons** (4.3.1) - Icon library

**Development Dependencies**:
- **eslint** (8.9.0) with airbnb config
- **tailwindcss** (3.0.19) & **autoprefixer** (10.4.2)
- **postcss** (8.4.6)

### Build & Installation

```bash
cd React-Admin-DashBoard-main
npm install
npm start           # Start development server on http://localhost:3000
npm run build       # Build for production
npm run test        # Run tests
npm run eject       # Eject from Create React App (irreversible)
```

### Main Files & Structure

**Entry Point**: `src/index.js`  
**Main Component**: `src/App.js`  
**API Configuration**: `src/Library/Axios.js` - Configured for `http://localhost:5000/api` with request/response interceptors for JWT auth token injection

**Key Directories**:
- `src/components/` - Reusable UI components (Charts, Modals, Navigation)
- `src/pages/` - Page components (Dashboard, Sales, Expenses, Users, Categories)
- `src/Store/` - Zustand stores (ExpenseStore.js, SalesStore.js)
- `src/contexts/` - React context (AuthContext, RoleContext)
- `src/data/` - Assets and dummy data

### Testing

**Framework**: Jest (via react-scripts)

**Run Command**:
```bash
npm test
```

## Backend: Node.js API Server

**Configuration File**: `Backend/package.json`  
**Main Entry Point**: `Backend/server.js`

### Language & Runtime

**Language**: JavaScript (ES Modules)  
**Node.js Version**: 14+ (recommended 16+)  
**Module Type**: ES modules (type: "module" in package.json)  
**Package Manager**: npm  
**Port**: 5000 (default, configurable via PORT environment variable)

### Dependencies

**Main Dependencies**:
- **express** (5.1.0) - Web framework
- **mongoose** (8.16.1) - MongoDB ODM
- **bcryptjs** (3.0.2) - Password hashing
- **jsonwebtoken** (9.0.2) - JWT authentication
- **cors** (2.8.5) - Cross-origin resource sharing
- **multer** (2.0.1) - File upload middleware
- **cookie-parser** (1.4.7) - Cookie parsing
- **dotenv** (17.0.1) - Environment variable management
- **nodemailer** (7.0.4) - Email sending

**Development Dependencies**:
- **nodemon** (3.1.10) - Auto-reload server on file changes

### Build & Installation

```bash
cd Backend
npm install
npm start           # Start server on port 5000
npm run server      # Start with nodemon for development
npm run migrate-categories  # Run migration script
```

### Main Files & Structure

**Server Setup**: `server.js` - Express app, CORS config, middleware setup, route registration

**Key Directories**:
- `src/config/` - Database connection (MongoDB)
- `src/Controllers/` - Request handlers (auth, expenses, sales, users, categories, orders)
- `src/Routes/` - API route definitions
- `src/Models/` - Mongoose schemas (User, Expense, Sales, Category, Order)
- `src/Middlewares/` - Auth and role-based access control middleware
- `src/scripts/` - Utility scripts (category migration)
- `uploads/` - Uploaded files directory

### Environment Configuration

**File**: `.env`  
**Variables**:
- `PORT` - Server port (default 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

### API Routes

- `GET|POST /api/categories` - Category management
- `GET|POST /api/expenses` - Expense tracking
- `GET|POST /api/sales` - Sales data management
- `GET|POST /api/orders` - Order management
- `GET|POST /api/users` - User management
- `GET|POST /api/auth` - Authentication (login, registration)

All routes return JSON responses and require JWT authentication in the Authorization header for protected endpoints.

## Integration

**Frontend to Backend Communication**:
- Frontend proxy: Configured in `React-Admin-DashBoard-main/package.json` to forward requests to `http://localhost:5000`
- Axios instance at `src/Library/Axios.js` manages API calls with token injection
- JWT token stored in localStorage and auto-attached to all requests

**Deployment**:
- Frontend: Hosted on Vercel (demo at https://shiv-react-admin-dashboard.vercel.app/)
- Backend: Configured for Render.com deployment (alternative endpoints in CORS config)
