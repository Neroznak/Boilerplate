import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().startsWith('redis://'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(5000),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export const config = env;


export const NODE_ENV = env.NODE_ENV;
export const REDIS_URL = env.REDIS_URL;
export const PORT = env.PORT;