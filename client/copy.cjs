const fs = require('fs');
try {
    const src = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ce7ec945-d152-4612-a011-7bc69a535b80\\produs_logo_1772638863602.png';
    const dest = 'C:\\Users\\LENOVO\\Desktop\\Produs\\client\\public\\produs-logo.png';
    fs.copyFileSync(src, dest);
    console.log('Successfully copied the logo to public folder.');
} catch (e) {
    console.error('Copy failed:', e);
}
