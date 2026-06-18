import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const videoUploadSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  folderId: z.string().optional(),
  tags: z.string().optional(), // comma separated
})

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  folderId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const folderSchema = z.object({
  name: z.string().min(1).max(100),
})

export const apiKeySchema = z.object({
  name: z.string().min(1).max(50),
})

export const analyticsViewSchema = z.object({
  videoId: z.string(),
  duration: z.number().min(0).optional(),
})
