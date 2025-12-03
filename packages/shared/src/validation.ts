import { z } from 'zod';

// Validation schemas using Zod

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

export const videoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  duration: z.number().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type UserInput = z.infer<typeof userSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
