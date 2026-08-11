import { prisma } from "../config/db.js"

const limit = 10

const validStatuses = ["PLANNED", "WATCHING", "COMPLETED", "DROPPED"];

const getWatchlist = async (req,res) => {
  const page = Number(req.query.page) || 1

  const skip = (page - 1) * limit

  const search = req.query.search?.trim() || ''

  const status = req.query.status || ''

  if(status && !validStatuses.includes(status)){
    return res.status(400).json({
      error: "Invalid watchlist status",
    });
  }

  const where = {
    userId: req.user.id,
    ...(search && {
      movie : {
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }
    }),
    ...(status && {
      status
    })
  }

  try {
    const total = await prisma.watchlistItem.count({
      where,
    })

    const totalPages = Math.ceil(total/limit)

    const watchlist = await prisma.WatchlistItem.findMany({
      skip,
      take: limit,
      orderBy: {
        movie : {
          title: 'asc'
        }
      },
      where,
      select: {
        id: true,
        status: true,
        rating: true,
        notes: true,
        createdAt: true,
      
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          }
        }
      }
    })

    res.status(200).json({
      currentPage : page,
      totalPages,
      data : watchlist
    })

  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  } 
}

const getWatchlistDetails = async (req,res) => {
  try {
    const watchlist = await prisma.WatchlistItem.findUnique({
      where: {
        id: req.params.id
      },
      select: {
        id: true,
        status: true,
        rating: true,
        notes: true,

        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          }
        }
      }
    })

    res.status(200).json(watchlist)

  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  } 
}

const addToWatchList = async(req,res) => {
  const {status, rating, notes} = req.body
  const { id } = req.params

  const movie = await prisma.movie.findUnique({
    where: {
      id
    }
  })

  if(!movie){
    return res.status(404).json({
      error: 'Movie Not Found'
    })
  }

  const existingMovie = await prisma.watchlistItem.findUnique({
    where: { userId_movieId : {
      userId: req.user.id,
      movieId: id
    }}
  })

  if(existingMovie){
    return res.status(400).json({
      error: 'Movie already in the watchlist'
    })
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data : {
      userId  : req.user.id,
      movieId : id,
      status: status || 'PLANNED',
      rating,
      notes
    }
  })

  res.status(201).json({
    status: 'Success',
    data : { watchlistItem }
  })
}

const removeFromWatchList = async(req,res) => {
  try {
    const watchListItem = await prisma.WatchlistItem.findUnique({
      where : {id : req.params.id}
    })

    if(!watchListItem){
      return res.status(401).json({
        error: 'Watchlist item not found'
      })
    }

    if(watchListItem.userId !== req.user.id){
      return res.status(403).json({
        error: 'Not allowed to update this watchlist item'
      })
    }

    await prisma.WatchlistItem.delete({
      where : { id: req.params.id}
    })

    res.status(200).json({
      status: "success",
      message: 'Movie removed from watchlist'
    })
  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  }
}

const updateFromWatchList = async(req,res) => {
  const {status, rating, notes} = req.body

  try{
    const watchlistItems = await prisma.watchlistItem.findUnique({
      where: {id: req.params.id}
    })

    if(watchlistItems.userId !== req.user.id){
      return res.status(403).json({
        error: 'Not allowed to update this watchlist item'
      })
    }

    const updateData = {}
    if(status !== undefined) updateData.status = status.toUpperCase()
    if(rating !== undefined) updateData.rating = rating
    if(notes !== undefined) updateData.notes = notes

    const updatedItem = await prisma.watchlistItem.update({
      where: {id: req.params.id},
      data: updateData    
    })

    res.status(200).json(updatedItem)
  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  }
}

export {addToWatchList, removeFromWatchList, updateFromWatchList, getWatchlist, getWatchlistDetails}