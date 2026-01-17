# Inventory Management System - Frontend

This is the frontend application for the Multi-Tenant Inventory Management System, built with Next.js, TypeScript, Tailwind CSS, and Material UI.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Material UI (MUI)** - React component library
- **React Hook Form** - Form handling (ready for use)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:5001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
inventory-management-system-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages (protected)
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # Reusable components
│   └── DashboardLayout.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utilities and services
│   ├── api.ts             # API client
│   └── services/          # API service functions
├── theme/                 # Material UI theme
└── package.json
```

## Features

### Authentication
- User registration with business creation
- User login/logout
- Protected routes with authentication check
- Role-based access control (OWNER, MANAGER, STAFF)

### Dashboard
- Main dashboard with overview cards
- Navigation sidebar with menu items
- User profile menu

### Products Management
- List all products
- Create new products (OWNER/MANAGER only)
- Edit products (OWNER/MANAGER only)
- Delete products (OWNER/MANAGER only)
- View product status (ACTIVE, INACTIVE, DRAFT)

### Purchase Orders
- List all purchase orders
- Create new purchase orders
- Update purchase order status (DRAFT → SENT → CONFIRMED → RECEIVED)

### Sales Orders
- List all sales orders
- Create new sales orders
- Confirm orders (OWNER/MANAGER only)
- Cancel orders (OWNER/MANAGER only)

### Users Management
- List all users (OWNER/MANAGER only)
- Create new users (OWNER/MANAGER only)
- Edit users (OWNER/MANAGER only)
- Delete users (OWNER only)

## API Integration

The frontend communicates with the backend API at `http://localhost:5001/api/v1`. All API calls are handled through service functions in `lib/services/`.

### Available Services

- `auth.service.ts` - Authentication endpoints
- `product.service.ts` - Product management endpoints
- `purchaseOrder.service.ts` - Purchase order endpoints
- `salesOrder.service.ts` - Sales order endpoints
- `user.service.ts` - User management endpoints

## Role-Based Access Control

- **OWNER**: Full access to all features
- **MANAGER**: Can manage products, users, and orders (except delete users)
- **STAFF**: Can view products and orders, create sales orders

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

- NEXT_PUBLIC_API_URL=http://192.168.1.101:5001
- NEXT_PUBLIC_API_SLUG=/api/v1
