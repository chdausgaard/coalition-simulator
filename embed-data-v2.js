#!/usr/bin/env node
// embed-data-v2.js — Embeds sweep JSONL data into post-election.html
// Usage: node embed-data-v2.js [jsonl_file] [html_file]

const fs = require("fs");

const dataFile = process.argv[2] || "results/sweep-data-v2.jsonl";
const htmlFile = process.argv[3] || "post-election.html";

if (!fs.existsSync(dataFile)) {
  console.error(`Data file not found: ${dataFile}`);
  process.exit(1);
}
if (!fs.existsSync(htmlFile)) {
  console.error(`HTML file not found: ${htmlFile}`);
  process.exit(1);
}

const lines = fs.readFileSync(dataFile, "utf-8").trim().split("\n").filter(l => l.trim());
const data = lines.map((line, i) => {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error(`Parse error on line ${i + 1}: ${e.message}`);
    return null;
  }
}).filter(Boolean);

const html = fs.readFileSync(htmlFile, "utf-8");
const dataStr = JSON.stringify(data);

// Replace the DATA placeholder
const updated = html.replace(
  /const DATA = \[.*?\];/s,
  `const DATA = ${dataStr};`
);

if (updated === html) {
  console.error("Warning: DATA placeholder not found in HTML. Looking for 'const DATA = [];'");
  // Try alternate replacement
  const alt = html.replace("const DATA = [];", `const DATA = ${dataStr};`);
  if (alt !== html) {
    fs.writeFileSync(htmlFile, alt, "utf-8");
    console.log(`Embedded ${data.length} configs into ${htmlFile}`);
  } else {
    console.error("Could not find DATA placeholder in HTML file.");
    process.exit(1);
  }
} else {
  fs.writeFileSync(htmlFile, updated, "utf-8");
  console.log(`Embedded ${data.length} configs into ${htmlFile}`);
}
