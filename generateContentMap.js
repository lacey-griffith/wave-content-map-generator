const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const contentMap = {};
const inputFile = 'WaveUrls.csv';
const outputFile = 'contentMap.js';

fs.createReadStream(path.join(__dirname, inputFile))
  .pipe(csv())
  .on('data', (row) => {
    const localPath = row['Opus 2']?.trim();
    const sourcePage = row['Wave Page']?.trim();

    if (localPath && sourcePage) {
      contentMap[localPath] = { sourcePage };
    }
  })
  .on('end', () => {
    const output =
      'const contentMap = ' +
      JSON.stringify(contentMap, null, 2) +
      ';\n\nexport default contentMap;\n';

    fs.writeFileSync(path.join(__dirname, outputFile), output);
    console.log(`✅ contentMap.js has been generated from ${inputFile}`);
  });
