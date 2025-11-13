const User = require('../models/User');

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, users });
};

const makeAdmin = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

  user.role = 'admin';
  await user.save();
  res.json({ success: true, message: `${user.name} تم ترقيته إلى مدير` });
};

module.exports = { getAllUsers, makeAdmin };
