import express from 'express'
import { getMovie, getMovieUser, addMovie, updateMovie, getMovieById, removeMovie } from '../controllers/movieController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { addMovieSchema, getMovieSchema } from '../validators/movieValidators.js'

const router = express.Router()

//ambil semua data movie
router.get('/', validateRequest(getMovieSchema,'query'), getMovie)
//ambil data movie by user create 
router.get('/my-movies', authMiddleware, validateRequest(getMovieSchema,'query'), getMovieUser)
//add movie
router.post('/addMovie', authMiddleware, validateRequest(addMovieSchema) , addMovie)
//ambil data movie dari movie id
router.get('/:id', getMovieById)
//edit movie
router.put('/:id', authMiddleware, updateMovie)
//delete movie
router.delete('/:id', authMiddleware, removeMovie)

export default router
