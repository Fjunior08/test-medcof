import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const registerBodySchema = z.object({
  email: z.string().trim().min(1).max(320).email('Invalid email format'),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z.string().trim().min(1).max(320).email('Invalid email format'),
  password: z.string().min(1).max(128),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
