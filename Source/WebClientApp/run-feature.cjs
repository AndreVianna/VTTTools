#!/usr/bin/env node
/**
 * Helper script to run a feature file by name
 * Usage: npm run test:bdd:feature LandingPage
 */

const { execSync } = require('node:child_process');
const { globSync } = require('glob');

const featureName = process.argv[2];

if (!featureName) {
  console.error('Error: Please provide a feature name');
  console.error('Usage: npm run test:bdd:feature LandingPage');
  process.exit(1);
}

// Search for feature file
const pattern = `../../Documents/Areas/**/${featureName}.feature`;
const matches = globSync(pattern, { cwd: __dirname });

if (matches.length === 0) {
  console.error(`Error: No feature file found matching "${featureName}"`);
  console.error(`Searched: ${pattern}`);
  process.exit(1);
}

if (matches.length > 1) {
  console.error(`Error: Multiple feature files found for "${featureName}":`);
  for (const m of matches) {
    console.error(`  - ${m}`);
  }
  process.exit(1);
}

const featurePath = matches[0];
console.log(`Running: ${featurePath}\n`);

// Run cucumber with the found feature
const cmd = `npx cross-env NODE_OPTIONS='--disable-warning=DEP0180' cucumber-js  --profile feature ${featurePath}`;

try {
  execSync(cmd, { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  process.exit(error.status || 1);
}
