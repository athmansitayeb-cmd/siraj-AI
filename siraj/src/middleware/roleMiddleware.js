const roleCheck = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'ليس لديك صلاحية الوصول' });
  }
  next();
};

module.exports = roleCheck;
