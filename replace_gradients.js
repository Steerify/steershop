const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) {
      if(!dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('dist')) {
        walkDir(dirPath, callback);
      }
    } else if(dirPath.endsWith('.tsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.jsx') || dirPath.endsWith('.js') || dirPath.endsWith('.css')) {
      callback(dirPath);
    }
  });
}

let modifiedCount = 0;
walkDir('src', function(filepath) {
  let original = fs.readFileSync(filepath, 'utf8');
  let content = original;
  
  // Replace simple gradients
  content = content.replace(/bg-gradient-to-\w+ from-primary to-accent/g, 'bg-accent text-accent-foreground');
  content = content.replace(/bg-gradient-to-\w+ from-primary via-accent to-primary/g, 'bg-accent text-accent-foreground');
  content = content.replace(/text-transparent bg-clip-text bg-gradient-to-\w+ from-primary to-accent/g, 'text-accent');
  
  // More generic replacements catching opacity modifiers if needed
  content = content.replace(/bg-gradient-to-[a-z]+ from-primary(?:\/\d+)? via-accent(?:\/\d+)? to-primary(?:\/\d+)?/g, 'bg-accent text-accent-foreground');
  content = content.replace(/bg-gradient-to-[a-z]+ from-primary(?:\/\d+)? to-accent(?:\/\d+)?/g, 'bg-accent text-accent-foreground');
  
  // Replace direct gradient-text and btn-african classes if they are hardcoded
  
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    modifiedCount++;
    console.log('Modified', filepath);
  }
});
console.log('Total modified:', modifiedCount);
