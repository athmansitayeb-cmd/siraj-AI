require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'athmansitayeb@gmail.com';

    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      console.log('❌ المستخدم غير موجود');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash('123456', salt);
    user.role = 'admin';
    user.email = email; // normalize to lowercase target
    await user.save();

    console.log(`👑 تم تحديث ${user.name} ليصبح مدير وكلمة المرور تم إعادة تعيينها إلى 123456`);
    process.exit(0);
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  }
})();
