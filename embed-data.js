#!/usr/bin/env node
// embed-data.js — Transform sweep JSONL into dashboard DATA format
// and optionally embed into an HTML file.
//
// Usage:
//   node embed-data.js results/sweep-TIMESTAMP.jsonl                    # output DATA JSON to stdout
//   node embed-data.js results/sweep-TIMESTAMP.jsonl results/dashboard.html  # embed into HTML file
"use strict";

const fs = require("fs");
const path = require("path");

const jsonlFile = process.argv[2];
const htmlFile = process.argv[3];

if (!jsonlFile) {
  console.error("Usage: node embed-data.js <sweep.jsonl> [dashboard.html]");
  process.exit(1);
}

// Parse JSONL
const lines = fs.readFileSync(jsonlFile, "utf8").trim().split("\n");
const data = [];
let errors = 0;

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (!entry.output || entry.error) {
      console.error(`  SKIP (error): ${entry.label}`);
      errors++;
      continue;
    }

    const r = entry.output.results ? entry.output.results[0] : entry.output;
    if (!r || !r.pm) {
      console.error(`  SKIP (no results): ${entry.label}`);
      errors++;
      continue;
    }

    data.push({
      label: entry.label,
      config: entry.config || {},
      N: entry.n || r.N || 0,
      pm: r.pm || {},
      govType: r.govType || {},
      topCoalitions: r.topCoalitions || [],
      packageViability: r.packageViability || {},
    });
  } catch (e) {
    console.error(`  SKIP (parse error): ${e.message}`);
    errors++;
  }
}

console.error(`Processed: ${data.length} scenarios, ${errors} errors`);

if (htmlFile) {
  // Embed into HTML file
  const html = fs.readFileSync(htmlFile, "utf8");
  const dataStr = JSON.stringify(data);

  // Replace the DATA placeholder
  const pattern = /const DATA = \[.*?\];/s;
  if (!pattern.test(html)) {
    console.error("ERROR: Could not find 'const DATA = [...];' in HTML file");
    process.exit(1);
  }

  const newHtml = html.replace(pattern, `const DATA = ${dataStr};`);
  fs.writeFileSync(htmlFile, newHtml);
  console.error(`Embedded ${data.length} scenarios into ${htmlFile}`);
  console.error(`File size: ${(Buffer.byteLength(newHtml) / 1024).toFixed(0)} KB`);
} else {
  // Output DATA JSON to stdout
  console.log(JSON.stringify(data, null, 0));
}
