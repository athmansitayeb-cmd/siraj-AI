const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (!token) return res.status(401).json({ message: 'غير مصرح' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'غير مصرح' });

    next();
  } catch (err) {
    res.status(401).json({ message: 'غير مصرح' });
  }
};

module.exports = { protect };
