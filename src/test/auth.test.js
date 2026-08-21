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
    }
  }
}))

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn()
  }
}))

const { prisma } = await import("../config/db.js")
const { default : app } = await import("../app")
const { default: bcrypt } = await import ('bcryptjs')

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