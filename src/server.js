import express from 'express'
import { config } from 'dotenv'
import { connectDB, disconnectDB } from './config/db.js'

//Import Routes
import movieRoutes from './routes/movieRoutes.js'
import authRoutes from './routes/authRoutes.js'
import watchlistRoutes from './routes/watchlistRoutes.js'

config()
connectDB()

const app = express()

//Body Parsing Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//API Routes
app.use('/movies', movieRoutes)
app.use('/auth', authRoutes)
app.use('/watchlist', watchlistRoutes)

const PORT = 5001

const server = app.listen(PORT, () => {
  console.log(`server running on port : ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection : ',err)
  server.close(async() => {
    await disconnectDB()
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.error('uncaughtException : ',err)
  server.close(async() => {
    await disconnectDB()
    process.exit(1)
  })
})

process.on('SIGTERM', (err) => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(async() => {
    disconnectDB()
    process.exit(1)
  })
})