const fs = require("fs");
const path = require("path");

const replacements = [
  ["bg-black", "bg-[var(--bg)]"],
  ["text-white", "text-[var(--text)]"],
  ["border-white", "border-[var(--border)]"]
];

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
      return;
    }

    if (!file.endsWith(".jsx")) return;

    let content = fs.readFileSync(fullPath, "utf8");

    replacements.forEach(([from, to]) => {
      content = content.split(from).join(to);
    });

    fs.writeFileSync(fullPath, content);
  });
}

walk("src");
console.log("UI migration completed");
