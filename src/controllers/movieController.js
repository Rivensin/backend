import { prisma } from "../config/db.js"

const getMovie = async(req,res) => {
  const movie = await prisma.movie.findMany({
    include : {
      creator: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  if (movie.length === 0) {
    return res.status(404).json({
      error: "No movies found",
    });
  }

  res.status(200).json(movie)
}

// const addToWatchList = async(req,res) => {
//   const {movieId, status, rating, notes} = req.body

//   const movie = await prisma.movie.findUnique({
//     where: {id: movieId}
//   })

//   if(!movie){
//     return res.status(404).json({
//       error: 'Movie Not Found'
//     })
//   }

//   const existingMovie = await prisma.watchlistItem.findUnique({
//     where: { userId_movieId : {
//       userId: req.user.id,
//       movieId: movieId
//     }}
//   })

//   if(existingMovie){
//     return res.status(400).json({
//       error: 'Movie already in the watchlist'
//     })
//   }

//   const watchlistItem = await prisma.watchlistItem.create({
//     data : {
//       userId  : req.user.id,
//       movieId,
//       status: status || 'PLANNED',
//       rating,
//       notes
//     }
//   })

//   res.status(201).json({
//     status: 'Success',
//     data : { watchlistItem }
//   })
// }

// const removeFromWatchList = async(req,res) => {
//   const watchListItem = await prisma.WatchlistItem.findUnique({
//     where : {id : req.params.id}
//   })

//   if(!watchListItem){
//     return res.status(401).json({
//       error: 'Watchlist item not found'
//     })
//   }

//   if(watchListItem.userId !== req.user.id){
//     return res.status(403).json({
//       error: 'Not allowed to update this watchlist item'
//     })
//   }

//   await prisma.WatchlistItem.delete({
//     where : { id: req.params.id}
//   })

//   res.status(200).json({
//     status: "success",
//     message: 'Movie removed from watchlist'
//   })
// }

// const updateFromWatchList = async(req,res) => {
//   const {status, rating, notes} = req.body

//   const watchlistItems = await prisma.watchlistItem.findUnique({
//     where: {id: req.params.id}
//   })

//   if(watchlistItems.userId !== req.user.id){
//     return res.status(403).json({
//       error: 'Not allowed to update this watchlist item'
//     })
//   }

//   const updateData = {}
//   if(status !== undefined) updateData.status = status.toUpperCase()
//   if(rating !== undefined) updateData.rating = rating
//   if(notes !== undefined) updateData.notes = notes

//   const updatedItem = await prisma.watchlistItem.update({
//     where: {id: req.params.id},
//     data: updateData    
//   })

//   res.status(200).json({
//     status: 'success',
//     data : {
//       watchlistItems : updatedItem
//     }
//   })
// }


export {getMovie}