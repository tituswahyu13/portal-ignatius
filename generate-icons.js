const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImagePath = path.join(__dirname, 'amdg.png');
const outputDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // 192x192
    await sharp(inputImagePath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'icon-192x192.png'));
    console.log('Generated icon-192x192.png');

    // 512x512
    await sharp(inputImagePath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    console.log('Generated icon-512x512.png');

    // 180x180 (Apple Touch Icon)
    await sharp(inputImagePath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(outputDir, 'apple-icon.png'));
    console.log('Generated apple-icon.png');
    
    // favicon (optional, usually 32x32)
    await sharp(inputImagePath)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('Generated favicon-32x32.png');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
