#!/usr/bin/env node
/**
 * Fix bulk TypeScript errors - test mocks and null checks
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Bulk TypeScript Error Fixer (Test Mocks & Null Checks)\n');

let totalFixes = 0;

function readFile(relPath) {
    const absPath = path.join(__dirname, relPath);
    if (!fs.existsSync(absPath)) return null;
    return fs.readFileSync(absPath, 'utf8');
}

function writeFile(relPath, content) {
    const absPath = path.join(__dirname, relPath);
    fs.writeFileSync(absPath, content, 'utf8');
}

function applyFix(file, description, transform) {
    const content = readFile(file);
    if (!content) return false;

    const newContent = transform(content);
    if (newContent !== content) {
        writeFile(file, newContent);
        console.log(`✅ ${file}`);
        console.log(`   → ${description}`);
        totalFixes++;
        return true;
    }
    return false;
}

// ============================================================================
// FIX: useRegionTransaction.test.ts - Add encounterId to all EncounterRegion mocks
// ============================================================================
applyFix(
    'src/hooks/useRegionTransaction.test.ts',
    'Add encounterId to EncounterRegion mocks + fix CellSize',
    c => {
        let result = c;
        // Add encounterId to region objects that are missing it
        // Pattern: { index: N, name: ..., vertices: ..., type: ... }
        // Add encounterId: 'encounter-1' after opening brace
        result = result.replace(
            /(\{)\s*(index:\s*\d+,\s*name:\s*['"][^'"]*['"],\s*vertices:)/g,
            '$1 encounterId: \'encounter-1\', $2'
        );

        // Fix CellSize type (number -> { width, height })
        result = result.replace(
            /cellSize:\s*(\d+)/g,
            'cellSize: { width: $1, height: $1 }'
        );

        // Fix mock Encounter objects - add all required properties
        result = result.replace(
            /(const mockEncounter(?:\w*)?:\s*Encounter\s*=\s*\{[^}]*id:\s*['"][^'"]*['"],)/g,
            `$1
            adventure: null,
            isPublished: false,
            light: 0,
            weather: 'Clear',
            elevation: 0,
            grid: { type: 1, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
            stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
            assets: [],
            walls: [],
            sources: [],`
        );

        return result;
    }
);

// ============================================================================
// FIX: useMergeRegions.test.ts - Add encounterId
// ============================================================================
applyFix(
    'src/pages/EncounterEditor/hooks/useMergeRegions.test.ts',
    'Add encounterId to EncounterRegion mocks',
    c => {
        let result = c;
        // Add encounterId to region objects
        result = result.replace(
            /(\{)\s*(index:\s*\d+,\s*name:\s*['"][^'"]*['"],\s*vertices:)/g,
            '$1 encounterId: \'encounter-1\', $2'
        );

        // Remove structures property
        result = result.replace(/,\s*structures: \[\]/g, '');

        // Fix mock Encounter objects
        result = result.replace(
            /(const mockEncounter:\s*Encounter\s*=\s*\{[^}]*id:\s*['"][^'"]*['"],)/g,
            `$1
            adventure: null,
            isPublished: false,
            light: 0,
            weather: 'Clear',
            elevation: 0,
            grid: { type: 1, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
            stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
            assets: [],
            walls: [],
            sources: [],`
        );

        return result;
    }
);

// ============================================================================
// FIX: useRegionHandlers.ts - Add encounterId and fix null checks
// ============================================================================
applyFix(
    'src/pages/EncounterEditor/hooks/useRegionHandlers.ts',
    'Fix null checks and add encounterId',
    c => {
        let result = c;
        // Fix null vs undefined in function calls
        result = result.replace(
            /calculateRegionArea\(encounter,/g,
            'calculateRegionArea(encounter ?? undefined,'
        );

        // Add encounterId to region creation
        result = result.replace(
            /(\{)\s*(color:\s*[^,]+,\s*label\?:\s*[^,]+,\s*value\?:\s*[^,]+,\s*index:)/g,
            '$1 encounterId: currentEncounterId, $2'
        );

        return result;
    }
);

// ============================================================================
// FIX: encounterStateUtils.test.ts - Add null checks
// ============================================================================
applyFix(
    'src/utils/encounterStateUtils.test.ts',
    'Add null checks for possibly undefined',
    c => {
        let result = c;
        // Add null checks for state.assets, state.regions, state.walls
        // Pattern: expect(state.assets[0]).toBe...
        // Replace with: expect(state.assets?.[0]).toBe...
        result = result.replace(
            /expect\(state\.(assets|regions|walls)\[(\d+)\]\)/g,
            'expect(state.$1?.[$2])'
        );

        // Fix excludeRegionIndex optional property
        result = result.replace(
            /excludeRegionIndex: undefined/g,
            '// excludeRegionIndex omitted'
        );
        result = result.replace(
            /(calculateRegionArea\([^,]+,\s*[^,]+,\s*)\{[^}]*excludeRegionIndex: undefined[^}]*\}/g,
            '$1{}'
        );

        return result;
    }
);

// ============================================================================
// FIX: wallCollisionUtils.test.ts - Add null checks
// ============================================================================
applyFix(
    'src/utils/wallCollisionUtils.test.ts',
    'Add null checks for possibly undefined',
    c => {
        let result = c;
        // Add optional chaining for array access
        result = result.replace(
            /expect\(result\.points\[(\d+)\]\)/g,
            'expect(result.points?.[$1])'
        );
        result = result.replace(
            /expect\(result\.segments\[(\d+)\]\)/g,
            'expect(result.segments?.[$1])'
        );

        return result;
    }
);

// ============================================================================
// FIX: wallMergeUtils.test.ts - Add null checks
// ============================================================================
applyFix(
    'src/utils/wallMergeUtils.test.ts',
    'Add null checks',
    c => c.replace(
        /expect\(result\.(\w+)\[(\d+)\]\)/g,
        'expect(result.$1?.[$2])'
    )
);

// ============================================================================
// FIX: wallMergeUtils.ts - Fix cellWidth property and null checks
// ============================================================================
applyFix(
    'src/utils/wallMergeUtils.ts',
    'Fix GridConfig property access and null checks',
    c => {
        let result = c;
        // Fix cellWidth -> cellSize.width
        result = result.replace(
            /gridConfig\.cellWidth/g,
            'gridConfig.cellSize.width'
        );

        // Add null checks for possibly undefined
        result = result.replace(
            /(\w+)\.start\.connectsTo\.(\w+)/g,
            '$1.start.connectsTo?.$2'
        );
        result = result.replace(
            /(\w+)\.end\.connectsTo\.(\w+)/g,
            '$1.end.connectsTo?.$2'
        );

        // Add non-null assertions or checks for targetMerge and mergePoint
        result = result.replace(
            /targetMerge\.start/g,
            'targetMerge!.start'
        );
        result = result.replace(
            /targetMerge\.end/g,
            'targetMerge!.end'
        );
        result = result.replace(
            /mergePoint\.x/g,
            'mergePoint!.x'
        );
        result = result.replace(
            /mergePoint\.y/g,
            'mergePoint!.y'
        );

        return result;
    }
);

// ============================================================================
// FIX: regionMergeUtils.test.ts - Fix exactOptionalPropertyTypes
// ============================================================================
applyFix(
    'src/utils/regionMergeUtils.test.ts',
    'Fix exactOptionalPropertyTypes for value and label',
    c => {
        let result = c;
        // Remove explicit undefined values, use omission instead
        result = result.replace(
            /value: undefined,/g,
            '// value omitted,'
        );
        result = result.replace(
            /label: undefined,/g,
            '// label omitted,'
        );

        // Fix value and label assignments
        result = result.replace(
            /value:\s*(\w+)\s*\|\s*undefined/g,
            'value: $1'
        );
        result = result.replace(
            /label:\s*(\w+)\s*\|\s*undefined/g,
            'label: $1'
        );

        return result;
    }
);

console.log('\n' + '='.repeat(70));
console.log(`✅ Applied ${totalFixes} bulk fixes`);
console.log('='.repeat(70) + '\n');
