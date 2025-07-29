# Multitenant Shop SaaS Platform

A complete full-stack SaaS solution for creating multitenant e-commerce shops. Each shopkeeper can have their own independent shop with a custom subdomain, product management, order processing, and customer management.

## 🚀 Features

### ✅ Completed Core Features

#### Backend API (Node.js/Express/PostgreSQL)
- **Multitenancy**: Complete tenant isolation with subdomain-based routing
- **Authentication & Authorization**: JWT-based auth with role-based permissions (Owner, Admin, Staff)
- **Product Management**: Full CRUD operations with categories, inventory tracking, SEO fields
- **Order Management**: Order processing, status tracking, payment integration ready
- **Customer Management**: Customer profiles, order history, analytics
- **Dashboard Analytics**: Revenue tracking, sales charts, inventory alerts
- **Public API**: Frontend shop API with product catalog and shop information

#### Admin Dashboard (React/TypeScript/Tailwind)
- **Responsive Design**: Mobile-first design with modern UI components
- **Authentication**: Login/Register with tenant creation
- **Dashboard**: Analytics overview with charts and key metrics
- **Sidebar Navigation**: Easy access to all management features
- **Modern Stack**: Vite, TypeScript, Tailwind CSS, Heroicons

#### Frontend Shop (React/TypeScript/Tailwind)
- **Shop Landing Page**: Hero section with featured products
- **Product Catalog**: Product listing and detail views
- **Responsive Design**: Mobile-optimized shopping experience
- **Tenant Context**: Automatic subdomain detection and shop customization

### 🔄 Planned Features (Ready for Implementation)

#### Product Management
- Image upload and gallery management
- Product variants and options
- Bulk product import/export
- Advanced filtering and search

#### Order Processing
- Shopping cart functionality
- Checkout process with address management
- Payment integration (Stripe ready)
- Order tracking and notifications
- Invoice generation

#### Advanced Features
- Email notifications (NodeMailer configured)
- File upload handling (Multer configured)
- Rate limiting and security
- SEO optimization
- Multi-language support
- Theme customization

## 🏗️ Architecture

### Project Structure
```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── models/         # Sequelize database models
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic controllers
│   │   ├── middleware/     # Authentication, validation, etc.
│   │   ├── config/         # Database and app configuration
│   │   └── utils/          # Helper utilities
│   └── package.json
├── admin-dashboard/        # React admin interface
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard pages
│   │   ├── contexts/       # React context for state management
│   │   └── hooks/          # Custom React hooks
│   └── package.json
├── frontend/              # Public shop interface
│   ├── src/
│   │   ├── components/     # Shop UI components
│   │   ├── pages/          # Shop pages
│   │   └── contexts/       # Shop context and state
│   └── package.json
└── package.json           # Workspace configuration
```

### Database Schema

#### Core Models
- **Tenants**: Shop information, subdomain, subscription details
- **Users**: Shop owners/staff with role-based permissions
- **Products**: Product catalog with categories, pricing, inventory
- **Customers**: Customer profiles and contact information
- **Orders**: Order processing with items, payments, shipping
- **Categories**: Product categorization and organization

#### Key Relationships
- One tenant has many users, products, customers, orders
- Products belong to categories and tenants
- Orders contain multiple order items (products)
- Customers can have multiple orders

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd multitenant-shop-saas
npm install
```

2. **Database Setup**
```bash
# Create PostgreSQL database
createdb multitenant_shop

# Update backend/.env with your database credentials
cp backend/.env.example backend/.env
# Edit database connection details
```

3. **Start Development Servers**
```bash
# Start all services concurrently
npm run dev

# Or start individually:
npm run dev:backend    # API server on :5000
npm run dev:admin      # Admin dashboard on :3001  
npm run dev:frontend   # Shop frontend on :3000
```

### First Shop Setup

1. **Create Your First Shop**
   - Go to http://localhost:3001/register
   - Fill in shop details (name, subdomain, owner info)
   - Login to the admin dashboard

2. **Configure Shop**
   - Add categories in the Categories section
   - Create products with pricing and descriptions
   - Set up shop information and settings

3. **View Your Shop**
   - Visit http://localhost:3000 to see your shop
   - Products will appear based on your subdomain
   - Test the shopping experience

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multitenant_shop
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Multitenancy

The platform uses subdomain-based multitenancy:
- Each shop gets a unique subdomain (e.g., `myshop.localhost`)
- API automatically resolves tenant from subdomain/domain
- Complete data isolation between tenants
- Custom themes and branding per tenant

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new shop and owner
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/profile` - Get user profile

### Admin Endpoints (Authenticated)
- `GET /api/dashboard/overview` - Dashboard analytics
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create new product
- `GET /api/orders` - List orders with status filtering
- `GET /api/customers` - List customers

### Public Shop Endpoints
- `GET /api/public/shop` - Shop information
- `GET /api/public/products` - Public product catalog
- `GET /api/public/products/:slug` - Product details
- `GET /api/public/categories` - Product categories

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting
- **Email**: NodeMailer (configured)
- **Payments**: Stripe (ready for integration)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router v6
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Charts**: Recharts (admin dashboard)

### Development Tools
- **Package Manager**: npm workspaces for monorepo
- **Code Quality**: ESLint configuration
- **CSS Processing**: PostCSS with Tailwind
- **Development**: Hot reload for all services

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build all applications:
```bash
npm run build
```

2. Configure production environment variables
3. Set up PostgreSQL database
4. Deploy to your hosting platform (Vercel, Railway, DigitalOcean, etc.)

### Environment-Specific Configurations
- **Development**: localhost with subdomains
- **Staging**: Custom domain with subdomain routing
- **Production**: SSL certificates, domain configuration, CDN

## 🤝 Contributing

This is a complete starter template. To extend functionality:

1. **Backend**: Add new models, routes, and controllers
2. **Admin Dashboard**: Create new pages and components
3. **Frontend Shop**: Enhance shopping experience
4. **Integrations**: Add payment gateways, shipping providers, analytics

## 📝 License

MIT License - feel free to use this template for your projects.

## 🆘 Support

For questions and support:
- Check the code documentation
- Review API endpoints and middleware
- Examine component structure and contexts
- Test with sample data

---

**Ready to launch your SaaS e-commerce platform!** 🎉

The foundation is complete - now customize it for your specific needs and add advanced features like payments, advanced analytics, and integrations.