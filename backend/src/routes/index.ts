import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import categoryRoutes from './categories';
import orderRoutes from './orders';
import customerRoutes from './customers';
import dashboardRoutes from './dashboard';
import publicRoutes from './public';

const router = Router();

// Public routes (no authentication required)
router.use('/public', publicRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Protected routes (authentication required)
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;