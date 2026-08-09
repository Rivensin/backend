import { z } from 'zod' 

const addMovieSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  overview: z.string().trim().min(1, 'Overview is required').min(10, 'Overview must be at least 10 characters').max(500,'Overview maximum 500 characters'),
  releaseYear: z.coerce.number().min(1888, 'Invalid release year').max(new Date().getFullYear(), 'Release year cannot be in the future'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  posterUrl: z.string().url('Invalid poster URL'),  
})

const getMovieSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export { addMovieSchema, getMovieSchema }