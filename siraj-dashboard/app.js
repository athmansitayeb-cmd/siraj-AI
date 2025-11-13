const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// خدمة الملفات الثابتة
app.use(express.static("public"));

// مسار افتراضي
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

app.listen(port, () => console.log("siraj-dashboard يعمل على المنفذ " + port));
