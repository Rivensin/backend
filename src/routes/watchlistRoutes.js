import express from 'express'
import { addToWatchList, removeFromWatchList, updateFromWatchList } from '../controllers/watchlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { addToWatchlistSchema, UpdateWatchlistSchema } from '../validators/watchlistValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', validateRequest(addToWatchlistSchema), addToWatchList)

router.delete('/:id',removeFromWatchList)

router.put('/:id',validateRequest(UpdateWatchlistSchema), updateFromWatchList)

export default router
