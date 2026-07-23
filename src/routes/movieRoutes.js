import express from 'express'
import { getMovie } from '../controllers/movieController.js'

const router = express.Router()

router.get('/',getMovie)

export default router
