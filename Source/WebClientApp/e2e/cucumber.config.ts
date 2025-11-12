/**
 * Cucumber.js Configuration
 * BDD Test Suite for VTTTools Asset Management (Phase 5)
 *
 * Framework: Cucumber.js 7.x + Playwright
 * Coverage: ~200 scenarios across 5 feature files
 */

const config = {
  requireModule: ['ts-node/register'],
  require: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
  format: [
    'progress-bar',
    'html:e2e/reports/cucumber-report.html',
    'json:e2e/reports/cucumber-report.json',
    '@cucumber/pretty-formatter',
  ],
  formatOptions: {
    snippetInterface: 'async-await',
    colorsEnabled: true,
  },
  parallel: 2,
  retry: 1,
  strict: true,
  dryRun: false,
  paths: [
    '../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature',
    '../../Documents/Areas/Identity/Features/**/*.feature',
  ],
  // Tag-based test execution
  // Run: npm run test:bdd -- --tags "@smoke"
  // Run: npm run test:bdd -- --tags "@happy-path and not @wip"
  tags: process.env.CUCUMBER_TAGS || 'not @wip and not @skip',
};

export default config;
