import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('tenantName').notEmpty().withMessage('Shop name is required'),
  body('subdomain').matches(/^[a-z0-9-]+$/).withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Product validations
export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('inventory').isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
];

// Category validations
export const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
];

// Customer validations
export const validateCustomer = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

// Order validations
export const validateOrder = [
  body('customerId').isUUID().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('items.*.productId').isUUID().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('billingAddress').notEmpty().withMessage('Billing address is required'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
];

// Pagination validations
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// UUID parameter validation
export const validateUUID = (paramName: string) => [
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`),
];