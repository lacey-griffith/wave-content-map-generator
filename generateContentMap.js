const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Config
const inputFile = 'WaveUrls.csv'; // CSV exported from Excel
const outputFile = 'contentMap.js'; // Output file
const contentMap = {};

// Counters
let attemptedCount = 0;
let mappedCount = 0;

// Paths
const csvPath = path.join(__dirname, inputFile);
const outputPath = path.join(__dirname, outputFile);

// ✅ Check for missing CSV
if (!fs.existsSync(csvPath)) {
  console.error(`❌ Missing input file: ${inputFile}`);
  console.error(`➡️  Make sure it's in the repo root and named exactly '${inputFile}'`);
  process.exit(1);
}

// ⚠️ Warn if contentMap.js already exists
if (fs.existsSync(outputPath)) {
  console.warn(`⚠️  ${outputFile} already exists and will be overwritten.`);
}

// 📥 Read and process CSV
fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    // Normalize and flatten headers
    const headers = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key].trim();
      return acc;
    }, {});

    const localPathRaw = headers['opus2'];
    const sourcePageRaw = headers['wave'];

    // Skip completely blank rows
    if (!localPathRaw && !sourcePageRaw) return;

    attemptedCount++;

    // Warn if either value is missing
    if (!localPathRaw || !sourcePageRaw) {
      console.warn(`⚠️  Skipping row with missing values:`, row);
      return;
    }

    // Normalize paths (ensure trailing slash)
    const localPath = localPathRaw.replace(/\/$/, '') + '/';
    const sourcePage = sourcePageRaw.replace(/\/$/, '') + '/';

    // Warn on duplicate keys
    if (contentMap[localPath]) {
      console.warn(`⚠️  Duplicate local path detected: '${localPath}' – overwriting previous entry.`);
    }

    contentMap[localPath] = { sourcePage };
    mappedCount++;
  })
  .on('end', () => {
    if (attemptedCount === 0 || mappedCount === 0) {
      console.warn(`⚠️  No valid rows found in ${inputFile}.`);
      console.warn(`🔎 Make sure the file has content and correct headers.`);
      return;
    }

    const output =
      'const contentMap = ' +
      JSON.stringify(contentMap, null, 2) +
      ';\n\nexport default contentMap;\n';

    fs.writeFileSync(outputPath, output);
    console.log(`✅ ${outputFile} has been generated from ${inputFile}`);
    console.log(`📊 ${mappedCount} out of ${attemptedCount} URLs were mapped successfully.`);
  });
