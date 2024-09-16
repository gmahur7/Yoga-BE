const secretKey = process.env.JWT_KEY
const JWT = require('jsonwebtoken');
const UserModel = require('../Models/UserModel');

const generateToken = (id) => {
  return JWT.sign({ id }, secretKey, { expiresIn: '1h' },)
}

const isAuthenticated = async (req, res, next) => {
  let token;
    // console.log("cookie",req.cookies)
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    } else {
        token = req.cookies.access_token;
    }

    // console.log("token",token)

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = JWT.verify(token, secretKey);
    // console.log("dec", decoded);

    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
  }

    req.user = user;
    next();

  } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired.' });
        }
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
  generateToken,
  isAuthenticated
};
