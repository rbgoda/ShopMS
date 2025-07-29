import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Tenant } from '../models';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive.' });
    }

    req.user = user;
    req.tenant = user.tenant;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Owner role required.' });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['owner', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

export const checkTenantStatus = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.tenant?.status !== 'active') {
    return res.status(403).json({ error: 'Tenant account is inactive.' });
  }
  
  if (req.tenant?.subscriptionStatus !== 'active') {
    return res.status(402).json({ error: 'Subscription is not active.' });
  }
  
  next();
};