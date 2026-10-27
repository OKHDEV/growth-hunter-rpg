const fs = require('fs');
const path = require('path');

// Ensure output dir exists
const outputDir = path.join(__dirname, '..', 'assets', 'bosses');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Output directory:", outputDir);
