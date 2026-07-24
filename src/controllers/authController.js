import { prisma } from "../config/db.js"
import bcrypt from 'bcryptjs'
import generateToken from "../utils/generateToken.js"

const register = async (req, res) => {
  const { name, email, password } = req.body

  //Check if user already exists
  const userExist = await prisma.user.findUnique({
    where: {
      email : email
    }
  })

  if(userExist){
    return res.status(400).json({
      error: 'User already exists'
    })
  }

  //Hash Password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create User
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })

  //generate JWT Token
  const token = generateToken(user.id,res)

  res.status(201).json({
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        name: name,
        email: email
      },
      token
  }})
}

const login = async (req, res) => {
  const { email, password } = req.body

  //Check if user already exists
  const userExist = await prisma.user.findUnique({
    where: {
      email : email
    }
  })

  if(!userExist){
    return res.status(401).json({
      error: 'User does not exist'
    })
  }

  //Verify Password
  const isPasswordValid = await bcrypt.compare(password, userExist.password)

  if(!isPasswordValid){
    return res.status(401).json({
      error: 'Invalid email or password'
    })
  }

  //generate JWT Token
  const token = generateToken(userExist.id,res)

  res.status(201).json({
    message: 'User login successfully',
    data: {
      user: {
        id: userExist.id,
        email: email
      },
      token
  }})
}

const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expire: new Date(0),
  })

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully'
  })
}

const profile = async (req,res) => {
  const user = await prisma.user.findUnique({
    where : {
      id: req.user.id
    },
    select: {
      id: true,
      name: true
    }
  })

  if(!user){
    return res.status(404).json({
      error: 'User not found'
    })
  }

  res.json(user)
}

export { register, login, logout, profile }