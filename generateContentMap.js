const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const contentMap = {};
const inputFile = "WaveUrls.csv"; // Wave = source of new links, Opus = where to insert them
const outputFile = "contentMap.js";

let totalRows = 0;
let successCount = 0;
let skippedCount = 0;
let consecutiveEmptyRows = 0;

// Normalize a value into a clean pathname like "/toledo/"
const normalizePath = (value) => {
  if (!value || typeof value !== "string" || value.trim() === "") return "";

  try {
    const url = new URL(value);
    return cleanPath(url.pathname);
  } catch {
    return cleanPath(value);
  }
};

// Ensure a path starts and ends with a slash, and strip ?query/#hash
const cleanPath = (input) => {
  if (!input) return "";
  const pathOnly = input.trim().split("?")[0].split("#")[0];
  const withStart = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withStart.replace(/\/?$/, "/");
};

// 👇 Save the stream instance so we can destroy it manually
const stream = fs.createReadStream(path.join(__dirname, inputFile)).pipe(csv());

stream.on("data", (row) => {
  totalRows++;

  const waveKey = Object.keys(row).find(k => k.toLowerCase().includes("wave"));
  const opusKey = Object.keys(row).find(k => k.toLowerCase().includes("opus"));

  const waveRaw = waveKey ? row[waveKey].trim() : "";
  const opusRaw = opusKey ? row[opusKey].trim() : "";

  const wavePath = normalizePath(waveRaw);
  const opusPath = normalizePath(opusRaw);

  const isEmpty = !waveRaw && !opusRaw;

  if (isEmpty) {
    consecutiveEmptyRows++;
    if (consecutiveEmptyRows >= 1) {
      console.warn(`🛑 Stopping: encountered empty row at row ${totalRows}`);
      stream.destroy(); // ✅ Use the actual stream instance
      return;
    }
  } else {
    consecutiveEmptyRows = 0; // reset if non-empty
  }

  // console.log(`🟡 Row ${totalRows}:`);
  // console.log(`- Opus Raw:  "${opusRaw}"`);
  // console.log(`- Wave Raw:  "${waveRaw}"`);
  // console.log(`- Opus Path: "${opusPath}"`);
  // console.log(`- Wave Path: "${wavePath}"`);

  if (!opusPath || !wavePath) {
    console.warn(`⚠️ Skipped row ${totalRows} (missing or invalid):`, row);
    skippedCount++;
    return;
  }

  contentMap[opusPath] = { sourcePage: wavePath };
  successCount++;
});

stream.on("end", () => {
  const output =
    "const contentMap = " +
    JSON.stringify(contentMap, null, 2) +
    ";\n\nexport default contentMap;\n";

  fs.writeFileSync(path.join(__dirname, outputFile), output);

  console.log(`\n✅ contentMap.js generated successfully.`);
  console.log(`📦 Rows processed: ${totalRows}`);
  console.log(`✔️  Entries added:  ${successCount}`);
  console.log(`❌ Rows skipped:   ${skippedCount}`);
});
