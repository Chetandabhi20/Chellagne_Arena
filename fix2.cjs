const fs = require('fs');
['src/pages/Progress.tsx', 'src/pages/League.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\"/g, '"');
  fs.writeFileSync(f, content);
});
