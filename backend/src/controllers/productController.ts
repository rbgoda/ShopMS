import { Request, Response } from 'express';
import { Product, Category } from '../models';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId: req.tenant.id };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      products,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      where: { id, tenantId: req.tenant.id },
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await product.increment('viewCount');

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      sku,
      price,
      comparePrice,
      costPrice,
      categoryId,
      images,
      inventory,
      trackInventory,
      weight,
      dimensions,
      tags,
      metaTitle,
      metaDescription,
      status,
      isFeatured
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({
      where: { sku, tenantId: req.tenant.id }
    });

    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    // Verify category belongs to tenant
    const category = await Category.findOne({
      where: { id: categoryId, tenantId: req.tenant.id }
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const product = await Product.create({
      tenantId: req.tenant.id,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      shortDescription,
      sku,
      price,
      comparePrice,
      costPrice,
      categoryId,
      images: images || [],
      inventory: inventory || 0,
      trackInventory: trackInventory !== false,
      weight,
      dimensions,
      tags: tags || [],
      metaTitle,
      metaDescription,
      status: status || 'draft',
      isFeatured: isFeatured || false
    });

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check SKU uniqueness if updating
    if (updates.sku && updates.sku !== product.sku) {
      const existingProduct = await Product.findOne({
        where: { 
          sku: updates.sku, 
          tenantId: req.tenant.id,
          id: { [Op.ne]: id }
        }
      });

      if (existingProduct) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Verify category if updating
    if (updates.categoryId) {
      const category = await Category.findOne({
        where: { id: updates.categoryId, tenantId: req.tenant.id }
      });

      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    await product.update(updates);

    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const bulkUpdateProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds, updates } = req.body;

    await Product.update(updates, {
      where: {
        id: { [Op.in]: productIds },
        tenantId: req.tenant.id
      }
    });

    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
};