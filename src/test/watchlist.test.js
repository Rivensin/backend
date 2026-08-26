import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import { describe, test, expect } from "@jest/globals";
import { jest } from '@jest/globals'
import request from "supertest";

config()

jest.unstable_mockModule('../config/db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    watchlistItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    }
  }
}))

const { prisma } = await import("../config/db.js")
const { default : app } = await import("../app")

describe("GET /watchlist", () => {
  test("should return 200 when fetch watchlist successfully", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.count.mockResolvedValue(1)

    prisma.watchlistItem.findMany.mockResolvedValue([
      {      
        id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
        status: "PLANNED",
        rating: 1,
        notes: 'notes 1',
        createdAt: '2026-08-11 17:29:48.851',        
        movie: {
          id: "25335d4e-1b90-41a1-94ff-bbcc1ed545f9",
          title: "The Shawshank Redemption",
          posterUrl: 'https://m.media-amazon.com/images/S/pv-target-images/851ab8ca1caf85fc12dbf43c08d56b63af948c4dd8ceba2992ee487234abd9bc.jpg'
        }
      }      
    ])

    const response = await request(app)
      .get('/watchlist')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1);
  })

  test("should return 400 when fetch watchlist with invalid status", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = await request(app)
      .get('/watchlist')
      .set('Cookie', `jwt=${token}`)
      .query({
        status: 'INVALID'
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Invalid watchlist status')
  })

  test("should return 500 when fetch movie error", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.count.mockResolvedValue(null)

    prisma.watchlistItem.findMany.mockRejectedValue(new Error ('Internal server error'))

    const response = await request(app)
      .get('/watchlist')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error');
  })
});

describe("GET /watchlist/stats", () => {
  test("should return 200 when fetch watchlist status successfully", async() => {
    prisma.watchlistItem.groupBy.mockResolvedValue([
      {              
        status: "PLANNED",        
        _count: {
          _all: 3
        }        
      },
      {              
        status: "DROPPED",        
        _count: {
          _all: 3
        }        
      }, 
    ])

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = await request(app)
      .get('/watchlist/stats')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2);
  })

  test("should return 500 when fetch watchlist stats error", async() => {
    prisma.watchlistItem.groupBy.mockRejectedValue(new Error ('Internal server error'))

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = await request(app)
      .get('/watchlist/stats')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error');
  })
});

describe("GET /watchlist/:id", () => {
  test("should return 200 when getWatchlistDetails successfully", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue([
      {      
        id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
        status: "PLANNED",
        rating: 1,
        notes: 'notes 1',
        movie: {
          id: "25335d4e-1b90-41a1-94ff-bbcc1ed545f9",
          title: "The Shawshank Redemption",
          posterUrl: 'https://m.media-amazon.com/images/S/pv-target-images/851ab8ca1caf85fc12dbf43c08d56b63af948c4dd8ceba2992ee487234abd9bc.jpg'
        }
      }      
    ])

    const response = await request(app)
      .get('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')      
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(200)
  })

  test("should return 500 when getWatchlistDetails error", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockRejectedValue(new Error ('Internal server error'))

    const response = await request(app)
      .get('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')      
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(500)
  })
});

