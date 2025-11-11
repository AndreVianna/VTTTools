const fs = require('fs');
const path = require('path');

console.log('Fixing all TypeScript errors...\n');

const fixes = [
    // 1. WallDrawingTool.integration.test.tsx - unused parameter
    {
        file: 'src/components/encounter/drawing/WallDrawingTool.integration.test.tsx',
        find: /updateSegment: vi\.fn\(\(index,/g,
        replace: 'updateSegment: vi.fn((_index,',
        description: 'Fix unused parameter: index'
    },

    // 2. SourceRenderer.tsx - implicit any type
    {
        file: 'src/components/encounter/rendering/SourceRenderer.tsx',
        find: /drawGradient\s*=\s*\(context\)\s*=>/g,
        replace: 'drawGradient = (context: CanvasRenderingContext2D) =>',
        description: 'Fix implicit any type for context parameter'
    },

    // 3. CampaignDetailPage.tsx - missing style property
    {
        file: 'src/features/content-library/pages/CampaignDetailPage.tsx',
        find: /createAdventure\(\{\s*name:\s*newAdventureName,\s*description:\s*''\s*\}\)/g,
        replace: `createAdventure({ name: newAdventureName, description: '', style: AdventureStyle.Generic })`,
        description: 'Add missing style property'
    },

    // Add AdventureStyle import to CampaignDetailPage.tsx
    {
        file: 'src/features/content-library/pages/CampaignDetailPage.tsx',
        find: /(import\s+\{[^}]*\}\s+from\s+['"]@\/types\/domain['"];)/,
        replace: (match) => {
            if (match.includes('AdventureStyle')) return match;
            return match.replace('}', ', AdventureStyle }');
        },
        description: 'Add AdventureStyle import'
    },

    // 4. useKeyboardState.ts - GridConfig import fix
    {
        file: 'src/pages/EncounterEditor/hooks/useKeyboardState.ts',
        find: /from\s+['"]@\/types\/domain['"]/g,
        replace: `from '@/utils/gridCalculator'`,
        description: 'Fix GridConfig import source',
        conditional: (content) => content.includes(`import type { GridConfig }`)
    },

    // 5. regionWorkflows.integration.test.ts - unused parameter
    {
        file: 'src/pages/EncounterEditor/hooks/__integration__/regionWorkflows.integration.test.ts',
        find: /const _existingRegion1 =/g,
        replace: 'const __existingRegion1 =',
        description: 'Fix unused variable'
    },

    // 6. regionWorkflows.integration.test.ts - edit transaction type
    {
        file: 'src/pages/EncounterEditor/hooks/__integration__/regionWorkflows.integration.test.ts',
        find: /startTransaction\('edit'/g,
        replace: `startTransaction('modification'`,
        description: 'Fix transaction type from "edit" to "modification"'
    }
];

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(fix => {
    try {
        const filePath = path.join(__dirname, fix.file);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipping ${fix.file} (file not found)`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Skip if conditional check fails
        if (fix.conditional && !fix.conditional(content)) {
            console.log(`⏭️  Skipping ${fix.file}: ${fix.description} (condition not met)`);
            return;
        }

        const originalContent = content;

        if (typeof fix.replace === 'function') {
            content = content.replace(fix.find, fix.replace);
        } else {
            content = content.replace(fix.find, fix.replace);
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed ${fix.file}: ${fix.description}`);
            fixedCount++;
        } else {
            console.log(`⏭️  Skipping ${fix.file}: ${fix.description} (no match found)`);
        }
    } catch (error) {
        console.error(`❌ Error fixing ${fix.file}:`, error.message);
        errorCount++;
    }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Fixed: ${fixedCount} files`);
if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
}
console.log(`${'='.repeat(60)}\n`);
console.log('Run "npm run type-check" to verify fixes.');
