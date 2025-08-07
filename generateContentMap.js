const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/* = = = Configs = = = */
const contentMap = {};
const outputFile = "contentMap.js";
const MAX_ROWS_TO_PROCESS = 400;

/* = = = File Discovery = = = */
const inputDir = __dirname;
const csvFiles = fs.readdirSync(inputDir).filter(f => f.endsWith(".csv"));

if (csvFiles.length === 0) {
  console.error("❌ No .csv file found in this directory. Please add one and try again.");
  process.exit(1);
}

let inputFile = csvFiles[0];
if (csvFiles.length > 1) {
  console.warn(`⚠️ Multiple CSV files found. Using: "${inputFile}"`);
}

/* = = = Trackers = = = */
let totalRows = 0;
let successCount = 0;
let skippedCount = 0;
let sampleRows = [];

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

const fullInputPath = path.join(inputDir, inputFile);
const stream = fs.createReadStream(fullInputPath).pipe(csv());

stream.on("data", (row) => {
  totalRows++;

  const waveKey = Object.keys(row).find(k => k.toLowerCase().includes("wave"));
  const opusKey = Object.keys(row).find(k => k.toLowerCase().includes("opus"));

  if (!waveKey || !opusKey) {
    console.warn(`❌ Missing "Wave" or "Opus" column headers. Check your CSV format.`);
    stream.destroy();
    return;
  }

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

  if (!opusPath || !wavePath) {
    console.warn(`⚠️ Skipped invalid row ${totalRows}:`, row);
    skippedCount++;
    return;
  }

  contentMap[opusPath] = { sourcePage: wavePath };
  successCount++;

  if (sampleRows.length < 3) {
    sampleRows.push({ [opusPath]: { sourcePage: wavePath } });
  }
});

stream.on("end", () => {
  // Heuristic: if < 20% of Wave values start with "/locations/", warn about possible flip
  const locationPaths = Object.values(contentMap).filter(v => v.sourcePage.startsWith("/locations/")).length;
  if (locationPaths < successCount * 0.2) {
    console.warn(`\n⚠️ Most 'Wave' values do NOT start with "/locations/". Columns might be flipped.`);
  }

  console.log("\n🔍 Preview of first 3 entries:");
  sampleRows.forEach((entry, i) => {
    console.log(`  ${i + 1}.`, JSON.stringify(entry));
  });

  const output =
    "const contentMap = " +
    JSON.stringify(contentMap, null, 2) +
    ";\n\nexport default contentMap;\n";

  fs.writeFileSync(path.join(__dirname, outputFile), output);

  console.log(`\n✅ contentMap.js generated successfully with ${Object.keys(contentMap).length} entries.`);
  console.log(`📦 Rows processed: ${totalRows}`);
  console.log(`✔️  Entries added:  ${successCount}`);
  console.log(`❌ Rows skipped:   ${skippedCount}`);
});
