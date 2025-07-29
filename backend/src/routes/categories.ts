import { Router } from 'express';
import { Request, Response } from 'express';
import { Category } from '../models';
import { authenticate, requireAdmin, checkTenantStatus } from '../middleware/auth';
import { validateCategory, validatePagination, validateUUID, handleValidation } from '../middleware/validation';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

const router = Router();

// Apply authentication and tenant checks to all routes
router.use(authenticate);
router.use(checkTenantStatus);

// Get categories
const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId: req.tenant.id };
    
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      categories,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Get single category
const getCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
};

// Create category (admin only)
const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, image, parentId, sortOrder, isActive } = req.body;

    // Check if slug already exists
    const existingCategory = await Category.findOne({
      where: { slug, tenantId: req.tenant.id }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const category = await Category.create({
      tenantId: req.tenant.id,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      image,
      parentId,
      sortOrder: sortOrder || 0,
      isActive: isActive !== false
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category (admin only)
const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check slug uniqueness if updating
    if (updates.slug && updates.slug !== category.slug) {
      const existingCategory = await Category.findOne({
        where: { 
          slug: updates.slug, 
          tenantId: req.tenant.id,
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    await category.update(updates);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category (admin only)
const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, tenantId: req.tenant.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Public routes (read-only)
router.get('/', validatePagination, handleValidation, getCategories);
router.get('/:id', validateUUID('id'), handleValidation, getCategory);

// Admin routes (require admin role)
router.use(requireAdmin);
router.post('/', validateCategory, handleValidation, createCategory);
router.put('/:id', validateUUID('id'), handleValidation, updateCategory);
router.delete('/:id', validateUUID('id'), handleValidation, deleteCategory);

export default router;