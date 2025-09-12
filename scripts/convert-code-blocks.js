const fs = require('fs');
const path = require('path');

function convertPythonCodeBlocks(content) {
  // Regex to match Python code blocks
  const pythonCodeBlockRegex = /```python\n([\s\S]*?)\n```/g;
  
  return content.replace(pythonCodeBlockRegex, (match, code) => {
    // Clean up the code (remove extra indentation)
    const cleanCode = code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\\n');
    
    // Convert to ExecutableCodeBlock component
    return `<ExecutableCodeBlock 
  code={\`${cleanCode}\`}
  description="Interactive Python Example"
  compact={true}
/>`;
  });
}

function processMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const convertedContent = convertPythonCodeBlocks(content);
    
    // Only write if content changed
    if (content !== convertedContent) {
      fs.writeFileSync(filePath, convertedContent);
      console.log(`✅ Converted: ${filePath}`);
      return 1;
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function findMarkdownFiles(dir) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
const contentDir = path.join(__dirname, '../algobook-web/content/chapters');

if (!fs.existsSync(contentDir)) {
  console.error('❌ Content directory not found:', contentDir);
  process.exit(1);
}

console.log('🔍 Finding markdown files...');
const markdownFiles = findMarkdownFiles(contentDir);
console.log(`📁 Found ${markdownFiles.length} markdown files`);

console.log('\\n🔄 Converting Python code blocks...');
let convertedCount = 0;

for (const file of markdownFiles) {
  convertedCount += processMarkdownFile(file);
}

console.log(`\\n✨ Conversion complete! ${convertedCount} files updated.`);
console.log('\\n📝 Next steps:');
console.log('1. Import ExecutableCodeBlock in your markdown components');
console.log('2. Test the interactive examples');
console.log('3. Add hints and descriptions as needed');