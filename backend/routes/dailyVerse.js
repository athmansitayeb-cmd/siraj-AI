import express from "express";
import { verses } from "../data/quran.js";

const router = express.Router();

router.get("/daily-verse", (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // نحول التاريخ لرقم ثابت
    const index =
      today.split("-").reduce((a, b) => a + Number(b), 0) %
      verses.length;

    const verse = verses[index];

    res.json(verse);

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

export default router;
