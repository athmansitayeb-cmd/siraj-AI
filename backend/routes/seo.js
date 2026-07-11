import express from "express";
import Workspace from "../models/Workspace.js";

const router = express.Router();

router.get("/workspace/:slug", async (req, res) => {
  const ws = await Workspace.findOne({
    "seo.slug": req.params.slug,
    "seo.indexable": true
  });

  if (!ws) {
    return res.status(404).send("Not Found");
  }

  const html = `
<!doctype html>
<html>
<head>
  <title>${ws.seo.title}</title>
  <meta name="description" content="${ws.seo.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://siraj.software/workspace/${ws.seo.slug}">
</head>
<body>
  <h1>${ws.seo.title}</h1>
  <p>${ws.seo.description}</p>
</body>
</html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
