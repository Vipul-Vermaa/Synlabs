import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// Middleware to check if user is Admin
export const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is Applicant
export const requireApplicant = (req, res, next) => {
  if (req.user.userType !== 'Applicant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Applicant privileges required.'
    });
  }
  next();
};

// Middleware to check if user is either Admin or Applicant
export const requireUser = (req, res, next) => {
  if (req.user.userType !== 'Admin' && req.user.userType !== 'Applicant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Valid user privileges required.'
    });
  }
  next();
};
