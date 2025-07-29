# 🚀 Supabase Setup Guide

This guide will help you set up Supabase as the database for your Multitenant Shop SaaS platform.

## 📋 Prerequisites

- A [Supabase](https://supabase.com) account
- Basic understanding of PostgreSQL
- Your project cloned locally

## 🏁 Quick Setup

### 1. Create Supabase Project

1. **Sign up/Login** to [Supabase](https://supabase.com)
2. **Create a New Project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: `multitenant-shop-saas`
   - Enter a strong database password
   - Select your region (choose closest to your users)
   - Click "Create new project"

3. **Wait for Setup** (usually 2-3 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. **Go to Settings > API**
2. **Copy the following**:
   ```
   Project URL: https://your-project-ref.supabase.co
   Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Go to Settings > Database**
4. **Copy Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
   ```

### 3. Configure Environment Variables

Update your `backend/.env` file:

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
```

### 4. Test Connection

```bash
# Install dependencies
npm install

# Start the backend
npm run dev:backend
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

## 🛠️ Advanced Configuration

### Enable Row Level Security (Optional)

For enhanced security, you can enable RLS:

```sql
-- In Supabase SQL Editor
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY "Users can only see own tenant data" ON users
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY "Products are tenant specific" ON products
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Configure Supabase Storage (Optional)

For file uploads:

1. **Go to Storage in Supabase Dashboard**
2. **Create a new bucket**: `product-images`
3. **Set bucket policy**:
   ```sql
   -- Allow authenticated uploads
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

### Set up Real-time (Optional)

Enable real-time for live updates:

```sql
-- In Supabase SQL Editor
ALTER publication supabase_realtime ADD TABLE products;
ALTER publication supabase_realtime ADD TABLE orders;
```

## 🔒 Security Best Practices

### 1. Environment Variables Security

- **Never commit** your actual `.env` file
- **Use strong passwords** (20+ characters)
- **Rotate keys regularly** in production
- **Use different keys** for development/staging/production

### 2. Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE postgres TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### 3. API Security

```env
# Use different JWT secrets per environment
JWT_SECRET_DEV=dev-secret-key
JWT_SECRET_STAGING=staging-secret-key
JWT_SECRET_PROD=production-secret-key
```

## 🚀 Production Deployment

### 1. Production Environment

```env
NODE_ENV=production
DATABASE_URL=your-production-supabase-url
SUPABASE_URL=https://your-prod-project.supabase.co
```

### 2. SSL Configuration

Supabase automatically provides SSL. Your connection will be secure by default.

### 3. Connection Pooling

For high traffic, consider connection pooling:

```typescript
// In src/config/database.ts
const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,     // Maximum connections
    min: 0,      // Minimum connections
    acquire: 30000,
    idle: 10000
  }
});
```

## 📊 Monitoring & Analytics

### 1. Supabase Dashboard

Monitor your database performance:
- **Go to Reports** in Supabase Dashboard
- **Check API usage, database performance**
- **Set up alerts** for high usage

### 2. Custom Logging

```typescript
// Add to your models for audit logging
const logDatabaseQuery = (query: string, duration: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query: ${query} - Duration: ${duration}ms`);
  }
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED
   ```
   - Check your DATABASE_URL
   - Verify Supabase project is running
   - Check firewall settings

2. **SSL Certificate Error**
   ```env
   dialectOptions: {
     ssl: {
       require: true,
       rejectUnauthorized: false
     }
   }
   ```

3. **Too Many Connections**
   - Reduce pool size in config
   - Check for connection leaks
   - Consider connection pooling

### Debug Mode

Enable verbose logging:

```env
NODE_ENV=development
DB_LOGGING=true
```

## 📚 Additional Resources

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **PostgreSQL Guide**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **Sequelize ORM**: [sequelize.org](https://sequelize.org)

## 🆘 Support

If you encounter issues:

1. **Check Supabase Status**: [status.supabase.com](https://status.supabase.com)
2. **Review logs** in Supabase Dashboard
3. **Check our GitHub Issues** for similar problems
4. **Create an issue** with detailed error information

---

**Your database is now ready for production! 🎉**