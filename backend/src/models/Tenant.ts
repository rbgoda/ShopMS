import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TenantAttributes {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  theme?: object;
  settings?: object;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TenantCreationAttributes extends Optional<TenantAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Tenant extends Model<TenantAttributes, TenantCreationAttributes> implements TenantAttributes {
  public id!: string;
  public name!: string;
  public domain!: string;
  public subdomain!: string;
  public email!: string;
  public phone?: string;
  public address?: string;
  public logo?: string;
  public theme?: object;
  public settings?: object;
  public status!: 'active' | 'inactive' | 'suspended';
  public subscriptionPlan!: 'basic' | 'premium' | 'enterprise';
  public subscriptionStatus!: 'active' | 'cancelled' | 'past_due';
  public stripeCustomerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
      allowNull: false,
      defaultValue: 'basic',
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'cancelled', 'past_due'),
      allowNull: false,
      defaultValue: 'active',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    timestamps: true,
  }
);

export default Tenant;