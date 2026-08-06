//EXPRESS SETUP
import cors from 'cors'
import cookieParser from "cookie-parser";
import express from 'express'
import { config } from 'dotenv'
import { connectDB } from './config/db.js'

//Import Routes
import movieRoutes from './routes/movieRoutes.js'
import authRoutes from './routes/authRoutes.js'
import watchlistRoutes from './routes/watchlistRoutes.js'

config()
connectDB()

const app = express()

//handle CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://watchlistmovieapp.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Body Parsing Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//handle cookies
app.use(cookieParser())

//API Routes
app.use('/movies', movieRoutes)
app.use('/auth', authRoutes)
app.use('/watchlist', watchlistRoutes)

export default app