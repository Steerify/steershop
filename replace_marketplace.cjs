const fs = require('fs');
const path = require('path');

const TARGET_FILES = [
  'src/pages/Index.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx'
];

function processFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace phrases in Index.tsx
  content = content.replace(/Browse All Shops/g, 'Explore Marketplace');
  content = content.replace(/Explore Shops/g, 'Explore Marketplace');
  
  // Replace standalone "Shops" in Navbar/Footer UI links (e.g., >Shops< or 'Shops')
  // We use regex to match exactly "Shops" when it's the text content or label, but NOT part of "/shops" url or classNames.
  // A safe way: replace ">Shops<" with ">Marketplace<"
  content = content.replace(/>Shops</g, '>Marketplace<');
  content = content.replace(/"Shops"/g, '"Marketplace"'); // For items in arrays like [{ title: "Shops" }]

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

TARGET_FILES.forEach(processFile);
console.log('Replacement complete.');
