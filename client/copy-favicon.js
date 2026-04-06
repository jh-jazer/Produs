const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'src', 'components', 'brand', 'produs-logo.png');
const dest = path.join(__dirname, 'public', 'branding', 'favicon-v2.png');

try {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  fs.copyFileSync(source, dest);
  console.log(`Favicon successfully copied from ${source} to ${dest}`);
} catch (err) {
  console.error('Error copying favicon:', err);
  process.exit(1);
}
