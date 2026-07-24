import express from 'express'
import { register, login, logout, profile } from '../controllers/authController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { registerSchema, loginSchema } from '../validators/authValidator.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', validateRequest(registerSchema), register)
router.post('/login', validateRequest(loginSchema), login)
router.get('/profile', authMiddleware, profile)
router.post('/logout',logout)

export default router
