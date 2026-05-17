import { chromium } from "playwright";
import fs from "fs";

const pages = {
  "/": {
    title: "SIRAJ AI - Intelligent Automation Platform",
    description:
      "SIRAJ AI is a next-generation automation and intelligence platform for building smart workflows and AI-driven systems."
  },
  "/about": {
    title: "About SIRAJ AI – Intelligent Automation Platform",
    description:
      "Learn about SIRAJ AI, an advanced platform for building AI agents, automating workflows, and improving productivity."
  },
  "/features": {
    title: "SIRAJ AI Features",
    description:
      "Explore powerful AI automation features, intelligent workflows, and smart integrations."
  },
  "/pricing": {
    title: "SIRAJ AI Pricing",
    description:
      "Simple and scalable pricing plans for AI automation and intelligent systems."
  },
  "/docs": {
    title: "SIRAJ AI Documentation",
    description:
      "Developer documentation and API references for SIRAJ AI platform."
  },
  "/ai": {
    title: "AI Platform – SIRAJ AI",
    description:
      "Advanced AI platform for intelligent automation and autonomous systems."
  },
  "/platform": {
    title: "SIRAJ AI Platform",
    description:
      "Build scalable AI systems and automate workflows using SIRAJ AI."
  }
};

const routes = Object.keys(pages);

const browser = await chromium.launch({
  args: ["--no-sandbox"]
});

const page = await browser.newPage();

for (const route of routes) {
  const url = `http://127.0.0.1:4173${route}`;
  const canonical = `https://siraj.software${route === "/" ? "" : route}`;

  console.log("visiting:", url);

  await page.goto(url, {
    waitUntil: "networkidle"
  });

  await page.waitForTimeout(800);

  let html = await page.content();

  // ---------------- TITLE ----------------
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${pages[route].title}</title>`
  );

  // ---------------- DESCRIPTION ----------------
  if (!html.includes('name="description"')) {
    html = html.replace(
      "</head>",
      `<meta name="description" content="${pages[route].description}">
      </head>`
    );
  } else {
    html = html.replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${pages[route].description}">`
    );
  }

// ---------------- REMOVE OLD SEO TAGS ----------------
  html = html.replace(/<link rel="canonical"[^>]*>/g, "");
  html = html.replace(/<meta name="robots"[^>]*>/g, "");

  // ---------------- INSERT CLEAN SEO TAGS ----------------
  html = html.replace(
    "</head>",
    `
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
    </head>
    `
  );

  // ---------------- OUTPUT FILE ----------------
  const filePath =
    `dist${route === "/" ? "/index" : route}.html`;

  fs.mkdirSync(
    filePath.substring(0, filePath.lastIndexOf("/")),
    { recursive: true }
  );

  fs.writeFileSync(filePath, html);

  console.log("saved:", filePath);
}

await browser.close();
