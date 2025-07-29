import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models';

interface TenantRequest extends Request {
  tenant?: any;
}

export const resolveTenant = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    // Get tenant from subdomain, domain, or header
    const subdomain = req.get('X-Tenant-Subdomain') || req.subdomains[0];
    const domain = req.get('Host');
    
    let tenant = null;
    
    if (subdomain) {
      tenant = await Tenant.findOne({ where: { subdomain } });
    } else if (domain) {
      tenant = await Tenant.findOne({ where: { domain } });
    }
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    if (tenant.status !== 'active') {
      return res.status(403).json({ error: 'Tenant is not active' });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireActiveTenant = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(400).json({ error: 'Tenant context required' });
  }
  
  if (req.tenant.status !== 'active') {
    return res.status(403).json({ error: 'Tenant is not active' });
  }
  
  next();
};