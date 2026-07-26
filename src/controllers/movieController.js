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

const addMovie = async(req,res) => {
  const {title, overview, releaseYear, genres, posterUrl} = req.body

  const movieExists = await prisma.movie.findUnique({
    where: title
  })

  if(movieExists){
    return res.status(409).json({
      error: 'Title already exists'
    })
  }

  const movie = await prisma.movie.create({
    data : {
      title,
      overview,
      releaseYear,
      genres,
      posterUrl
    }
  })

  res.status(201).json({
    status: 'Success',
    data : { movie }
  })
}

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


export {getMovie, addMovie}