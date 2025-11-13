const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
  let url = fs.existsSync("/home/athman/siraj/url.txt") ? fs.readFileSync("/home/athman/siraj/url.txt", "utf8").trim() : "لم يتم إنشاء الرابط بعد";
  res.send(`<h2>🔗 رابط ngrok الحالي:</h2><p>${url}</p><h2>📊 PM2 لوحة المونيتور:</h2><pre>${require("child_process").execSync("pm2 ls").toString()}</pre>`);
});

app.listen(PORT, () => console.log(`Web display running on http://localhost:${PORT}`));
