const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\6361401a-624d-4668-9d51-afd3473bd7d5\\produs_logo_arcane_v2_no_text_1775443503659.png";
const dest = path.join(__dirname, 'src', 'assets', 'brand-logo.js');

try {
  const binary = fs.readFileSync(source);
  const base64 = `export const brandLogo = "data:image/png;base64,${binary.toString('base64')}";`;
  
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  fs.writeFileSync(dest, base64);
  console.log(`Successfully inlined logo to ${dest}`);
  console.log(`Inlined file size: ${base64.length} characters`);
} catch (err) {
  console.error("Error during inlining:", err);
  process.exit(1);
}
