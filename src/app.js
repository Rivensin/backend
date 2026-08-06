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
app.use((req, res, next) => {
  console.log({
    requestOrigin: req.headers.origin,
    allowedOrigin,
  });
  next();
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

console.log({
  CLIENT_URL: process.env.CLIENT_URL,
  type: typeof process.env.CLIENT_URL,
});

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