import { z } from 'zod';

const credentials = z.object({
  phone: z.string().trim().min(8).max(20),
  password: z.string().min(8).max(72),
}).strict();

export const registerSchema = credentials.extend({});
export const loginSchema = credentials.extend({});
export const verifyOtpSchema = z.object({
  challengeId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid challenge ID.'),
  code: z.string().regex(/^\d{6}$/, 'OTP must contain 6 digits.'),
}).strict();