describe("POST /watchlist/:id", () => {
  test("should return 404 when add watchlist but movie doesnt exist", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.movie.findUnique.mockResolvedValue(null)

    const response = await request(app)
      .post('/watchlist/6b07aa53-7715-4801-b45c-bcdeb2176307')
      .set('Cookie', `jwt=${token}`)
      .send({
        userId  : 1,
        movieId : '6b07aa53-7715-4801-b45c-bcdeb2176307',
        status: 'PLANNED',
        rating: 1,
        notes: 'example'
      })

    expect(response.status).toBe(404)    
    expect(response.body.error).toBe('Movie Not Found');
  })

  test("should return 400 when add movie already in the watchlist", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.movie.findUnique.mockResolvedValue(
      {      
        id: "6b07aa53-7715-4801-b45c-bcdeb2176307",
        title: "Eternal Sunshine of the Spotless Mind",        
      }      
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      movieId: "6b07aa53-7715-4801-b45c-bcdeb2176307",
      userId: 1,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    const response = await request(app)
      .post('/watchlist/6b07aa53-7715-4801-b45c-bcdeb2176307')
      .set('Cookie', `jwt=${token}`)
      .send({
        userId  : 1,
        movieId : '6b07aa53-7715-4801-b45c-bcdeb2176307',
        status: 'PLANNED',
        rating: 1,
        notes: 'example'
      })

    expect(response.status).toBe(400)    
    expect(response.body.error).toBe('Movie already in the watchlist');
  })

  test("should return 200 when register successfully", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.movie.findUnique.mockResolvedValue(
      {      
        id: "6b07aa53-7715-4801-b45c-bcdeb2176307",
        title: "Eternal Sunshine of the Spotless Mind",        
      }      
    )

    prisma.watchlistItem.findUnique.mockResolvedValue(null)

    prisma.watchlistItem.create.mockResolvedValue({
      userId  : 1,
      movieId : '6b07aa53-7715-4801-b45c-bcdeb2176309',
      status: 'PLANNED',
      rating: 1,
      notes: 'example'
    })

    const response = await request(app)
      .post('/watchlist/6b07aa53-7715-4801-b45c-bcdeb2176309')
      .set('Cookie', `jwt=${token}`)
      .send({
        userId  : 1,
        movieId : '6b07aa53-7715-4801-b45c-bcdeb2176309',
        status: 'PLANNED',
        rating: 1,
        notes: 'example'
      })

    expect(response.status).toBe(201)
  })
});

describe("DELETE /movies/:id", () => {
  test("should return 401 when delete watchlist that doesnt exist", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique(null)

    const response = await request(app)
      .delete('/watchlist/6b07aa53-7715-4801-b45c-bcdeb2176307')
      .set('Cookie', `jwt=${token}`)
    
    expect(response.status).toBe(401)    
    expect(response.body.error).toBe('Watchlist item not found');
  })

  test("should return 403 when delete watchlist that doesnt createdby user", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      userId: 2,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    const response = await request(app)
      .delete('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')
      .set('Cookie', `jwt=${token}`)
    
    expect(response.status).toBe(403)    
    expect(response.body.error).toBe('Not allowed to update this watchlist item');
  })

  test("should return 200 when delete watchlist successfully", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      userId: 1,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    prisma.watchlistItem.delete.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",        
    })

    const response = await request(app)
      .delete('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')
      .set('Cookie', `jwt=${token}`)
    
    expect(response.status).toBe(200)    
    expect(response.body.status).toBe('success');
  })
});

describe("PUT /movies/:id", () => {
  test("should return 403 when edit watchlist that doesnt belong to user", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      userId: 2,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    const response = await request(app)
      .put('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')
      .set('Cookie', `jwt=${token}`)
      .send({        
        status: 'PLANNED',
        rating: 2,
        notes: 'edit example'
      })
    

    expect(response.status).toBe(403)    
    expect(response.body.error).toBe('Not allowed to update this watchlist item');
  })

  test("should return 200 when edit watchlist successfully", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      userId: 1,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    prisma.watchlistItem.update.mockResolvedValue({
      status: "PLANNED",
      rating: 2,
      notes: 'notes 1',
    })

    const response = await request(app)
      .put('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')
      .set('Cookie', `jwt=${token}`)
      .send({
        status: "PLANNED",
        rating: 2,
        notes: 'notes 1',
      })
    
    expect(response.status).toBe(200)    
  })

  test("should return 500 when getWatchlistDetails error", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    prisma.watchlistItem.findUnique.mockResolvedValue({      
      id: "23f29fc5-3955-48e7-aeed-4ad4dfacb5db",
      userId: 1,
      status: "PLANNED",
      rating: 1,
      notes: 'notes 1',      
    })

    prisma.watchlistItem.update.mockRejectedValue(new Error ('Internal server error'))

    const response = await request(app)
      .put('/watchlist/23f29fc5-3955-48e7-aeed-4ad4dfacb5db')
      .set('Cookie', `jwt=${token}`)
      .send({
        status: "PLANNED",
        rating: 2,
        notes: 'notes 1',
      })
    
    expect(response.status).toBe(500)  
  })

  
});