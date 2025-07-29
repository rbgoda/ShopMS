import { Request, Response } from 'express';
import { Tenant, User } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, tenantName, subdomain, phone } = req.body;

    // Check if subdomain is already taken
    const existingTenant = await Tenant.findOne({
      where: {
        [Op.or]: [
          { subdomain },
          { email }
        ]
      }
    });

    if (existingTenant) {
      return res.status(400).json({ 
        error: 'Subdomain or email already exists' 
      });
    }

    // Check if user email exists in any tenant
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: tenantName,
      domain: `${subdomain}.localhost`,
      subdomain,
      email,
      phone,
      status: 'active',
      subscriptionPlan: 'basic',
      subscriptionStatus: 'active'
    });

    // Create owner user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      tenantId: tenant.id,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'owner',
      status: 'active',
      isEmailVerified: true
    });

    // Generate token
    const token = generateToken(user.id, tenant.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        subscriptionPlan: tenant.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, subdomain } = req.body;

    // Find tenant by subdomain if provided
    let tenant = null;
    if (subdomain) {
      tenant = await Tenant.findOne({ where: { subdomain } });
      if (!tenant) {
        return res.status(404).json({ error: 'Shop not found' });
      }
    }

    // Find user
    const whereClause: any = { email, status: 'active' };
    if (tenant) {
      whereClause.tenantId = tenant.id;
    }

    const user = await User.findOne({
      where: whereClause,
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check tenant status
    if (user.tenant.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate token
    const token = generateToken(user.id, user.tenantId);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        subdomain: user.tenant.subdomain,
        subscriptionPlan: user.tenant.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Tenant, as: 'tenant' }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: user!.role,
        phone: user!.phone,
        avatar: user!.avatar,
        isEmailVerified: user!.isEmailVerified,
        lastLoginAt: user!.lastLoginAt
      },
      tenant: {
        id: user!.tenant.id,
        name: user!.tenant.name,
        subdomain: user!.tenant.subdomain,
        domain: user!.tenant.domain,
        email: user!.tenant.email,
        phone: user!.tenant.phone,
        address: user!.tenant.address,
        logo: user!.tenant.logo,
        subscriptionPlan: user!.tenant.subscriptionPlan,
        subscriptionStatus: user!.tenant.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    await User.update(
      { firstName, lastName, phone },
      { where: { id: req.user.id } }
    );

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Update password
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};