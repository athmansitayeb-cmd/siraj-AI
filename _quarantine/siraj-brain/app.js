const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("siraj-brain يعمل بشكل أسطوري!"));

app.listen(port, () => console.log("siraj-brain يعمل على المنفذ " + port));
