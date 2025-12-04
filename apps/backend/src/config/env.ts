import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables based on APP_STAGE
process.env.APP_STAGE = process.env.APP_STAGE || 'dev';

const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'dev';
const isTesting = process.env.APP_STAGE === 'test';

// Load .env file in development
if (isDevelopment || isTesting) {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Cloudinary Configuration
  USE_CLOUDINARY: z.string().transform(val => val === 'true').default(false),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
}).refine(
  (data) => {
    // If USE_CLOUDINARY is true, Cloudinary credentials are required
    if (data.USE_CLOUDINARY) {
      return !!(data.CLOUDINARY_CLOUD_NAME && data.CLOUDINARY_API_KEY && data.CLOUDINARY_API_SECRET);
    }
    return true;
  },
  {
    message: 'Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) are required when USE_CLOUDINARY is true',
    path: ['USE_CLOUDINARY'],
  }
);

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(e.flatten().fieldErrors, null, 2));
    
    e.issues.forEach((err) => {
      const path = err.path.join('.');
      console.error(`  ${path}: ${err.message}`);
    });
    
    process.exit(1);
  }
  
  throw e;
}

export const isProd = () => env.APP_STAGE === 'production';
export const isDev = () => env.APP_STAGE === 'dev';
export const isTest = () => env.APP_STAGE === 'test';

export default env;
export { env };
