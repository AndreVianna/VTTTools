#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = 'src/utils/encounterStateUtils.test.ts';
const absPath = path.join(__dirname, file);

let content = fs.readFileSync(absPath, 'utf8');

// Fix the syntax error - remove comment inside function call
content = content.replace(
    /filterEncounterForMergeDetection\(encounter, \{ \/\/ excludeRegionIndex omitted \}\);/g,
    'filterEncounterForMergeDetection(encounter, {});'
);

fs.writeFileSync(absPath, content, 'utf8');
console.log('✅ Fixed syntax error in encounterStateUtils.test.ts');
