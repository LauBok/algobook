#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for which code blocks should be made executable
const EXECUTABLE_PATTERNS = [
  // Algorithm demonstrations
  /print\s*\(\s*["']Hello[^"']*["']/i,
  /print\s*\(\s*["'].*algorithm.*["']/i,
  
  // Variable and data type examples
  /age\s*=\s*\d+/,
  /temperature\s*=\s*/,
  /student_\w+\s*=/,
  /name\s*=\s*["']/,
  
  // Arithmetic examples
  /math_score|english_score/,
  /cookies.*friends/,
  /[+\-*/%]\s*\w+/,
  
  // String processing examples
  /\.upper\(\)|\.lower\(\)|\.title\(\)/,
  /\.startswith\(|\.endswith\(/,
  /f["'].*{.*}.*["']/,
  
  // Any code with multiple print statements (likely examples)
  /print\s*\([^)]*\)[\s\S]*print\s*\([^)]*\)[\s\S]*print\s*\(/,
];

function shouldMakeExecutable(codeContent) {
  // Skip very short code snippets (likely inline examples)
  if (codeContent.length < 30) return false;
  
  // Skip if already has input() calls (might be exercise code)
  if (codeContent.includes('input(')) return false;
  
  // Skip if has placeholder comments indicating student work
  if (codeContent.includes('# Your code here') || codeContent.includes('# TODO')) return false;
  
  // Check if matches any executable patterns
  return EXECUTABLE_PATTERNS.some(pattern => pattern.test(codeContent));
}

function extractHintsFromCode(codeContent) {
  const hints = [];
  const lines = codeContent.split('\n');
  
  // Look for hint-style comments
  for (const line of lines) {
    const comment = line.match(/#\s*(.+)/);
    if (comment) {
      const commentText = comment[1].trim();
      
      // Skip obvious non-hints
      if (commentText.startsWith('TODO') || 
          commentText.startsWith('Your code') ||
          commentText.includes('implementation') ||
          commentText.length < 10) {
        continue;
      }
      
      // Look for hint-style comments
      if (commentText.startsWith('Try ') || 
          commentText.startsWith('Change ') ||
          commentText.startsWith('Notice ') ||
          commentText.startsWith('Experiment ')) {
        hints.push(commentText);
      }
    }
  }
  
  // Generate contextual hints based on content
  if (codeContent.includes('print(') && codeContent.includes('=')) {
    hints.push('Try changing the variable values to see how the output changes');
  }
  
  if (codeContent.includes('f"') || codeContent.includes("f'")) {
    hints.push('Experiment with f-string formatting by modifying the variables');
  }
  
  if (codeContent.includes('.upper()') || codeContent.includes('.lower()')) {
    hints.push('Try different string methods like .title() or .capitalize()');
  }
  
  return hints.slice(0, 3); // Limit to 3 hints
}

function generateDescription(codeContent, context = '') {
  if (codeContent.includes('print("Hello')) {
    return 'Interactive Python example - Click "Run Code" to see the output';
  }
  
  if (codeContent.includes('age') && codeContent.includes('=')) {
    return 'Practice with variables and basic data types';
  }
  
  if (codeContent.includes('f"') || codeContent.includes("f'")) {
    return 'Explore f-string formatting and string interpolation';
  }
  
  if (codeContent.match(/[+\-*/%]/)) {
    return 'Try arithmetic operations and mathematical calculations';
  }
  
  if (codeContent.includes('.upper()') || codeContent.includes('.lower()')) {
    return 'Experiment with string methods and text processing';
  }
  
  return 'Interactive Python example - modify and run the code';
}

function convertPythonCodeBlocks(content, filePath) {
  let changeCount = 0;
  
  // Match Python code blocks
  const pythonCodeBlockRegex = /```python\n([\s\S]*?)\n```/g;
  
  const convertedContent = content.replace(pythonCodeBlockRegex, (match, codeContent) => {
    // Clean up the code content
    const cleanCode = codeContent
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .trim();
    
    // Decide if this should be executable
    if (!shouldMakeExecutable(cleanCode)) {
      return match; // Keep as static code block
    }
    
    // Generate hints and description
    const hints = extractHintsFromCode(cleanCode);
    const description = generateDescription(cleanCode, filePath);
    
    changeCount++;
    
    // Convert to executable format
    return `\`\`\`python-execute
${cleanCode}
\`\`\``;
  });
  
  return { convertedContent, changeCount };
}

function processMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { convertedContent, changeCount } = convertPythonCodeBlocks(content, filePath);
    
    if (changeCount > 0) {
      fs.writeFileSync(filePath, convertedContent);
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${changeCount} code blocks made executable`);
      return changeCount;
    } else {
      console.log(`⏭️  ${path.relative(process.cwd(), filePath)}: No changes needed`);
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
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
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
function main() {
  const contentDir = path.join(__dirname, '../algobook-web/content/chapters');

  console.log('🔍 Making Python code examples executable...\n');

  if (!fs.existsSync(contentDir)) {
    console.error(`❌ Content directory not found: ${contentDir}`);
    process.exit(1);
  }

  const markdownFiles = findMarkdownFiles(contentDir);
  console.log(`📁 Found ${markdownFiles.length} markdown files\n`);

  let totalChanges = 0;
  
  for (const file of markdownFiles) {
    totalChanges += processMarkdownFile(file);
  }

  console.log(`\n✨ Process complete!`);
  console.log(`📊 ${totalChanges} code blocks converted to executable format`);
  
  if (totalChanges > 0) {
    console.log(`\n📝 Next steps:`);
    console.log(`1. Start your development server: cd algobook-web && npm run dev`);
    console.log(`2. Visit any chapter section to see executable code blocks`);
    console.log(`3. Code blocks marked with 'python-execute' are now interactive`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertPythonCodeBlocks, shouldMakeExecutable };