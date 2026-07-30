import { prisma } from "../config/db.js"

const getMovie = async(req,res) => {
  try {
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
  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  }
}

export const getMovieUser = async(req,res) => {
  
  const movie = await prisma.movie.findMany({
    where : {
      createdBy: req.user.id      
    }
  })

  res.status(200).json(movie)
}

export const getMovieById = async(req,res) => {
  const { id } = req.params
  const moviebyId = await prisma.movie.findUnique({
    where : {
      id      
    }
  })

  if (!moviebyId) {
    return res.status(404).json({
      error: "No movies found",
    });
  }

  res.status(200).json(moviebyId)
}

const addMovie = async(req,res) => {
  const {title, overview, releaseYear, genres, posterUrl} = req.body

  const movieExists = await prisma.movie.findFirst({
    where: {
      title,
    }
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
      posterUrl,
      createdBy: req.user.id,
    }
  })

  res.status(201).json({
    status: 'Success',
    data : { movie }
  })
}

const removeMovie = async(req,res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where : {id : req.params.id}
    })

    if(!movie){
      return res.status(404).json({
        error: 'Movie not found'
      })
    }

    if(movie.createdBy !== req.user.id){
      return res.status(403).json({
        error: 'Not allowed to delete this movie'
      })
    }

    await prisma.movie.delete({
      where : { id: req.params.id}
    })

    return res.status(200).json({
      status: "success",
      message: 'Movie removed successfully'
    })
  }catch(error){
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  } 
}

const updateMovie = async(req,res) => {
  const { id } = req.params

  const userId = req.user.id

  const {title, overview, releaseYear, genres, posterUrl} = req.body

  try{
    const existingMovie = await prisma.movie.findUnique({
      where: { id } 
    })

    if (!existingMovie) {
      return res.status(404).json({
        error: 'Movie not found'
      })
    }

    if (existingMovie.createdBy !== userId) {
      return res.status(403).json({
        error: 'Not allowed to update this movie'
      })
    }

    if(title !== existingMovie.title || releaseYear !== existingMovie.releaseYear){    
      const duplicate = await prisma.movie.findFirst({
        where: {
          title,
          releaseYear,
          NOT: {
            id
          }
        }
      })

      if (duplicate) {
        return res.status(409).json({
          error: 'Movie already exists'
        })
      }    
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        overview,
        releaseYear,
        genres,
        posterUrl,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        movie: updatedMovie
      }
    })
  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    });
  }   
}

export {getMovie, addMovie, updateMovie, removeMovie}