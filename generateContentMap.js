const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Config
const inputFile = 'WaveUrls.csv'; // CSV exported from Excel
const outputFile = 'contentMap.js'; // Output file
const contentMap = {};

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
    // Normalize headers (case-insensitive)
    const headers = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key].trim();
      return acc;
    }, {});

    const localPathRaw = headers['opus2'];
    const sourcePageRaw = headers['wave'];

    if (!localPathRaw || !sourcePageRaw) return;

    const localPath = localPathRaw.replace(/\/$/, '') + '/';
    const sourcePage = sourcePageRaw.replace(/\/$/, '') + '/';

    contentMap[localPath] = { sourcePage };
  })
  .on('end', () => {
    const output =
      'const contentMap = ' +
      JSON.stringify(contentMap, null, 2) +
      ';\n\nexport default contentMap;\n';

    fs.writeFileSync(outputPath, output);
    console.log(`✅ ${outputFile} has been generated from ${inputFile}`);
  });
