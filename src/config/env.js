import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OTP_SECRET: z.string().min(32),
  OTP_EXPIRES_MINUTES: z.coerce.number().int().min(1).max(30).default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(10).default(60),
  CORS_ORIGINS: z.string().default('*'),
  WHATSAPP_PROVIDER: z.enum(['console', 'twilio', 'green-api']).default('console'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  GREEN_API_URL: z.string().url().default('https://api.green-api.com'),
  GREEN_API_INSTANCE: z.string().optional(),
  GREEN_API_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (
  parsed.data.WHATSAPP_PROVIDER === 'green-api' &&
  (!parsed.data.GREEN_API_INSTANCE || !parsed.data.GREEN_API_TOKEN)
) {
  console.error('Green API credentials are required when WHATSAPP_PROVIDER=green-api');
  process.exit(1);
}

if (
  parsed.data.WHATSAPP_PROVIDER === 'twilio' &&
  (!parsed.data.TWILIO_ACCOUNT_SID ||
    !parsed.data.TWILIO_AUTH_TOKEN ||
    !parsed.data.TWILIO_WHATSAPP_FROM)
) {
  console.error('Twilio credentials are required when WHATSAPP_PROVIDER=twilio');
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS === '*'
  ? '*'
  : env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
