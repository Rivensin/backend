import jwt from 'jsonwebtoken'

const generateToken = (userId, res) => {
  const payload = {
    id : userId
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn : process.env.JWT_EXPIRES_IN || '7d'
  })

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }

  res.cookie('jwt',token,cookieOptions)

}

export default generateToken