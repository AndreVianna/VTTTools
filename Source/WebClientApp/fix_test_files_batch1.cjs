const fs = require('fs');

function fix(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [oldStr, newStr] of replacements) {
        content = content.replace(oldStr, newStr);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed ${filePath}`);
}

// Fix test files with missing encounterId properties
const files = [
    'src/hooks/useRegionTransaction.test.ts',
    'src/pages/EncounterEditor/hooks/__integration__/regionWorkflows.integration.test.ts',
    'src/pages/EncounterEditor/hooks/useAssetManagement.integration.test.ts',
    'src/pages/EncounterEditor/hooks/useMergeRegions.test.ts',
    'src/utils/encounterStateUtils.test.ts',
    'src/utils/regionMergeUtils.test.ts',
    'src/utils/wallCollisionUtils.test.ts',
    'src/utils/wallMergeUtils.test.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Fix: Add encounterId to regions
    content = content.replace(
        /(\{\s*index:)/g,
        '{ encounterId: \'test-encounter\', index:'
    );
    
    // Fix: Add missing Encounter properties
    content = content.replace(
        /(\{\s*id: ['"]test-encounter['"],\s*name:)/g,
        `{ id: 'test-encounter', adventure: { id: 'test-adv', name: 'Test' }, isPublished: false, light: 0, weather: 'Clear', name:`
    );
    
    // Fix:offsetX -> offset.x
    content = content.replace(/offsetX:/g, 'offset: { x:');
    content = content.replace(/offsetY:/g, 'y:');
    
    // Fix: gridSize -> grid property
    content = content.replace(/gridSize:/g, 'grid: { cellSize: { width: 50, height: 50 }, offset: { x: 0, y: 0 } }, oldProp:');
    
    // Fix: imageUrl -> tokens
    content = content.replace(
        /imageUrl: ['"].*?['"]/g,
        `tokens: [{ token: { id: 'test-token', name: 'Token', url: '/test.png' }, isDefault: true }]`
    );
    
    // Fix: Add missing PlacedAsset properties
    content = content.replace(
        /(assetId: ['"].*?['"],[\s\S]*?asset: \{[\s\S]*?\})([\s,\n\r\s]*\})/g,
        '$1, layer: \'tokens\', number: 1, visible: true, locked: false, displayName: \'Default\', labelPosition: \'Default\'$2'
    );
    
    // Fix: cellWidth -> cellSize.width
    content = content.replace(/cellWidth:/g, 'cellSize: { width:');
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Processed ${file}`);
});

console.log('\nBatch 1 complete: Fixed test file mock objects');
