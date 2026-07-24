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

//Body Parsing Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//handle cookies
app.use(cookieParser())

//handle CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://watchlist-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//API Routes
app.use('/movies', movieRoutes)
app.use('/auth', authRoutes)
app.use('/watchlist', watchlistRoutes)

export default app