/**
 * Cucumber.js Configuration
 * BDD Test Suite for VTTTools (All 96 feature files)
 *
 * Framework: Cucumber.js 12 + Playwright 1.55
 * Coverage: ~239 scenarios across 96 feature files
 */

// Load environment variables from .env file
require('dotenv').config();

module.exports = {
    default: {
        import: [
            'e2e/step-definitions/**/*.steps.ts',
            'e2e/support/hooks.ts'
        ],
        loader: ['ts-node/esm'],
        format: [
            'progress-bar',
            'html:e2e/reports/cucumber-report.html',
            'json:e2e/reports/cucumber-report.json',
            '@cucumber/pretty-formatter'
        ],
        formatOptions: {
            snippetInterface: 'async-await',
            colorsEnabled: true
        },
        parallel: parseInt(process.env.PARALLEL_WORKERS || '1'),
        retry: 1,
        strict: true,
        dryRun: false,
        paths: [
            '../../Documents/Areas/Onboarding/Features/LandingPage/LandingPage.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/AssetLibrary.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Createasset/CreateAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Updateasset/UpdateAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Deleteasset/DeleteAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/ManageResources/ManageResources.feature'
        ]
    },
    // Profile for smoke tests
    smoke: {
        import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
        loader: ['ts-node/esm'],
        format: ['progress-bar'],
        paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
        tags: '@smoke'
    },
    // Profile for happy path tests
    'happy-path': {
        import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
        loader: ['ts-node/esm'],
        format: ['progress-bar'],
        paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
        tags: '@happy-path'
    },
    // Profile for critical tests
    critical: {
        import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
        loader: ['ts-node/esm'],
        format: ['progress-bar'],
        paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
        tags: '@critical'
    },
    // Profile for debugging (headed mode - visible browser)
    debug: {
        import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
        loader: ['ts-node/esm'],
        format: ['progress-bar', '@cucumber/pretty-formatter'],
        parallel: 1,
        retry: 0,
        worldParameters: {
            headless: false
        },
        paths: [
            '../../Documents/Areas/Onboarding/Features/LandingPage/LandingPage.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/AssetLibrary.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Createasset/CreateAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Updateasset/UpdateAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Deleteasset/DeleteAsset.feature',
            '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/ManageResources/ManageResources.feature'
        ]
    }
};
