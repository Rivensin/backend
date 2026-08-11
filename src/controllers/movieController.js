import { prisma } from "../config/db.js"

const limit = 10

const getMovie = async(req,res) => {
  //mengambil params page
  const page = Number(req.query.page) || 1

  //menentukan skip
  const skip = (page - 1) * limit

  //mengambil params search
  const search = req.query.search?.trim() || ''

  //definisi where title movie contains params search 
    const where = search
      ? 
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : 
      undefined;

  try {    
    //mengambil total movie dari params search
    const total = await prisma.movie.count({
      where
    });

    //mengambil total pages dari total movie
    const totalPages = Math.ceil(total / limit);

    //menarik data movie
    const movie = await prisma.movie.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        title: 'asc'
      },   
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

    res.status(200).json({
      totalPages,
      currentPage: page,
      data: movie
    })

  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  }
} 

export const getMovieUser = async(req,res) => {
  const page = Number(req.query.page) || 1

  const search = req.query.search || ''

  const skip = (page - 1) * limit

  const where = {
    createdBy: req.user.id,
    ...(search && {
      title : {
        contains: search,
        mode: 'insensitive'
      }
    })
  }
    
  try {
    const total = await prisma.movie.count({
      where,
    });

    const totalPages = Math.ceil(total / limit);

    const movie = await prisma.movie.findMany({
      skip,
      take: limit,
      orderBy: {
        title: 'asc'
      },
      where,
    })
    
    res.status(200).json({
      totalPages,
      currentPage: page,
      data: movie
    })
  }catch(error){
    console.error(error)

    return res.status(500).json({
      error: "Internal server error",
    })
  }
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

  const url = new URL(posterUrl)

  if ( url.protocol !== "https:" || url.hostname !== "m.media-amazon.com") {
    return res.status(400).json({
      error: "Poster URL must be from m.media-amazon.com",
    });
  }

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