import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Supabase database configuration
const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false // Supabase requires SSL in production
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;