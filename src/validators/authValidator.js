import {z} from 'zod'

const registerSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  email: z.string().trim().email('Email is invalid').toLowerCase(),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters')
})

const loginSchema = z.object({  
  email: z.string().trim().email('Email is invalid').toLowerCase(),
  password: z.string().min(1, 'Password is required')
})

export { registerSchema, loginSchema }