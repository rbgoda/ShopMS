import { Router } from 'express';
import { Request, Response } from 'express';
import { Product, Category, Tenant } from '../models';
import { resolveTenant } from '../middleware/tenant';
import { Op } from 'sequelize';

interface TenantRequest extends Request {
  tenant?: any;
}

const router = Router();

// Apply tenant resolution to all public routes
router.use(resolveTenant);

// Get shop info
const getShopInfo = async (req: TenantRequest, res: Response) => {
  try {
    const tenant = req.tenant;
    
    res.json({
      shop: {
        name: tenant.name,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        logo: tenant.logo,
        theme: tenant.theme,
        address: tenant.address,
        phone: tenant.phone
      }
    });
  } catch (error) {
    console.error('Get shop info error:', error);
    res.status(500).json({ error: 'Failed to get shop info' });
  }
};

// Get public products (active only)
const getPublicProducts = async (req: TenantRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const featured = req.query.featured === 'true';
    const offset = (page - 1) * limit;

    const whereClause: any = { 
      tenantId: req.tenant.id,
      status: 'active'
    };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (featured) {
      whereClause.isFeatured = true;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ 
        model: Category, 
        as: 'category',
        where: { isActive: true }
      }],
      attributes: { exclude: ['costPrice'] }, // Hide cost price from public
      limit,
      offset,
      order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']]
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
    console.error('Get public products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

// Get single public product
const getPublicProduct = async (req: TenantRequest, res: Response) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({
      where: { 
        slug, 
        tenantId: req.tenant.id,
        status: 'active'
      },
      include: [{ 
        model: Category, 
        as: 'category',
        where: { isActive: true }
      }],
      attributes: { exclude: ['costPrice'] }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await product.increment('viewCount');

    res.json(product);
  } catch (error) {
    console.error('Get public product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

// Get public categories (active only)
const getPublicCategories = async (req: TenantRequest, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { 
        tenantId: req.tenant.id,
        isActive: true
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Get featured products
const getFeaturedProducts = async (req: TenantRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await Product.findAll({
      where: { 
        tenantId: req.tenant.id,
        status: 'active',
        isFeatured: true
      },
      include: [{ 
        model: Category, 
        as: 'category',
        where: { isActive: true }
      }],
      attributes: { exclude: ['costPrice'] },
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to get featured products' });
  }
};

// Create contact form submission
const submitContactForm = async (req: TenantRequest, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // In a real application, you would save this to database
    // and/or send an email notification
    console.log('Contact form submission:', {
      tenant: req.tenant.name,
      name,
      email,
      subject,
      message,
      timestamp: new Date()
    });

    res.json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

// Routes
router.get('/shop', getShopInfo);
router.get('/products', getPublicProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/:slug', getPublicProduct);
router.get('/categories', getPublicCategories);
router.post('/contact', submitContactForm);

export default router;