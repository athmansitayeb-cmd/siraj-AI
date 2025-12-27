import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Sequelize, DataTypes } from "sequelize";

import { processInput } from "./brain.js";

const app = express();
const PORT = 9090;
const JWT_SECRET = "siraj_super_secret";

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./siraj.db",
  logging: false,
});

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
});

await sequelize.sync();

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const hash = await bcrypt.hash(password, 10);
  try {
    await User.create({ username, password: hash });
    res.json({ message: "User created" });
  } catch {
    res.status(400).json({ error: "User exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "يرجى إرسال نص الرسالة." });

  try {
    const result = await processInput(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Brain processing failed", details: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 SIRAJ backend running on port ${PORT}`);
});
