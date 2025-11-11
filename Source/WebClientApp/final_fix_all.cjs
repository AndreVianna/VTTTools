const fs = require('fs');

console.log('=== Final Comprehensive TypeScript Fix ===\n');

//1. Fix useAssetManagement.ts handlers to match EditorDialogs interface
let file = 'src/pages/EncounterEditor/hooks/useAssetManagement.ts';
let content = fs.readFileSync(file, 'utf-8');

// Fix onRename callback to be async
content = content.replace(
    /onRename: \(id, name\) => \{/g,
    'onRename: async (id, name) => {'
);

// Fix onUpdate callback to be async  
content = content.replace(
    /onUpdate: \(id, _display\) => \{/g,
    'onUpdate: async (id, displayName, labelPosition) => {'
);

// Fix handleAssetDisplayUpdate signature to match EditorDialogs
content = content.replace(
    /const handleAssetDisplayUpdate = useCallback\(async \(assetId: string, updates: \{ width\?: number; height\?: number; rotation\?: number \}\) => \{/,
    'const handleAssetDisplayUpdate = useCallback(async (assetId: string, displayName?: DisplayName, labelPosition?: LabelPosition) => {'
);

// Remove width/height/rotation from newDisplay object creation
content = content.replace(
    /oldDisplay: \{ width: asset\.size\.width, height: asset\.size\.height, rotation: asset\.rotation \},[\s\n]*newDisplay: \{[\s\n]*width: updates\.width \?\? asset\.size\.width,[\s\n]*height: updates\.height \?\? asset\.size\.height,[\s\n]*rotation: updates\.rotation \?\? asset\.rotation[\s\n]*\},/,
    'oldDisplay: { displayName: asset.displayName, labelPosition: asset.labelPosition },\n            newDisplay: { displayName, labelPosition },'
);

// Fix updateEncounterAsset call - remove size and rotation, only spread if rotation is defined
content = content.replace(
    /size: \{ width: updates\.width \?\? asset\.size\.width, height: updates\.height \?\? asset\.size\.height \},[\s\n]*\.\.\.\(placedAsset\.rotation !== undefined \? \{ rotation: placedAsset\.rotation \} : \{\}\)/,
    '...(displayName && { displayName }),\n                ...(labelPosition && { labelPosition })'
);

fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed useAssetManagement.ts');

// 2. Fix EncounterEditorPage useState declarations
file = 'src/pages/EncounterEditorPage.tsx';
content = fs.readFileSync(file, 'utf-8');

// Fix useState declarations for context menu positions
content = content.replace(
    /\[assetContextMenuPosition, setAssetContextMenuPosition\] = useState<\{ x: number; y: number \} \| null>\(null\)/,
    '[assetContextMenuPosition, setAssetContextMenuPosition] = useState<{ left: number; top: number } | null>(null)'
);
content = content.replace(
    /\[wallContextMenuPosition, setWallContextMenuPosition\] = useState<\{ x: number; y: number \} \| null>\(null\)/,
    '[wallContextMenuPosition, setWallContextMenuPosition] = useState<{ left: number; top: number } | null>(null)'
);

fs.writeFileSync(file, content, 'utf-8');
console.log('✓ Fixed EncounterEditorPage.tsx useState');

console.log('\n=== All production files fixed ===');
console.log('Remaining errors are in test files - need manual fixes\n');
