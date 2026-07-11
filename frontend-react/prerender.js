import fs from "fs";
import { seoRoutes } from "./src/utils/seo.routes.js";

const routesToPrerender = Object.entries(seoRoutes)
  .filter(([_, cfg]) => cfg.index)
  .map(([route]) => route);

for (const route of routesToPrerender) {
  const file = `dist${route === "/" ? "/index" : route}.html`;

  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, "utf8");

  const seo = seoRoutes[route];

  const canonical = `https://siraj.software${route === "/" ? "" : route}`;

  html = html
    .replace(/<title>.*<\/title>/, `<title>${seo.title}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${seo.description}">`
    )
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace(/<meta name="robots"[^>]*>/g, "")
    .replace(
      "</head>",
      `
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
</head>
`
    );

  fs.writeFileSync(file, html);
}
