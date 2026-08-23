import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import { describe, test, expect } from "@jest/globals";
import { jest } from '@jest/globals'
import request from "supertest";

config()

jest.unstable_mockModule('../config/db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}))

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn()
  }
}))

const { prisma } = await import("../config/db.js")
const { default : app } = await import("../app")
const { default: bcrypt } = await import ('bcryptjs')

describe("POST /auth/register", () => {
  test("should return 400 when email already exist", async() => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'testingExist@gmail.com'
    })

    const response  = await request(app)
      .post('/auth/register')
      .send({
        name: 'testingExist',
        email: 'testingExist@gmail.com',
        password : 'testingwrong'
      })

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User already exists');
  });

  test("should return 201 when register successfully", async() => {
    prisma.user.findUnique.mockResolvedValue(null)

    bcrypt.genSalt.mockResolvedValue('salt')
    bcrypt.hash.mockResolvedValue('hashedPassword')

    prisma.user.create.mockResolvedValue({
      id:'5c735177-bdc7-4404-9c11-e4ed3e3aa450',
      name: 'testingNew',
      email: 'testingNew@gmail.com',
      password : 'hashedPassword'
    })

    const response  = await request(app)
      .post('/auth/register')
      .send({
        name: 'testingNew',
        email: 'testingNew@gmail.com',
        password : 'testingNew'
      })

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'testingNew',
        email: 'testingNew@gmail.com',
        password: 'hashedPassword'
      }
    })
  });
});

describe("POST /auth/login", () => {
  test("should return 401 when user doesnt exist", async() => {
    prisma.user.findUnique.mockResolvedValue(null)

    const response  = await request(app)
      .post('/auth/login')
      .send({
        email: 'testingwrong@gmail.com',
        password : 'testingwrong'
      })

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('User does not exist');
  });

  test("should return 401 when password is incorrect", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'testingcorrect@gmail.com',
      password: 'testingcorrect'
    })

    bcrypt.compare.mockResolvedValue(false)

    const response  = await request(app)
      .post('/auth/login')
      .send({
        email: 'testingcorrect@gmail.com',
        password : 'testingwrong'
      })

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });

  test("should login successfully with correct credentials", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'testingcorrect@gmail.com',
      password: 'testingcorrect'
    })

    bcrypt.compare.mockResolvedValue(true)

    const response  = await request(app)
      .post('/auth/login')
      .send({
        email: 'testingcorrect@gmail.com',
        password : 'testingcorrect'
      })

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User login successfully');
    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.headers['set-cookie'][0]).toContain('jwt=')

  });
});

describe("POST /auth/logout", () => {
  test("should logout successfully and clear Cookie", async() => {
    const response = await request(app).post('/auth/logout')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('User logged out successfully')    
    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.headers['set-cookie'][0]).toContain('jwt=')
  });
});

describe("GET /auth/profile", () => {
  test("should return 401 when accessing profile without authentication", async() => {
    const response  = await request(app).get('/auth/profile')      

    expect(response.status).toBe(401);
  }); 
  
  test("should return 200 when successfully find user", async() => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'user001'
    })

    const token = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response  = await request(app)
      .get('/auth/profile')
      .set('Cookie', `jwt=${token}`)      

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      name: 'user001'
    });

  });  
});