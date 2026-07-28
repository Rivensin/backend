import express from 'express'
import { getMovie, getMovieUser, addMovie, updateMovie, getMovieById } from '../controllers/movieController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { addMovieSchema } from '../validators/movieValidators.js'

const router = express.Router()

router.get('/', getMovie)
router.get('/my-movies', authMiddleware, getMovieUser)
router.post('/addMovie', authMiddleware, validateRequest(addMovieSchema) , addMovie)
router.get('/:id', getMovieById)
router.put('/:id', authMiddleware, updateMovie)

export default router
