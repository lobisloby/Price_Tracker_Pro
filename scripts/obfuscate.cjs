// scripts/obfuscate.cjs
// Post-build obfuscation script

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Load config
const obfuscatorConfig = require('../obfuscator.config.cjs');
const { presets, currentPreset } = obfuscatorConfig;

// Obfuscation options
const options = presets[currentPreset];

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to obfuscate a single file
function obfuscateFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const code = fs.readFileSync(absolutePath, 'utf8');
    
    // Skip if file is too small (likely empty or already processed)
    if (code.length < 50) {
      console.log(`⏭️  Skipping (too small): ${filePath}`);
      return false;
    }

    console.log(`🔒 Obfuscating: ${filePath}`);

    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, options);

    fs.writeFileSync(absolutePath, obfuscatedCode.getObfuscatedCode());

    // Get file sizes
    const originalSize = Buffer.byteLength(code, 'utf8');
    const obfuscatedSize = Buffer.byteLength(obfuscatedCode.getObfuscatedCode(), 'utf8');
    const ratio = ((obfuscatedSize / originalSize) * 100).toFixed(1);

    console.log(`   ✅ Done! ${formatBytes(originalSize)} → ${formatBytes(obfuscatedSize)} (${ratio}%)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error obfuscating ${filePath}:`, error.message);
    return false;
  }
}

// Get all JS files from a directory recursively
function getAllJsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log('');
console.log('🛡️  Price Tracker Pro - Code Obfuscation');
console.log('=========================================');
console.log(`📋 Preset: ${currentPreset.toUpperCase()}`);
console.log('');

const distPath = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found!');
  console.error('   Run "npm run build" first.');
  process.exit(1);
}

const jsFiles = getAllJsFiles(distPath);

if (jsFiles.length === 0) {
  console.log('⚠️  No JavaScript files found in dist folder.');
  process.exit(0);
}

console.log(`📁 Found ${jsFiles.length} JavaScript file(s)`);
console.log('');

let successCount = 0;
jsFiles.forEach((file) => {
  if (obfuscateFile(file)) {
    successCount++;
  }
});

console.log('');
console.log(`🎉 Obfuscation complete! (${successCount}/${jsFiles.length} files)`);
console.log('');