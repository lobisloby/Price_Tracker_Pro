// scripts/zip.cjs
// Create ZIP file for Chrome Web Store

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distPath = path.resolve(__dirname, '../dist');
const manifestPath = path.join(distPath, 'manifest.json');

// Check if dist exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found!');
  console.error('   Run "npm run build:secure" first.');
  process.exit(1);
}

// Check if manifest exists
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found in dist folder!');
  process.exit(1);
}

// Read version from manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version || '1.0.0';
const name = manifest.name || 'extension';

// Clean name for filename
const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const outputFileName = `${cleanName}-v${version}.zip`;
const outputPath = path.resolve(__dirname, '..', outputFileName);

// Delete existing zip if exists
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
  console.log(`🗑️  Deleted existing: ${outputFileName}`);
}

console.log('');
console.log('📦 Creating Extension Package...');
console.log('================================');

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const size = (archive.pointer() / 1024).toFixed(2);
  console.log('');
  console.log('✅ Package Created Successfully!');
  console.log('================================');
  console.log(`   📄 File: ${outputFileName}`);
  console.log(`   📊 Size: ${size} KB`);
  console.log(`   🏷️  Version: ${version}`);
  console.log('');
  console.log('📤 Ready to upload to Chrome Web Store!');
  console.log('');
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Warning:', err.message);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add the dist folder contents to the zip root
archive.directory(distPath, false);

archive.finalize();