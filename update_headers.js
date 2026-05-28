const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx')).map(f => path.join(pagesDir, f));
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replacing just the title and subtitle spans, handling line breaks and spaces
  const pattern = /<span className=\"text-\[10px\] font-black uppercase tracking-\[0\.6em\][^>]*>\{title\}<\/span>\s*\{subtitle && <span[^>]*>\{subtitle\}<\/span>\}/g;
  content = content.replace(pattern, '<span className=\"text-sm font-black uppercase tracking-[0.4em] text-foreground/80\">{title}</span>');

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log('Updated ' + path.basename(file));
  }
}

// ALSO UPDATE Layout.jsx
const layoutPath = path.join(__dirname, 'client', 'src', 'components', 'Layout.jsx');
if (fs.existsSync(layoutPath)) {
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  let originalLayout = layoutContent;

  const layoutPattern = /<span className=\"text-\[10px\] font-black uppercase tracking-\[0\.6em\] text-foreground\">\{config\.title\}<\/span>\n?\s*<span className=\"text-\[8px\] font-mono uppercase tracking-widest text-foreground\/40\">\{config\.subtitle\}<\/span>/g;
  layoutContent = layoutContent.replace(
    layoutPattern,
    '<span className=\"text-sm font-black uppercase tracking-[0.4em] text-foreground/80\">{config.title}</span>'
  );

  if (layoutContent !== originalLayout) {
    fs.writeFileSync(layoutPath, layoutContent);
    console.log('Updated Layout.jsx');
  }
}

console.log('Total files updated: ' + count);
