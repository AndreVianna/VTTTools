/**
 * Cucumber.js Configuration
 * BDD Test Suite for VTTTools (All 96 feature files)
 *
 * Framework: Cucumber.js 12 + Playwright 1.55
 * Coverage: ~239 scenarios across 96 feature files
 */

require('dotenv').config();

module.exports = {
  default: {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
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
    parallel: parseInt(process.env.PARALLEL_WORKERS || '1', 10),
    retry: 0,
    strict: true,
    dryRun: false,
    tags: 'not @ignore',
    paths: [
      '../../Documents/Areas/Onboarding/Features/LandingPage/LandingPage.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/HandleRegistration/HandleRegistration.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/Handlelogin/HandleLogin.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/Handlelogout/HandleLogout.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/RequestPasswordReset/RequestPasswordReset.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/ConfirmPasswordReset/ConfirmPasswordReset.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/DisplayAuthStatus/DisplayAuthStatus.feature',
      '../../Documents/Areas/Identity/Features/AccountManagement/UseCases/ViewSecuritySettings/ViewSecuritySettings.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/AssetLibrary.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Createasset/CreateAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Updateasset/UpdateAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Deleteasset/DeleteAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/ManageResources/ManageResources.feature',
    ],
  },
  debug: {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
    format: ['progress-bar', '@cucumber/pretty-formatter'],
    parallel: 1,
    retry: 0,
    worldParameters: {
      headless: false,
    },
    tags: 'not @ignore',
    paths: [
      '../../Documents/Areas/Onboarding/Features/LandingPage/LandingPage.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/HandleRegistration/HandleRegistration.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/Handlelogin/HandleLogin.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/Handlelogout/HandleLogout.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/RequestPasswordReset/RequestPasswordReset.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/ConfirmPasswordReset/ConfirmPasswordReset.feature',
      '../../Documents/Areas/Identity/Features/UserAuthentication/UseCases/DisplayAuthStatus/DisplayAuthStatus.feature',
      '../../Documents/Areas/Identity/Features/AccountManagement/UseCases/ViewSecuritySettings/ViewSecuritySettings.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/AssetLibrary.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Createasset/CreateAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Updateasset/UpdateAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/Deleteasset/DeleteAsset.feature',
      '../../Documents/Areas/Assets/Features/AssetManagement/UseCases/ManageResources/ManageResources.feature',
    ],
  },
  smoke: {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
    format: ['progress-bar'],
    parallel: parseInt(process.env.PARALLEL_WORKERS || '1', 10),
    retry: 0,
    paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
    tags: '@smoke and not @ignore',
  },
  'happy-path': {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
    format: ['progress-bar'],
    parallel: parseInt(process.env.PARALLEL_WORKERS || '1', 10),
    retry: 0,
    paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
    tags: '@happy-path and not @ignore',
  },
  critical: {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
    format: ['progress-bar'],
    paths: ['../../Documents/Areas/Assets/Features/AssetManagement/**/*.feature'],
    parallel: parseInt(process.env.PARALLEL_WORKERS || '1', 10),
    retry: 0,
    tags: '@critical and not @ignore',
  },
  feature: {
    import: ['e2e/step-definitions/**/*.steps.ts', 'e2e/support/hooks.ts'],
    loader: ['ts-node/esm'],
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
    parallel: parseInt(process.env.PARALLEL_WORKERS || '1', 10),
    tags: 'not @ignore',
    retry: 0,
    strict: true,
    dryRun: false,
  },
};
