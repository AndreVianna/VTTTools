#!/usr/bin/env node

/**
 * Convert base64 string to PNG file
 * Usage: node convert-base64-to-png.js <tempFile> <outputFileName>
 */

import fs from 'fs';
import path from 'path';

function convertBase64ToPng(tempFilePath, outputFileName) {
  try {
    console.log(`Converting ${tempFilePath} to PNG...`);

    // Read the base64 string from temp file
    const base64Data = fs.readFileSync(tempFilePath, 'utf8');

    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/png;base64,/, '').trim();

    // Convert to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Ensure UX directory exists
    const uxDir = path.join(process.cwd(), 'Documents', 'Tasks', 'VTTTools_Frontend_Migration', 'UX');
    if (!fs.existsSync(uxDir)) {
      fs.mkdirSync(uxDir, { recursive: true });
    }

    // Write PNG file
    const outputPath = path.join(uxDir, outputFileName);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ PNG created: ${outputPath}`);
    console.log(`📁 File size: ${buffer.length} bytes`);

    // Delete temp file
    fs.unlinkSync(tempFilePath);
    console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

    return outputPath;
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node convert-base64-to-png.js <tempFile> <outputFileName>');
  process.exit(1);
}

const [tempFilePath, outputFileName] = args;

// Validate inputs
if (!fs.existsSync(tempFilePath)) {
  console.error(`Temp file not found: ${tempFilePath}`);
  process.exit(1);
}

if (!outputFileName.endsWith('.png')) {
  console.error('Output filename must end with .png');
  process.exit(1);
}

// Run conversion
convertBase64ToPng(tempFilePath, outputFileName);