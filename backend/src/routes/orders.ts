import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController';
import { authenticate, requireAdmin, checkTenantStatus } from '../middleware/auth';
import { validateOrder, validatePagination, validateUUID, handleValidation } from '../middleware/validation';

const router = Router();

// Apply authentication and tenant checks to all routes
router.use(authenticate);
router.use(checkTenantStatus);

// Get order statistics (admin only)
router.get('/stats', requireAdmin, getOrderStats);

// Get orders (with pagination and filtering)
router.get('/', validatePagination, handleValidation, getOrders);

// Get single order
router.get('/:id', validateUUID('id'), handleValidation, getOrder);

// Admin routes (require admin role)
router.use(requireAdmin);

// Create order
router.post('/', validateOrder, handleValidation, createOrder);

// Update order status
router.patch('/:id/status', validateUUID('id'), handleValidation, updateOrderStatus);

// Cancel order
router.patch('/:id/cancel', validateUUID('id'), handleValidation, cancelOrder);

export default router;