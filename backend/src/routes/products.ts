import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts
} from '../controllers/productController';
import { authenticate, requireAdmin, checkTenantStatus } from '../middleware/auth';
import { validateProduct, validatePagination, validateUUID, handleValidation } from '../middleware/validation';

const router = Router();

// Apply authentication and tenant checks to all routes
router.use(authenticate);
router.use(checkTenantStatus);

// Get products (with pagination and filtering)
router.get('/', validatePagination, handleValidation, getProducts);

// Get single product
router.get('/:id', validateUUID('id'), handleValidation, getProduct);

// Admin routes (require admin role)
router.use(requireAdmin);

// Create product
router.post('/', validateProduct, handleValidation, createProduct);

// Update product
router.put('/:id', validateUUID('id'), handleValidation, updateProduct);

// Delete product
router.delete('/:id', validateUUID('id'), handleValidation, deleteProduct);

// Bulk update products
router.patch('/bulk', bulkUpdateProducts);

export default router;