import { Router } from 'express';
import { Request, Response } from 'express';
import { Customer, Order } from '../models';
import { authenticate, requireAdmin, checkTenantStatus } from '../middleware/auth';
import { validateCustomer, validatePagination, validateUUID, handleValidation } from '../middleware/validation';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

const router = Router();

// Apply authentication and tenant checks to all routes
router.use(authenticate);
router.use(checkTenantStatus);
router.use(requireAdmin); // All customer routes require admin access

// Get customers
const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId: req.tenant.id };
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
};

// Get single customer
const getCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findOne({
      where: { id, tenantId: req.tenant.id },
      include: [{ 
        model: Order, 
        as: 'orders',
        limit: 10,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
};

// Create customer
const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      country,
      zipCode,
      notes
    } = req.body;

    // Check if email already exists
    const existingCustomer = await Customer.findOne({
      where: { email, tenantId: req.tenant.id }
    });

    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer email already exists' });
    }

    const customer = await Customer.create({
      tenantId: req.tenant.id,
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      country,
      zipCode,
      notes,
      status: 'active'
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customer = await Customer.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check email uniqueness if updating
    if (updates.email && updates.email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        where: { 
          email: updates.email, 
          tenantId: req.tenant.id,
          id: { [Op.ne]: id }
        }
      });

      if (existingCustomer) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await customer.update(updates);

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has orders
    const orderCount = await Order.count({
      where: { customerId: id }
    });

    if (orderCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders' 
      });
    }

    await customer.destroy();

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Routes
router.get('/', validatePagination, handleValidation, getCustomers);
router.get('/:id', validateUUID('id'), handleValidation, getCustomer);
router.post('/', validateCustomer, handleValidation, createCustomer);
router.put('/:id', validateUUID('id'), handleValidation, updateCustomer);
router.delete('/:id', validateUUID('id'), handleValidation, deleteCustomer);

export default router;