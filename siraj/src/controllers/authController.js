const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });

    // case-insensitive email check
    const existing = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ success: false, message: 'البريد مستخدم بالفعل' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: generateToken(user._id) });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'الرجاء إدخال البريد وكلمة المرور' });

    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'البريد أو كلمة المرور غير صحيحة' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'البريد أو كلمة المرور غير صحيحة' });

    user.lastLogin = Date.now();
    await user.save();

    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'غير مصرح' });
    res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

module.exports = { registerUser, loginUser, getProfile };
