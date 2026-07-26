import express from 'express'
import { getMovie, addMovie } from '../controllers/movieController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { addMovieSchema } from '../validators/movieValidators.js'

const router = express.Router()

router.get('/',getMovie)
router.post('/addMovie', validateRequest(addMovieSchema), authMiddleware, addMovie)

export default router
