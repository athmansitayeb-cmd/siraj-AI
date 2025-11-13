const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("siraj-all يعمل بشكل أسطوري!"));

app.listen(port, () => console.log("siraj-all يعمل على المنفذ " + port));
