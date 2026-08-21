//FOR LOCAL DEVELOPMENT
import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { config } from 'dotenv'

config()

await connectDB()

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
    await disconnectDB()
    process.exit(1)
  })
})