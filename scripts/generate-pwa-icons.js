#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script helps generate PWA icons from a source image.
 * 
 * Usage:
 * 1. Place your logo image in public/img/logo.svg (or update the source path below)
 * 2. Run: npm run generate-pwa-icons
 * 3. The script will generate all required PWA icon sizes
 * 
 * Requirements:
 * - Node.js with sharp installed: npm install sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const sourceImage = path.join(__dirname, '../public/img/logo.svg');
const outputDir = path.join(__dirname, '../public/img');

// Icon sizes and names
const icons = [
  { name: 'favicon.ico', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image not found: ${sourceImage}`);
    console.log('Please place your logo image at public/img/logo.svg');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    for (const icon of icons) {
      const outputPath = path.join(outputDir, icon.name);
      
      console.log(`📱 Generating ${icon.name} (${icon.size}x${icon.size})...`);
      
      await sharp(sourceImage)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name}`);
    }

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated icons in the public/ directory');
    console.log('2. Update your PWA configuration in nuxt.config.ts');
    console.log('3. Test your PWA by running: npm run build && npm run preview');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  await import('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Please install it first:');
  console.log('npm install sharp');
  process.exit(1);
}

// Run the script
generateIcons(); 