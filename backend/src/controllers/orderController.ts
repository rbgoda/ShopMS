import { Request, Response } from 'express';
import { Order, OrderItem, Product, Customer } from '../models';
import { generateOrderNumber } from '../utils/auth';
import { Op } from 'sequelize';
import sequelize from '../config/database';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId: req.tenant.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, tenantId: req.tenant.id },
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      customerId,
      items,
      billingAddress,
      shippingAddress,
      paymentMethod,
      notes,
      taxAmount,
      shippingAmount,
      discountAmount
    } = req.body;

    // Verify customer belongs to tenant
    const customer = await Customer.findOne({
      where: { id: customerId, tenantId: req.tenant.id }
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid customer' });
    }

    // Calculate totals and verify products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.productId, tenantId: req.tenant.id }
      });

      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      if (product.status !== 'active') {
        await transaction.rollback();
        return res.status(400).json({ error: `Product ${product.name} is not available` });
      }

      if (product.trackInventory && product.inventory < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Insufficient inventory for ${product.name}. Available: ${product.inventory}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images[0] || null,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });

      // Update inventory if tracking
      if (product.trackInventory) {
        await product.update(
          { 
            inventory: product.inventory - item.quantity,
            salesCount: product.salesCount + item.quantity
          },
          { transaction }
        );
      }
    }

    const totalAmount = subtotal + (taxAmount || 0) + (shippingAmount || 0) - (discountAmount || 0);

    // Create order
    const order = await Order.create({
      tenantId: req.tenant.id,
      customerId,
      orderNumber: generateOrderNumber(),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      subtotal,
      taxAmount: taxAmount || 0,
      shippingAmount: shippingAmount || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
      currency: 'USD',
      billingAddress,
      shippingAddress,
      notes
    }, { transaction });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      }, { transaction });
    }

    // Update customer stats
    await customer.update({
      totalOrders: customer.totalOrders + 1,
      totalSpent: parseFloat(customer.totalSpent.toString()) + totalAmount,
      lastOrderAt: new Date()
    }, { transaction });

    await transaction.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updates: any = { status };
    
    if (status === 'shipped' && trackingNumber) {
      updates.trackingNumber = trackingNumber;
      updates.shippedAt = new Date();
    }
    
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }

    await order.update(updates);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, tenantId: req.tenant.id },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product && product.trackInventory) {
        await product.update({
          inventory: product.inventory + item.quantity,
          salesCount: Math.max(0, product.salesCount - item.quantity)
        }, { transaction });
      }
    }

    // Update order status
    await order.update({ status: 'cancelled' }, { transaction });

    await transaction.commit();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [totalOrders, monthlyOrders, dailyOrders, totalRevenue, monthlyRevenue, dailyRevenue] = await Promise.all([
      Order.count({ where: { tenantId: req.tenant.id } }),
      Order.count({ 
        where: { 
          tenantId: req.tenant.id,
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      Order.count({ 
        where: { 
          tenantId: req.tenant.id,
          createdAt: { [Op.gte]: startOfDay }
        }
      }),
      Order.sum('totalAmount', { where: { tenantId: req.tenant.id, paymentStatus: 'paid' } }),
      Order.sum('totalAmount', { 
        where: { 
          tenantId: req.tenant.id,
          paymentStatus: 'paid',
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      Order.sum('totalAmount', { 
        where: { 
          tenantId: req.tenant.id,
          paymentStatus: 'paid',
          createdAt: { [Op.gte]: startOfDay }
        }
      })
    ]);

    res.json({
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        daily: dailyOrders
      },
      revenue: {
        total: totalRevenue || 0,
        monthly: monthlyRevenue || 0,
        daily: dailyRevenue || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to get order stats' });
  }
};