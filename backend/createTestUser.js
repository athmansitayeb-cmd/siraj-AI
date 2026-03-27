import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js"; // صح المسار هنا

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    const passwordHash = await bcrypt.hash("password", 10);

    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: passwordHash
    });

    await user.save();
    console.log("✅ User created:", user);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
