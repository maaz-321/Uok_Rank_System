import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'No authorization token provided' });
};

// 1. QEC Central Superadmin Only
export const isQEC = (req, res, next) => {
  if (req.user && req.user.role === 'qec') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: QEC rights required' });
  }
};

// 2. Auditors Access (Chairman, OEC, QEC)
export const isAuditor = (req, res, next) => {
  if (req.user && ['chairman', 'oec', 'qec'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Audit authorization required' });
  }
};