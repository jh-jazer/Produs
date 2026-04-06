const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\6361401a-624d-4668-9d51-afd3473bd7d5\\produs_logo_arcane_v2_no_text_1775443503659.png";
const dest = path.join(__dirname, 'public', 'branding', 'logo-v2.png');

try {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  fs.copyFileSync(source, dest);
  console.log(`Successfully copied ${source} to ${dest}`);
  console.log(`File size: ${fs.statSync(dest).size} bytes`);
} catch (err) {
  console.error("Error during copy:", err);
  process.exit(1);
}
