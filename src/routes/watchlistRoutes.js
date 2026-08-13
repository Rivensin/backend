import express from 'express'
import { addToWatchList, removeFromWatchList, updateFromWatchList, getWatchlist, getWatchlistDetails, getWatchlistStats } from '../controllers/watchlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { WatchlistSchema } from '../validators/watchlistValidator.js'
import { getMovieSchema } from '../validators/movieValidators.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', authMiddleware, validateRequest(getMovieSchema,'query'), getWatchlist)

router.get('/stats', authMiddleware, getWatchlistStats)

router.get('/:id', authMiddleware, getWatchlistDetails)

router.delete('/:id', authMiddleware, removeFromWatchList)

router.post('/:id', validateRequest(WatchlistSchema), addToWatchList)

router.put('/:id',validateRequest(WatchlistSchema), updateFromWatchList)

export default router
