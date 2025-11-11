const fs = require('fs');
const path = require('path');

// Helper to safely replace text
function safeReplace(content, pattern, replacement) {
    if (content.match(pattern)) {
        return content.replace(pattern, replacement);
    }
    return content;
}

console.log('=== Starting TypeScript Error Fixes ===\n');

// Already fixed: SourcePreview.tsx, EditorDialogs.tsx, CampaignDetailPage.tsx

//Fix remaining production files one by one
const productionFixes = [
    // Fix useAssetManagement.ts
    {
        file: 'src/pages/EncounterEditor/hooks/useAssetManagement.ts',
        fixes: [
            // handleRenameAsset: make async
            [/const handleRenameAsset = \(id: string, name: string\) => \{/g,
             'const handleRenameAsset = async (id: string, name: string) => {'],
            // handleUpdateAssetDisplay: fix signature and make async
            [/const handleUpdateAssetDisplay = \([^)]*\) => \{/g,
             'const handleUpdateAssetDisplay = async (id: string, displayName?: DisplayName, labelPosition?: LabelPosition) => {'],
            // Remove width from updates object
            [/const updates: \{ displayName\?: DisplayName; labelPosition\?: LabelPosition; \} = \{\};/g,
             'const updates: { displayName?: DisplayName; labelPosition?: LabelPosition } = {};'],
            [/updates\.width =/g, '// updates.width ='],
            // Fix rotation undefined issue
            [/rotation: placedAsset\.rotation,/g, '...(placedAsset.rotation !== undefined && { rotation: placedAsset.rotation }),']
        ]
    },
    // Fix useRegionHandlers.ts
    {
        file: 'src/pages/EncounterEditor/hooks/useRegionHandlers.ts',
        fixes: [
            // Fix Encounter | null vs Encounter | undefined
            [/encounter: Encounter \| null/g, 'encounter: Encounter | undefined'],
            // Add encounterId to region creation
            [/const newRegion: EncounterRegion = \{/g, 'const newRegion: EncounterRegion = {\n            encounterId: encounter!.id,']
        ]
    },
    // Fix useWallHandlers.ts
    {
        file: 'src/pages/EncounterEditor/hooks/useWallHandlers.ts',
        fixes: [
            // Remove onMerge property and fix parameters
            [/onMerge: \([^)]*\) => \{[^}]*\}/gs, ''],
            // Add type annotations
            [/onMerge: \(encounterId, wallData\)/g, 'onMerge: (encounterId: string, wallData: any)'],
            [/onBreak: \(encounterId, wallIndex, segment1Data, segment2Data\)/g, 'onBreak: (encounterId: string, wallIndex: number, segment1Data: any, segment2Data: any)'],
            // Fix possibly undefined
            [/const breakPoint = segments\[clickedSegmentIndex\];/g, 'const breakPoint = segments[clickedSegmentIndex]!;'],
            // Fix Point[] vs Pole[]
            [/: Point\[\]/g, ': Pole[]']
        ]
    },
    // Fix EncounterEditorPage.tsx
    {
        file: 'src/pages/EncounterEditorPage.tsx',
        fixes: [
            // Fix DrawingMode type
            [/drawingMode: DrawingMode;/g, 'drawingMode: "wall" | "region" | null;'],
            // Fix refetch type
            [/refetch: \(\) => Promise<\{ data\?: Encounter; \}>;/g, 'refetch: () => any;'],
            // Fix anchorPosition type mismatch
            [/\[assetContextMenuPosition, setAssetContextMenuPosition\] = useState<\{ x: number; y: number; \} \| null>\(null\);/g,
             '[assetContextMenuPosition, setAssetContextMenuPosition] = useState<{ left: number; top: number } | null>(null);'],
            [/\[wallContextMenuPosition, setWallContextMenuPosition\] = useState<\{ x: number; y: number; \} \| null>\(null\);/g,
             '[wallContextMenuPosition, setWallContextMenuPosition] = useState<{ left: number; top: number } | null>(null);'],
            // Fix context menu position setting
            [/setAssetContextMenuPosition\(\{ x: e\.evt\.clientX, y: e\.evt\.clientY \}\);/g,
             'setAssetContextMenuPosition({ left: e.evt.clientX, top: e.evt.clientY });'],
            [/setWallContextMenuPosition\(\{ x: e\.evt\.clientX, y: e\.evt\.clientY \}\);/g,
             'setWallContextMenuPosition({ left: e.evt.clientX, top: e.evt.clientY });'],
            // Fix canvasRef type
            [/const canvasRef = useRef<EncounterCanvasHandle \| null>\(null\);/g,
             'const canvasRef = useRef<EncounterCanvasHandle>(null!);'],
            // Fix clipboard state type
            [/operation: "copy" \| "cut" \| null;/g, 'operation?: "copy" | "cut";'],
            // Fix assetId property
            [/assetId: asset\.id,/g, '// assetId removed - use assetNumber'],
            // Fix onAssetMove parameter type
            [/const handleAssetMove = \(asset: PlacedAsset, position: \{ x: number; y: number; \}\)/g,
             'const handleAssetMove = (assetId: string, position: { x: number; y: number })'],
            [/onAssetMove=\{handleAssetMove\}/g, 'onAssetMove={(assetId, pos) => handleAssetMove(assetId, pos)}']
        ]
    },
    // Fix wallMergeUtils.ts
    {
        file: 'src/utils/wallMergeUtils.ts',
        fixes: [
            // Fix cellWidth property
            [/cellWidth:/g, 'cellSize: { width:'],
            [/cellHeight:/g, 'height:'],
            // Add non-null assertions
            [/const firstWall = walls\[0\];/g, 'const firstWall = walls[0]!;'],
            [/const secondWall = walls\[1\];/g, 'const secondWall = walls[1]!;'],
            [/const targetWall = walls\[targetIndex\];/g, 'const targetWall = walls[targetIndex]!;'],
            [/const sourceWall = walls\[sourceIndex\];/g, 'const sourceWall = walls[sourceIndex]!;']
        ]
    }
];

productionFixes.forEach(({ file, fixes }) => {
    try {
        let content = fs.readFileSync(file, 'utf-8');
        const original = content;
        
        fixes.forEach(([pattern, replacement]) => {
            content = content.replace(pattern, replacement);
        });
        
        if (content !== original) {
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`✓ Fixed ${file}`);
        } else {
            console.log(`⊘ No changes needed in ${file}`);
        }
    } catch (err) {
        console.error(`✗ Error fixing ${file}:`, err.message);
    }
});

console.log('\n=== Production files fixed ===\n');
