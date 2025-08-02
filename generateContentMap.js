const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const contentMap = {};
const inputFile = "WaveUrls.csv"; // Wave = source of new links, Opus = where to insert them
const outputFile = "contentMap.js";

/* = = = Configs = = = */
const MAX_ROWS_TO_PROCESS = 400;

/* = = = Trackers = = = */
let totalRows = 0;
let successCount = 0;
let skippedCount = 0;

// Normalize a value into a clean pathname like "/toledo/"
const normalizePath = (value) => {
  if (
    !value ||
    typeof value !== "string" ||
    value.trim() === "" ||
    value.includes(" ")
  ) {
    return "";
  }

    let input = value.trim();
  // Add https:// if it looks like a domain or URL without protocol
  if (!input.startsWith("http") && input.includes(".")) {
    input = "https://" + input;
  }

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
  const cleaned = withStart.replace(/\/{2,}/g, "/"); // collapse slashes
  return decodeURIComponent(cleaned.toLowerCase().replace(/\/?$/, "/"));
};

const stream = fs.createReadStream(path.join(__dirname, inputFile)).pipe(csv());

stream.on("data", (row) => {
  totalRows++;

  const waveKey = Object.keys(row).find(k => k.toLowerCase().includes("wave"));
  const opusKey = Object.keys(row).find(k => k.toLowerCase().includes("opus"));

  const waveRaw = waveKey ? row[waveKey].trim() : "";
  const opusRaw = opusKey ? row[opusKey].trim() : "";

  const wavePath = normalizePath(waveRaw);
  const opusPath = normalizePath(opusRaw);

if (totalRows > MAX_ROWS_TO_PROCESS) {
  console.warn(`🛑 Stopping: reached row limit of ${MAX_ROWS_TO_PROCESS}`);
  stream.destroy();
  return;
}

if (!waveRaw || !opusRaw) {
  console.warn(`⚠️ Skipped empty row ${totalRows}`);
  skippedCount++;
  return;
}

  // console.log(`🟡 Row ${totalRows}:`);
  // console.log(`- Opus Path: "${opusPath}"`);
  // console.log(`- Wave Path: "${wavePath}"`);

  if (!opusPath || !wavePath) {
    console.warn(`⚠️ Skipped invalid row ${totalRows}:`, row);
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