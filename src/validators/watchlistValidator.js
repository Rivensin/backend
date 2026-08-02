import {z} from 'zod'

const WatchlistSchema = z.object({  
  status: z.enum([
    "PLANNED",
    "WATCHING",
    "COMPLETED",
    "DROPPED"
  ],{error : () => ({
    message: "Status must be one of: PLANNED,  WATCHING, COMPLETED, DROPPED"
  })}),
  rating: z.coerce.number().int('Rating must be in integer').min(1,'Rating must be between 1 and 10').max(10,'Rating must be between 1 and 10'),
  notes: z.string().max(500,'Notes must be less than 500 characters').optional()
})

export { WatchlistSchema }