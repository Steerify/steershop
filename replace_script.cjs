const fs = require('fs');
const path = require('path');

const TARGET_FILES = [
  'src/pages/Index.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/components/VendorSetupWizard.tsx',
  'src/components/VendorCommandCenter.tsx',
  'src/pages/Auth.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/DiscoveryHub.tsx',
  'src/pages/customer/CustomerDashboard.tsx',
  'src/pages/entrepreneur/VendorInvite.tsx',
  'src/pages/seo/OnlineMarketplaceNigeria.tsx',
  'src/pages/seo/SellOnWhatsApp.tsx',
  'src/pages/seo/SellOnlineNigeria.tsx',
  'src/pages/seo/SEOPageTemplate.tsx',
  'src/components/CollectionsSection.tsx',
  'src/components/SafeBeautyBadge.tsx',
  'src/components/SEOSchemas.tsx'
];

function processFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // We want to replace standalone words (or words inside sentences)
  // \b ensures we don't match inside CamelCase (like VendorSetup) but \b does match "Vendor" in "<VendorSetup" if it's considered a word boundary... 
  // Wait, in JS \b matches between \w and \W. So in "VendorSetup", "Vendor" is NOT bounded by \b on the right side.
  // Wait, "Vendor" in "VendorSetup" is bounded on the left by \b, but NOT on the right (because S is a word character). So \bVendor\b will NOT match "VendorSetup".
  // This is PERFECT. It will only match "Vendor", "vendor", "vendors", etc., standalone.

  content = content.replace(/\bVendors\b/g, 'Merchants');
  content = content.replace(/\bvendors\b/g, 'merchants');
  content = content.replace(/\bVendor\b/g, 'Merchant');
  content = content.replace(/\bvendor\b/g, 'merchant');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

TARGET_FILES.forEach(processFile);
console.log('Replacement complete.');
