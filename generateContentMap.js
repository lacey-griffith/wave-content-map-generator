const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Config
const inputFile = 'WaveUrls.csv'; // CSV exported from Excel
const outputFile = 'contentMap.js'; // Output file
const contentMap = {};
let rowCount = 0;

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
    rowCount++;

    // Normalize and flatten headers
    const headers = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key].trim();
      return acc;
    }, {});

    // Check required columns exist
    const requiredHeaders = ['wave', 'opus2'];
    const missing = requiredHeaders.filter(h => !(h in headers));
    if (missing.length > 0) {
      console.error(`❌ Missing required column(s): ${missing.join(', ')}`);
      console.error(`📝 Check that your CSV header row includes: Wave, Opus2`);
      process.exit(1);
    }

    const localPathRaw = headers['opus2'];
    const sourcePageRaw = headers['wave'];

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
  })
  .on('end', () => {
    if (rowCount === 0 || Object.keys(contentMap).length === 0) {
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
  });
