const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("siraj-monitor يعمل بشكل أسطوري!"));

app.listen(port, () => console.log("siraj-monitor يعمل على المنفذ " + port));
