module.exports = {
  include: [
    "/",
    "/about",
    "/features",
    "/pricing",
    "/docs",
    "/ai",
    "/platform"
  ],
  crawl: true,
  puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"]
};
