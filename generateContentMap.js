const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Config
const inputFile = 'WaveUrls.csv'; // CSV exported from Excel
const outputFile = 'contentMap.js'; // Output file
const contentMap = {};

// Read the CSV
fs.createReadStream(path.join(__dirname, inputFile))
  .pipe(csv())
  .on('data', (row) => {
    // Normalize headers (make everything lowercase + trimmed)
    const headers = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key].trim();
      return acc;
    }, {});

    // Pull values using normalized keys
    const localPathRaw = headers['opus2'];
    const sourcePageRaw = headers['wave'];

    // Skip if either value is missing
    if (!localPathRaw || !sourcePageRaw) return;

    // Ensure paths have trailing slashes
    const localPath = localPathRaw.replace(/\/$/, '') + '/';
    const sourcePage = sourcePageRaw.replace(/\/$/, '') + '/';

    contentMap[localPath] = { sourcePage };
  })
  .on('end', () => {
    // Build the output JS file
    const output =
      'const contentMap = ' +
      JSON.stringify(contentMap, null, 2) +
      ';\n\nexport default contentMap;\n';

    // Write to disk
    fs.writeFileSync(path.join(__dirname, outputFile), output);
    console.log(`✅ ${outputFile} has been generated from ${inputFile}`);
  });
