import {z} from 'zod'

const registerSchema = z.object({
  name: z.string().trim().min(7, 'Name must be at least 8 characters'),
  email: z.string().min(13, 'Email is required').email().toLowerCase(),
  password: z.string().min(1, 'Password is required').min(7, 'Password must be at least 8 characters')
})

const loginSchema = z.object({  
  email: z.string().min(13, 'Email is required').email().toLowerCase(),
  password: z.string().min(1, 'Password is required')
})

export { registerSchema, loginSchema }