# 🏪 Local Shop Management System - Setup Guide

## Project Overview
A comprehensive **MERN-based** application for local shop management with complete frontend UI.

---

## ✅ What's Implemented

### Frontend (Complete)
- ✅ **Authentication Pages**
  - Login page with validation
  - Sign-up page for new users
  - Forgot password with OTP recovery
  
- ✅ **Dashboard**
  - Real-time statistics cards (Products, Customers, Orders, Revenue)
  - Quick action buttons
  - Responsive design

- ✅ **Product Management**
  - Add products with SKU, category, price, stock
  - Search and filter products
  - Edit product details
  - Delete products
  - Stock level indicators

- ✅ **Customer Management**
  - Add customer profiles
  - Edit customer information
  - Delete customers
  - Search by name, email, or phone
  - Track total spending

- ✅ **Order & Billing**
  - Create orders with multiple items
  - Auto-calculate subtotal, tax (5%), and total
  - Select products and quantities
  - Change order status (pending, completed, cancelled)
  - Customer linkage

- ✅ **Reports & Analytics**
  - Sales metrics and KPIs
  - Top selling products
  - Top customers by spending
  - Monthly revenue trends with visual indicators
  - Date range filtering

- ✅ **UI Components**
  - Responsive sidebar navigation
  - Reusable modal dialogs
  - Data tables with actions
  - Status badges with color coding

### Backend (API Routes Ready)
- ✅ RESTful API routes for all CRUD operations:
  - Products: GET, POST, PUT, DELETE
  - Customers: GET, POST, PUT, DELETE
  - Orders: GET, POST, PUT, DELETE
  - Dashboard stats
  - Reports and analytics

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ installed
- npm or yarn

### Installation

#### 1. Navigate to Frontend Directory
```bash
cd localshop
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Run Development Server
```bash
npm run dev
```

#### 4. Open Browser
Navigate to: **http://localhost:3000**

---

## 📖 User Access

### Login Flow
1. Navigate to **http://localhost:3000**
2. You'll see the login page
3. For testing, you can:
   - Click "Sign up" to create an account
   - Use mock account (any credentials work in current version)
   - Click "Forgot password" to test recovery flow

### After Login
You should be redirected to the dashboard with all management features.

---

## 🗂 Key Directories

### Frontend Structure
```
localshop/
├── app/
│   ├── (authpage)/          # Auth pages (Login, SignUp, ForgotPassword)
│   ├── dashboard/            # Dashboard & management pages
│   │   ├── products/        # Product management
│   │   ├── customers/       # Customer management
│   │   ├── orders/          # Order & billing
│   │   └── reports/         # Analytics & reports
│   └── api/                 # API routes
├── components/
│   └── common/              # Reusable components
├── lib/
│   └── data.ts              # Mock data store
├── context/                 # For future Redux/Context API
└── styles/                  # Global styles
```

---

## 🔌 API Endpoints Available

### Products API
```
GET  /api/products           - List all products
POST /api/products           - Create new product
PUT  /api/products/[id]      - Update product
DELETE /api/products/[id]    - Delete product
```

### Customers API
```
GET  /api/customers          - List all customers
POST /api/customers          - Create new customer
PUT  /api/customers/[id]     - Update customer
DELETE /api/customers/[id]   - Delete customer
```

### Orders API
```
GET  /api/orders             - List all orders
POST /api/orders             - Create new order
PUT  /api/orders/[id]        - Update order
DELETE /api/orders/[id]      - Delete order
```

### Dashboard API
```
GET  /api/dashboard/stats    - Get dashboard statistics
```

### Reports API
```
GET  /api/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

---

## 💾 Mock Data

The application includes sample data:

### Sample Products
- Sample Product 1 (SKU: SKU001) - $299.99
- Sample Product 2 (SKU: SKU002) - $49.99

### Sample Customers
- John Doe - john@example.com
- Jane Smith - jane@example.com

### Sample Orders
- Order #ORD-001 - $629.97 (completed)

---

## 🎯 Features Walkthrough

### 1. Dashboard
- Click on any dashboard stat to see related data
- Use quick action buttons to navigate
- Numbers are from mock data and will update with real database

### 2. Products Page (/dashboard/products)
- Search products by name or SKU
- Click "+ Add Product" to create new product
- Click "Edit" to modify product
- Stock levels shown with color (Red < 10, Green >= 10)

### 3. Customers Page (/dashboard/customers)
- Manage customer information
- Search by name, email, or phone
- Track customer spending

### 4. Orders Page (/dashboard/orders)
- Create orders by selecting customer and products
- Auto-calculates pricing with 5% tax
- Filter orders by status
- Change order status easily

### 5. Reports Page (/dashboard/reports)
- Filter reports by date range
- View KPIs and sales metrics
- See top performing products
- Identify top spending customers
- Monitor monthly revenue trends

---

## 🔧 Configuration

### Tailwind CSS
Already configured in the project with custom colors and fonts.

### TypeScript
Full TypeScript support for type safety.

### Next.js
Configured with App Router for modern React development.

---

## 📝 Data Structure

### Product
```typescript
{
  _id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  description: string
}
```

### Customer
```typescript
{
  _id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  totalSpent: number
}
```

### Order
```typescript
{
  _id: string
  orderNumber: string
  customerId: string
  customerName: string
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  date: string
}
```

---

## 🎨 Styling

The application uses Tailwind CSS with:
- Consistent color scheme (Indigo primary, with Green/Purple/Orange accents)
- Responsive design (mobile, tablet, desktop)
- Dark/Light mode ready
- Smooth transitions and hover effects

---

## 🚀 Next Steps for Production

1. **Connect MongoDB**
   - Set up MongoDB cluster (Atlas or local)
   - Update backend API routes to use Mongoose models
   - Replace mock data store with database queries

2. **Implement JWT Authentication**
   - Hash passwords with bcrypt
   - Generate and validate JWT tokens
   - Implement session management

3. **Setup Express Backend**
   - Create Express server in `/server` directory
   - Implement CORS and middleware
   - Add input validation and error handling

4. **Database Migrations**
   - Create Mongoose schemas
   - Setup indexes for performance
   - Implement data validation

5. **Testing**
   - Write unit tests
   - Integration tests
   - End-to-end tests

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
npx kill-port 3000
npm run dev
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
npm run build
npm start
```

### TypeScript Errors
```bash
npm run type-check
```

---

## 📚 Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client (ready to use)

### Currently Mock Data
- In-memory data store (will be replaced with MongoDB)

---

## ¿Questions or Issues?

- Check the main README.md for more details
- Review component structure in `/components`
- Check API routes in `/app/api`
- Review data structure in `/lib/data.ts`

---

**Ready to use! Start the dev server and explore all features.**
