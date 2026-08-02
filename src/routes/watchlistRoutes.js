import express from 'express'
import { addToWatchList, removeFromWatchList, updateFromWatchList, getWatchlist, getWatchlistDetails } from '../controllers/watchlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { WatchlistSchema } from '../validators/watchlistValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getWatchlist)

router.get('/:id', getWatchlistDetails)

router.delete('/:id',removeFromWatchList)

router.post('/:id', validateRequest(WatchlistSchema), addToWatchList)

router.put('/:id',validateRequest(WatchlistSchema), updateFromWatchList)

export default router
