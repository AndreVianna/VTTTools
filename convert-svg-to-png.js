// Convert SVG files to PNG
const fs = require('fs').promises;
const path = require('path');

async function convertSvgToPng() {
    const svgDir = 'Source/WebClientApp/public/assets/tokens';
    const files = await fs.readdir(svgDir);

    const svgFiles = files.filter(f => f.endsWith('.svg'));

    console.log(`Found ${svgFiles.length} SVG files to convert`);

    for (const svgFile of svgFiles) {
        const svgPath = path.join(svgDir, svgFile);
        const pngFile = svgFile.replace('.svg', '.png');
        const pngPath = path.join(svgDir, pngFile);

        const svgContent = await fs.readFile(svgPath, 'utf8');

        // Extract width and height from SVG
        const widthMatch = svgContent.match(/width="(\d+)"/);
        const heightMatch = svgContent.match(/height="(\d+)"/);
        const width = widthMatch ? parseInt(widthMatch[1]) : 100;
        const height = heightMatch ? parseInt(heightMatch[1]) : 100;

        // Use sharp to convert SVG to PNG
        const sharp = require('sharp');
        await sharp(Buffer.from(svgContent))
            .resize(width * 2, height * 2) // 2x for better quality
            .png()
            .toFile(pngPath);

        console.log(`✅ Converted ${svgFile} -> ${pngFile} (${width*2}x${height*2})`);
    }
}

convertSvgToPng().catch(console.error);
