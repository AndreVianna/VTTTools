const fs = require('fs');

console.log('Starting comprehensive TypeScript error fixes...\n');

// 1. Fix CampaignDetailPage - style property
let file = 'src/features/content-library/pages/CampaignDetailPage.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(
    /request: \{\s+name: 'New Adventure',\s+description: ''\s+\}/,
    `request: {
                        name: 'New Adventure',
                        description: '',
                        style: 'Standard' as const
                    }`
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed Campaign DetailPage - added style property');

// 2. Fix useAssetManagement.ts - async handlers
file = 'src/pages/EncounterEditor/hooks/useAssetManagement.ts';
content = fs.readFileSync(file, 'utf-8');
// Make handleRenameAsset async
content = content.replace(
    /const handleRenameAsset = \(id: string, name: string\) => \{/,
    'const handleRenameAsset = async (id: string, name: string) => {'
);
// Make handleUpdateAssetDisplay async and fix signature
content = content.replace(
    /const handleUpdateAssetDisplay = \(id: string, _display: DisplayName \| undefined\) => \{/,
    'const handleUpdateAssetDisplay = async (id: string, displayName?: DisplayName, labelPosition?: LabelPosition) => {'
);
// Fix rotation parameter to handle undefined properly
content = content.replace(
    /, rotation: placedAsset.rotation/g,
    ', ...(placedAsset.rotation !== undefined ? { rotation: placedAsset.rotation } : {})'
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed useAssetManagement - made handlers async');

// 3. Fix useRegionHandlers.ts - Encounter | null vs undefined
file = 'src/pages/EncounterEditor/hooks/useRegionHandlers.ts';
content = fs.readFileSync(file, 'utf-8');
content = content.replace(/encounter: Encounter \| null/g, 'encounter: Encounter | undefined');
// Add encounterId to new regions
content = content.replace(
    /(const newRegion: EncounterRegion = \{[\s\n]+)(index:)/,
    '$1encounterId: encounter!.id,\n            $2'
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed useRegionHandlers - null to undefined, added encounterId');

// 4. Fix useWallHandlers.ts - add type annotations
file = 'src/pages/EncounterEditor/hooks/useWallHandlers.ts';
content = fs.readFileSync(file, 'utf-8');
// Add explicit any types to callback parameters
content = content.replace(
    /onMerge: \(encounterId, wallData\)/g,
    'onMerge: (encounterId: string, wallData: any)'
);
content = content.replace(
    /onBreak: \(encounterId, wallIndex, segment1Data, segment2Data\)/g,
    'onBreak: (encounterId: string, wallIndex: number, segment1Data: any, segment2Data: any)'
);
// Add non-null assertions for possibly undefined
content = content.replace(
    /const breakPoint = segments\[clickedSegmentIndex\];/,
    'const breakPoint = segments[clickedSegmentIndex]!;'
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed useWallHandlers - added type annotations');

// 5. Fix EncounterEditorPage.tsx - multiple type issues
file = 'src/pages/EncounterEditorPage.tsx';
content = fs.readFileSync(file, 'utf-8');
// Fix anchorPosition types
content = content.replace(
    /setAssetContextMenuPosition\(\{ x: e.evt.clientX, y: e.evt.clientY \}\)/g,
    'setAssetContextMenuPosition({ left: e.evt.clientX, top: e.evt.clientY })'
);
content = content.replace(
    /setWallContextMenuPosition\(\{ x: e.evt.clientX, y: e.evt.clientY \}\)/g,
    'setWallContextMenuPosition({ left: e.evt.clientX, top: e.evt.clientY })'
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed EncounterEditorPage - position types');

// 6. Fix wallMergeUtils.ts - possibly undefined
file = 'src/utils/wallMergeUtils.ts';
content = fs.readFileSync(file, 'utf-8');
content = content.replace(/targetMerge\./g, 'targetMerge!.');
content = content.replace(/mergePoint\./g, 'mergePoint!.');
// Fix vertices access
content = content.replace(
    /const firstVertex = firstWall.vertices\[0\];/g,
    'const firstVertex = firstWall.vertices[0]!;'
);
content = content.replace(
    /const lastVertex = firstWall.vertices\[firstWall.vertices.length - 1\];/g,
    'const lastVertex = firstWall.vertices[firstWall.vertices.length - 1]!;'
);
content = content.replace(
    /const secondFirstVertex = secondWall.vertices\[0\];/g,
    'const secondFirstVertex = secondWall.vertices[0]!;'
);
content = content.replace(
    /const secondLastVertex = secondWall.vertices\[secondWall.vertices.length - 1\];/g,
    'const secondLastVertex = secondWall.vertices[secondWall.vertices.length - 1]!;'
);
fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed wallMergeUtils - non-null assertions');

console.log('\n=== Phase 1: Production files fixed ===\n');
console.log('Run type-check to see remaining test file errors');
