import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().regex(/^\d+$/)
});

export const env = envSchema.parse(process.env);