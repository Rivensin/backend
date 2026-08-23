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
    movie: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn()
    }
  }
}))

const { prisma } = await import("../config/db.js")
const { default : app } = await import("../app")

describe("GET /movies", () => {
  test("should return 200 when fetch movie successfully", async() => {
    prisma.movie.count.mockResolvedValue(2)

    prisma.movie.findMany.mockResolvedValue([
      {      
        id: "6b07aa53-7715-4801-b45c-bcdeb2176307",
        title: "Eternal Sunshine of the Spotless Mind",
        overview: "Shy Joel Barish and free-spirited Clementine Kruczynski, a couple who undergo a medical procedure to erase each other from their memories after a painful breakup. Much of the story takes place inside Joel's mind as he relives his memories in reverse and fights to keep his love alive.",
        releaseYear: 2004,
        genres: [ "Drama"],
        runtime: null,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/252566df3bbdfce02a007e149e8ffd7eb89c28249543447ddcc8800992b62e36.jpg",
        createdBy: "5c735177-bdc7-4404-9c11-e4ed3e3aa450",
        createdAt: "2026-07-28T16:35:14.108Z",
        creator: {
          id: "5c735177-bdc7-4404-9c11-e4ed3e3aa450",
          name: "testingtesting"
        }
      },
      {
        id: "dcc8af59-a117-4333-a503-6409b5020e91",
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        releaseYear: 1999,
        genres: ["Drama"],
        runtime: 139,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/509ed4bed58e8017877367f192e251fd0c8e362884477fedded04f3e9d290901.png",
        createdBy: "e248188d-acf6-4ff3-b037-aa95172cde9f",
        createdAt: "2026-07-09T19:25:40.231Z",
        creator: {
          id: "e248188d-acf6-4ff3-b037-aa95172cde9f",
          name: "tarantino"
        }
      },
    ])

    const response = await request(app).get('/movies')

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(1)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(2);
  })

  test("should return 200 when search movie successfully", async() => {
    prisma.movie.count.mockResolvedValue(1)

    prisma.movie.findMany.mockResolvedValue([      
      {
        id: "dcc8af59-a117-4333-a503-6409b5020e91",
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        releaseYear: 1999,
        genres: ["Drama"],
        runtime: 139,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/509ed4bed58e8017877367f192e251fd0c8e362884477fedded04f3e9d290901.png",
        createdBy: "e248188d-acf6-4ff3-b037-aa95172cde9f",
        createdAt: "2026-07-09T19:25:40.231Z",
        creator: {
          id: "e248188d-acf6-4ff3-b037-aa95172cde9f",
          name: "tarantino"
        }
      },
    ])

    const response = await request(app).get('/movies').query({search : 'club'})

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(1)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(1);
  })

  test("should return 200 when search movie but found no movie", async() => {
    prisma.movie.count.mockResolvedValue(0)

    prisma.movie.findMany.mockResolvedValue([])

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
      .get('/movies')
      .set('Cookie', `jwt=${token}`)
      .query({search : 'club'})

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(0)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(0);
  })

  test("should return 500 when fetch movie error", async() => {
    prisma.movie.count.mockResolvedValue(1)

    prisma.movie.findMany.mockRejectedValue(new Error ('Internal server error'))

    const response = await request(app).get('/movies')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error');
  })
});

describe("GET movies/my-movies", () => {
  test("should return 200 when fetch my-movie successfully", async() => {
    prisma.movie.count.mockResolvedValue(2)

    prisma.movie.findMany.mockResolvedValue([
      {      
        id: "6b07aa53-7715-4801-b45c-bcdeb2176307",
        title: "Eternal Sunshine of the Spotless Mind",
        overview: "Shy Joel Barish and free-spirited Clementine Kruczynski, a couple who undergo a medical procedure to erase each other from their memories after a painful breakup. Much of the story takes place inside Joel's mind as he relives his memories in reverse and fights to keep his love alive.",
        releaseYear: 2004,
        genres: [ "Drama"],
        runtime: null,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/252566df3bbdfce02a007e149e8ffd7eb89c28249543447ddcc8800992b62e36.jpg",
        createdBy: "5c735177-bdc7-4404-9c11-e4ed3e3aa450",
        createdAt: "2026-07-28T16:35:14.108Z",
        creator: {
          id: "5c735177-bdc7-4404-9c11-e4ed3e3aa450",
          name: "testingtesting"
        }
      },
      {
        id: "dcc8af59-a117-4333-a503-6409b5020e91",
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        releaseYear: 1999,
        genres: ["Drama"],
        runtime: 139,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/509ed4bed58e8017877367f192e251fd0c8e362884477fedded04f3e9d290901.png",
        createdBy: "e248188d-acf6-4ff3-b037-aa95172cde9f",
        createdAt: "2026-07-09T19:25:40.231Z",
        creator: {
          id: "5c735177-bdc7-4404-9c11-e4ed3e3aa450",
          name: "testingtesting"
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
      .get('/movies/my-movies')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(1)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(2);
  })

  test("should return 200 when search my-movie successfully", async() => {
    prisma.movie.count.mockResolvedValue(1)

    prisma.movie.findMany.mockResolvedValue([      
      {
        id: "dcc8af59-a117-4333-a503-6409b5020e91",
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        releaseYear: 1999,
        genres: ["Drama"],
        runtime: 139,
        posterUrl: "https://m.media-amazon.com/images/S/pv-target-images/509ed4bed58e8017877367f192e251fd0c8e362884477fedded04f3e9d290901.png",
        createdBy: "e248188d-acf6-4ff3-b037-aa95172cde9f",
        createdAt: "2026-07-09T19:25:40.231Z",
        creator: {
          id: "e248188d-acf6-4ff3-b037-aa95172cde9f",
          name: "tarantino"
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
      .get('/movies/my-movies')
      .set('Cookie', `jwt=${token}`)
      .query({search : 'club'})

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(1)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(1);
  })

  test("should return 200 when search my-movie but found no movie", async() => {
    prisma.movie.count.mockResolvedValue(0)

    prisma.movie.findMany.mockResolvedValue([])

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
      .get('/movies/my-movies')
      .set('Cookie', `jwt=${token}`)
      .query({search : 'club'})

    expect(response.status).toBe(200)
    expect(response.body.totalPages).toBe(0)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.data).toHaveLength(0);
  })

  test("should return 500 when fetch my-movie error", async() => {
    prisma.movie.count.mockResolvedValue(1)

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    prisma.movie.findMany.mockRejectedValue(new Error ('Internal server error'))

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = await request(app)
      .get('/movies/my-movies')
      .set('Cookie', `jwt=${token}`)

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error');
  })
});