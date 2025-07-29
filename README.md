# Multitenant Shop SaaS Platform

A complete full-stack SaaS platform for shopkeepers to create and manage their online stores with multitenant architecture, built with Node.js, React, TypeScript, and **Supabase PostgreSQL**.

## 🌟 Features

### ✅ **Completed Features**

#### **Backend API**
- 🏗️ **Multitenant Architecture** - Subdomain-based tenant isolation
- 🔐 **Authentication & Authorization** - JWT with role-based permissions (Owner, Admin, Staff)
- 📦 **Product Management** - Full CRUD with categories, inventory, pricing
- 🛒 **Order Processing** - Complete order lifecycle with status tracking
- 👥 **Customer Management** - Customer profiles with order history
- 📊 **Analytics Dashboard** - Revenue tracking, sales insights, low stock alerts
- 🌐 **Public API** - Product catalog for frontend shops
- 🔒 **Security Features** - Rate limiting, input validation, CORS
- 💾 **Supabase Integration** - PostgreSQL database with real-time capabilities

#### **Admin Dashboard**
- 🎨 **Modern UI/UX** - Built with React, TypeScript, and Tailwind CSS
- 📱 **Responsive Design** - Mobile-first approach with beautiful components
- 🔑 **Authentication Flow** - Login/register with tenant creation
- 📈 **Analytics Charts** - Revenue, orders, and performance metrics using Recharts
- 🎯 **Tenant Management** - Shop creation with auto-generated subdomains
- ⚡ **Real-time Updates** - Live data with modern React patterns

#### **Frontend Shop**
- 🛍️ **Shopping Experience** - Product catalog with featured items
- 🎨 **Beautiful Design** - Modern, responsive storefront
- 🏪 **Tenant-Aware** - Automatic subdomain detection and branding
- 📱 **Mobile Optimized** - Seamless experience across all devices

## 🏗️ Architecture

### **Technology Stack**
- **Backend**: Node.js, Express.js, TypeScript, Sequelize ORM
- **Database**: Supabase PostgreSQL (with real-time features)
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Charts**: Recharts (admin dashboard)
- **Icons**: Heroicons
- **Monorepo**: npm workspaces

### **Database Schema**
```
Tenants (Shops)
├── Users (Shop owners, admins, staff)
├── Products
│   └── Categories
├── Orders
│   └── OrderItems
└── Customers
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. **Supabase Setup**

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Get Your Credentials**:
   - Project URL: `https://your-project-ref.supabase.co`
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API
   - Database Password: Set during project creation

3. **Optional: Configure Database**:
   ```sql
   -- The app will auto-create tables, but you can run this for manual setup
   -- Tables: tenants, users, products, categories, orders, order_items, customers
   ```

### 2. **Project Setup**

```bash
# Clone the repository
git clone https://github.com/rbgoda/ShopMS.git
cd ShopMS

# Install dependencies for all workspaces
npm install

# Configure environment variables
cp backend/.env backend/.env.local
```

### 3. **Environment Configuration**

Update `backend/.env` with your Supabase credentials:

```env
# Database Configuration (Supabase PostgreSQL)
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DATABASE_URL=postgresql://postgres:your-supabase-password@db.your-project-ref.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 4. **Start Development**

```bash
# Start all services (backend + admin + frontend)
npm run dev

# Or start individually:
npm run dev:backend    # Backend API (port 5000)
npm run dev:admin     # Admin Dashboard (port 3001)
npm run dev:frontend  # Shop Frontend (port 3000)
```

### 5. **Create Your First Shop**

1. Open Admin Dashboard: `http://localhost:3001`
2. Click "Register" to create a new shop
3. Fill in shop details (subdomain will be auto-generated)
4. Login to access the dashboard
5. View your shop at: `http://localhost:3000`

## 🔧 Configuration

### **Multitenancy**
The platform uses subdomain-based multitenancy:
- **Admin Dashboard**: `admin.yourdomain.com`
- **Shop 1**: `shop1.yourdomain.com`
- **Shop 2**: `shop2.yourdomain.com`

For local development:
- **Admin**: `localhost:3001`
- **Shops**: `localhost:3000` (with tenant headers)

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `JWT_SECRET` | Secret for JWT token signing | ✅ |
| `PORT` | Backend server port | ❌ (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |
| `ADMIN_URL` | Admin dashboard URL for CORS | ❌ |

### **Supabase Features Available**
- **PostgreSQL Database**: Primary data storage
- **Real-time subscriptions**: For live updates (ready to implement)
- **Row Level Security**: For enhanced tenant isolation (can be configured)
- **Storage**: For file uploads (ready to implement)
- **Edge Functions**: For serverless functions (ready to implement)

## 📡 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/register    # Create new tenant & owner
POST /api/auth/login       # Authenticate user
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
PUT  /api/auth/password    # Change password
```

### **Product Management**
```
GET    /api/products           # List products (with search, filter, pagination)
POST   /api/products           # Create product
GET    /api/products/:id       # Get product details
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
```

### **Order Management**
```
GET    /api/orders             # List orders (with filters)
POST   /api/orders             # Create order
GET    /api/orders/:id         # Get order details
PUT    /api/orders/:id         # Update order status
DELETE /api/orders/:id         # Cancel order
GET    /api/orders/analytics   # Order analytics
```

### **Public Shop API**
```
GET /api/public/shop          # Get shop information
GET /api/public/products      # Get public product catalog
GET /api/public/categories    # Get product categories
```

## 🚀 Deployment

### **Supabase Production Setup**

1. **Set Production Environment**:
   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-supabase-url
   ```

2. **Enable SSL** (automatically configured for production)

3. **Configure Row Level Security** (optional):
   ```sql
   -- Enable RLS for enhanced security
   ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   -- Add policies as needed
   ```

### **Platform Deployment Options**

#### **Backend Deployment**
- **Vercel**: Deploy backend with serverless functions
- **Railway**: Deploy with PostgreSQL addon
- **Heroku**: Deploy with Heroku Postgres
- **DigitalOcean**: Deploy on App Platform

#### **Frontend Deployment**
- **Vercel**: Automatic deployment with Git integration
- **Netlify**: Static site deployment with forms
- **AWS S3 + CloudFront**: Static hosting with CDN

#### **Full-Stack Deployment**
- **Railway**: Deploy monorepo with multiple services
- **Docker**: Containerized deployment anywhere
- **DigitalOcean**: App Platform multi-container

### **Production Checklist**
- [ ] Configure production Supabase project
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domains
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure file storage (Supabase Storage)
- [ ] Set up automated backups
- [ ] Configure email service (SendGrid, Mailgun)
- [ ] Set up payment processing (Stripe)

## 🛠️ Development

### **Available Scripts**
```bash
npm run dev          # Start all services
npm run build        # Build all projects
npm run dev:backend  # Start backend only
npm run dev:admin    # Start admin dashboard only
npm run dev:frontend # Start frontend only
```

### **Project Structure**
```
workspace/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Database & Supabase config
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, tenant
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   ├── .env               # Environment variables
│   └── package.json
├── admin-dashboard/        # React admin interface
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.tsx
│   └── package.json
├── frontend/              # React shop frontend
│   ├── src/
│   │   ├── components/   # Shop components
│   │   ├── pages/        # Shop pages
│   │   ├── contexts/     # Shop context
│   │   └── App.tsx
│   └── package.json
└── package.json          # Workspace configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for shopkeepers worldwide**