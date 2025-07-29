import { Router } from 'express';
import { Request, Response } from 'express';
import { Product, Order, Customer, OrderItem } from '../models';
import { authenticate, requireAdmin, checkTenantStatus } from '../middleware/auth';
import { Op } from 'sequelize';
import sequelize from '../config/database';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

const router = Router();

// Apply authentication and tenant checks to all routes
router.use(authenticate);
router.use(checkTenantStatus);
router.use(requireAdmin); // Dashboard requires admin access

// Get dashboard overview
const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      monthlyOrders,
      monthlyRevenue,
      weeklyOrders,
      weeklyRevenue,
      lowStockProducts,
      topSellingProducts,
      recentOrders
    ] = await Promise.all([
      // Total counts
      Product.count({ where: { tenantId: req.tenant.id } }),
      Customer.count({ where: { tenantId: req.tenant.id } }),
      Order.count({ where: { tenantId: req.tenant.id } }),
      Order.sum('totalAmount', { 
        where: { tenantId: req.tenant.id, paymentStatus: 'paid' } 
      }),
      
      // Monthly stats
      Order.count({ 
        where: { 
          tenantId: req.tenant.id,
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      Order.sum('totalAmount', { 
        where: { 
          tenantId: req.tenant.id,
          paymentStatus: 'paid',
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      
      // Weekly stats
      Order.count({ 
        where: { 
          tenantId: req.tenant.id,
          createdAt: { [Op.gte]: startOfWeek }
        }
      }),
      Order.sum('totalAmount', { 
        where: { 
          tenantId: req.tenant.id,
          paymentStatus: 'paid',
          createdAt: { [Op.gte]: startOfWeek }
        }
      }),
      
      // Low stock products
      Product.findAll({
        where: {
          tenantId: req.tenant.id,
          trackInventory: true,
          inventory: { [Op.lte]: 10 }
        },
        order: [['inventory', 'ASC']],
        limit: 10
      }),
      
      // Top selling products
      OrderItem.findAll({
        attributes: [
          'productId',
          'productName',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
        ],
        include: [{
          model: Order,
          as: 'order',
          where: { tenantId: req.tenant.id },
          attributes: []
        }],
        group: ['productId', 'productName'],
        order: [[sequelize.literal('totalSold'), 'DESC']],
        limit: 10
      }),
      
      // Recent orders
      Order.findAll({
        where: { tenantId: req.tenant.id },
        include: [{ model: Customer, as: 'customer' }],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    res.json({
      overview: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue: totalRevenue || 0,
        monthlyOrders,
        monthlyRevenue: monthlyRevenue || 0,
        weeklyOrders,
        weeklyRevenue: weeklyRevenue || 0
      },
      lowStockProducts,
      topSellingProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily sales for the period
    const dailySales = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ],
      where: {
        tenantId: req.tenant.id,
        createdAt: { [Op.gte]: startDate },
        paymentStatus: 'paid'
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Order status breakdown
    const orderStatusBreakdown = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { tenantId: req.tenant.id },
      group: ['status']
    });

    res.json({
      dailySales,
      orderStatusBreakdown
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ error: 'Failed to get sales analytics' });
  }
};

// Routes
router.get('/overview', getDashboardOverview);
router.get('/analytics', getSalesAnalytics);

export default router;