const fs = require('fs');
const path = require('path');

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}

// 1. Fix SourcePreview.tsx - already done with sed

// 2. Fix EditorDialogs.tsx
let content = readFile('src/components/encounter/EditorDialogs.tsx');
content = content.replace(
    /import type { PlacedAsset, EncounterWall } from/,
    'import type { PlacedAsset, EncounterWall, DisplayName, LabelPosition } from'
);
content = content.replace(
    /assetContextMenuPosition: { x: number; y: number } \| null;/,
    'assetContextMenuPosition: { left: number; top: number } | null;'
);
content = content.replace(
    /wallContextMenuPosition: { x: number; y: number } \| null;/,
    'wallContextMenuPosition: { left: number; top: number } | null;'
);
content = content.replace(
    /onAssetRename: \(assetId: string, newName: string\) => void;/,
    'onAssetRename: (assetId: string, newName: string) => Promise<void>;'
);
content = content.replace(
    /onAssetDisplayUpdate: \(assetId: string, displayName: string, labelPosition: string\) => void;/,
    'onAssetDisplayUpdate: (assetId: string, displayName?: DisplayName, labelPosition?: LabelPosition) => Promise<void>;'
);
writeFile('src/components/encounter/EditorDialogs.tsx', content);
console.log('Fixed EditorDialogs.tsx');

// 3. Fix CampaignDetailPage.tsx - Add style property
content = readFile('src/features/content-library/pages/CampaignDetailPage.tsx');
content = content.replace(
    /request: {\s+name: 'New Adventure',\s+description: ''\s+}/,
    `request: {
                        name: 'New Adventure',
                        description: '',
                        style: 'Default' as const
                    }`
);
writeFile('src/features/content-library/pages/CampaignDetailPage.tsx', content);
console.log('Fixed CampaignDetailPage.tsx');

console.log('\nPhase 1 complete: Fixed 3 core component files');
console.log('Run npm run type-check to see remaining errors');
