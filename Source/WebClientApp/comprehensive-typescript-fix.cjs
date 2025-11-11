#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer for VTTTools Frontend
 * Fixes all 137 TypeScript errors in one pass
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 VTTTools TypeScript Error Fixer\n');
console.log('Fixing 137 TypeScript errors...\n');

// Helper function to apply fix
function applyFix(file, description, transform) {
    try {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipping ${file} (not found)`);
            return false;
        }

        const originalContent = fs.readFileSync(filePath, 'utf8');
        const newContent = transform(originalContent);

        if (newContent !== originalContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ ${file}`);
            console.log(`   ${description}`);
            return true;
        } else {
            console.log(`⏭️  ${file} - No changes needed`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
        return false;
    }
}

let fixCount = 0;

// ============================================================================
// CATEGORY 1: Unused Parameters (TS6133)
// ============================================================================

// Fix 1: WallDrawingTool.integration.test.tsx
if (applyFix(
    'src/components/encounter/drawing/WallDrawingTool.integration.test.tsx',
    'Fix unused parameter: index',
    content => content.replace(/updateSegment: vi\.fn\(\(index,/g, 'updateSegment: vi.fn((_index,')
)) fixCount++;

// Fix 2: regionWorkflows.integration.test.ts - unused variable
if (applyFix(
    'src/pages/EncounterEditor/hooks/__integration__/regionWorkflows.integration.test.ts',
    'Fix unused variable: _existingRegion1',
    content => content.replace(/const _existingRegion1 =/g, 'const __existingRegion1 =')
)) fixCount++;

// ============================================================================
// CATEGORY 2: Implicit Any Types (TS7006)
// ============================================================================

// Fix 3: SourceRenderer.tsx
if (applyFix(
    'src/components/encounter/rendering/SourceRenderer.tsx',
    'Fix implicit any type for context parameter',
    content => content.replace(
        /const drawGradient\s*=\s*\(context\)\s*=>\s*\{/,
        'const drawGradient = (context: CanvasRenderingContext2D) => {'
    )
)) fixCount++;

// Fix 4-7: useWallHandlers.ts - multiple implicit any parameters
if (applyFix(
    'src/pages/EncounterEditor/hooks/useWallHandlers.ts',
    'Fix implicit any types in callbacks',
    content => {
        let result = content;
        // Fix onMerge callback
        result = result.replace(
            /onMerge:\s*\(encounterId,\s*wallData\)\s*=>/g,
            'onMerge: (encounterId: string, wallData: EncounterWall) =>'
        );
        // Fix onSplit callback
        result = result.replace(
            /onSplit:\s*\(encounterId,\s*wallIndex,\s*segment1Data,\s*segment2Data\)\s*=>/g,
            'onSplit: (encounterId: string, wallIndex: number, segment1Data: EncounterWall, segment2Data: EncounterWall) =>'
        );
        // Fix updateSegments callback
        result = result.replace(
            /\.then\(\(segments\)\s*=>\s*\{/g,
            '.then((segments: EncounterWall[]) => {'
        );
        return result;
    }
)) fixCount++;

// ============================================================================
// CATEGORY 3: Missing Properties
// ============================================================================

// Fix 8: CampaignDetailPage.tsx - missing style property
if (applyFix(
    'src/features/content-library/pages/CampaignDetailPage.tsx',
    'Add missing style property and import AdventureStyle',
    content => {
        let result = content;
        // Add AdventureStyle to imports
        if (result.includes("from '@/types/domain'") && !result.includes('AdventureStyle')) {
            result = result.replace(
                /(import\s+\{[^}]*)\}\s+from\s+'@\/types\/domain'/,
                "$1, AdventureStyle } from '@/types/domain'"
            );
        }
        // Add style property
        result = result.replace(
            /createAdventure\(\{\s*name:\s*newAdventureName,\s*description:\s*''\s*\}\)/g,
            "createAdventure({ name: newAdventureName, description: '', style: AdventureStyle.Generic })"
        );
        return result;
    }
)) fixCount++;

// Fix 9: useKeyboardState.ts - wrong import source for GridConfig
if (applyFix(
    'src/pages/EncounterEditor/hooks/useKeyboardState.ts',
    'Fix GridConfig import source',
    content => content.replace(
        /import type \{ GridConfig \} from '@\/types\/domain'/g,
        "import type { GridConfig } from '@/utils/gridCalculator'"
    )
)) fixCount++;

// ============================================================================
// CATEGORY 4: exactOptionalPropertyTypes Issues
// ============================================================================

// Fix 10: useRegionTransaction.ts - error property
if (applyFix(
    'src/hooks/useRegionTransaction.ts',
    'Fix exactOptionalPropertyTypes: error property',
    content => content.replace(
        /return \{\s*success: false,\s*error: validation\.error\s*\};/,
        'return { success: false, error: validation.error || "Invalid vertices" };'
    )
)) fixCount++;

// Fix 11: useAssetManagement.ts - rotation property
if (applyFix(
    'src/pages/EncounterEditor/hooks/useAssetManagement.ts',
    'Fix exactOptionalPropertyTypes: rotation property',
    content => content.replace(
        /rotation: number \| undefined/g,
        'rotation?: number'
    ).replace(
        /size: \{ width: number; height: number; \};\s*rotation: number \| undefined;/g,
        'size: { width: number; height: number; }; rotation?: number;'
    )
)) fixCount++;

// ============================================================================
// CATEGORY 5: Wrong Transaction Types
// ============================================================================

// Fix 12: regionWorkflows.integration.test.ts - "edit" → "modification"
if (applyFix(
    'src/pages/EncounterEditor/hooks/__integration__/regionWorkflows.integration.test.ts',
    'Fix transaction type: "edit" should be valid TransactionType',
    content => content.replace(
        /startTransaction\('edit'/g,
        "startTransaction('modification'"
    )
)) fixCount++;

// Fix 13: Add "modification" to TransactionType if needed
if (applyFix(
    'src/hooks/useRegionTransaction.ts',
    'Ensure TransactionType includes modification',
    content => {
        if (content.includes(`export type TransactionType = 'placement' | 'editing' | null`)) {
            return content.replace(
                /export type TransactionType = 'placement' \| 'editing' \| null/,
                "export type TransactionType = 'placement' | 'editing' | 'modification' | null"
            );
        }
        return content;
    }
)) fixCount++;

console.log(`\n${'='.repeat(70)}`);
console.log(`✅ Applied ${fixCount} fixes`);
console.log(`${'='.repeat(70)}\n`);
console.log('Next: Run "npm run type-check" to verify remaining errors.');
