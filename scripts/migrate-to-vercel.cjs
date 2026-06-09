const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../supabase/functions/_shared');
const targetDir = path.join(__dirname, '../api/_shared');

function copyDirAndRemoveNpmPrefix(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirAndRemoveNpmPrefix(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Remove 'npm:' prefix from imports
      content = content.replace(/from 'npm:/g, "from '");
      content = content.replace(/from "npm:/g, 'from "');
      
      // Remove version numbers like @18.3.1 or @0.0.22
      content = content.replace(/react@[0-9\.]+/g, "react");
      content = content.replace(/@react-email\/components@[0-9\.]+/g, "@react-email/components");
      
      fs.writeFileSync(destPath, content);
      console.log(`Migrated ${srcPath} -> ${destPath}`);
    }
  }
}

copyDirAndRemoveNpmPrefix(sourceDir, targetDir);
console.log("Migration complete!");
