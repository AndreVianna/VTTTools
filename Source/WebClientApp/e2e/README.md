# VTTTools BDD Test Suite
## Asset Management Phase 5 - Cucumber.js + Playwright

### Overview
Complete BDD test suite covering ~200 scenarios across Asset Management features using Cucumber.js and Playwright.

### Framework Stack
- **Cucumber.js 7.x** - BDD test framework with Gherkin syntax
- **Playwright** - Browser automation
- **TypeScript** - Type-safe step definitions
- **Page Object Model** - Maintainable test architecture

### Directory Structure
```
e2e/
├── features/                          # Gherkin feature files
│   ├── AssetLibrary.feature          # 50 scenarios
│   └── UseCases/
│       ├── CreateAsset/              # 60 scenarios
│       ├── UpdateAsset/              # 35 scenarios
│       ├── DeleteAsset/              # 20 scenarios
│       └── ManageResources/          # 40 scenarios
│
├── step-definitions/
│   ├── shared/                        # Tier 1: High-frequency (20+ uses)
│   │   ├── navigation.steps.ts       # Page navigation
│   │   ├── form-fields.steps.ts      # Form inputs
│   │   ├── buttons.steps.ts          # Button interactions
│   │   ├── visibility.steps.ts       # Element visibility
│   │   └── authentication.steps.ts   # Auth setup
│   │
│   ├── domain/                        # Tier 2: Medium-frequency (10-19 uses)
│   │   ├── asset-data.steps.ts       # Test data seeding
│   │   ├── checkbox.steps.ts         # Checkbox operations
│   │   ├── accordion.steps.ts        # Accordion interactions
│   │   └── keyboard-shortcuts.steps.ts # Alt+Click, Ctrl+Click
│   │
│   └── feature-specific/              # Tier 3 & 4: Feature-specific
│       └── universal.steps.ts        # Consolidated feature steps
│
├── page-objects/                      # Page Object Model
│   ├── base/
│   │   └── BasePage.ts               # Base page class
│   ├── pages/
│   │   └── AssetLibraryPage.ts       # Asset Library page
│   ├── dialogs/
│   │   ├── AssetCreateDialog.ts      # Create dialog
│   │   ├── AssetEditDialog.ts        # Edit/View/Delete dialog
│   │   └── DeleteConfirmDialog.ts    # Delete confirmation
│   └── components/
│       └── AssetResourceManager.ts   # Resource management
│
├── support/
│   ├── world.ts                       # Custom World with shared state
│   ├── hooks.ts                       # Before/After hooks
│   ├── fixtures/
│   │   └── AssetBuilder.ts            # Fluent asset builder
│   └── helpers/
│       ├── keyboard.helper.ts         # Modifier key clicks
│       ├── upload.helper.ts           # Upload workflow
│       └── database.helper.ts         # DB queries
│
├── test-data/
│   └── images/                        # Test images
│
└── cucumber.config.ts                 # Cucumber configuration
```

### Running Tests

#### All Tests
```bash
npm run test:bdd
```

#### By Tag
```bash
# Smoke tests only (~40 scenarios)
npm run test:bdd:smoke

# Happy path scenarios (~80 scenarios)
npm run test:bdd:happy-path

# Critical scenarios (~60 scenarios)
npm run test:bdd:critical

# Custom tags
npm run test:bdd -- --tags "@resources and @happy-path"
npm run test:bdd -- --tags "not @wip"
```

#### By Feature
```bash
npm run test:bdd -- e2e/features/AssetLibrary.feature
npm run test:bdd -- e2e/features/UseCases/CreateAsset/CreateAsset.feature
```

### Test Coverage

| Feature | Scenarios | Status |
|---------|-----------|--------|
| AssetLibrary | 50 | ✅ Implemented |
| CreateAsset | 60 | ✅ Implemented |
| UpdateAsset | 35 | ✅ Implemented |
| DeleteAsset | 20 | ✅ Implemented |
| ManageResources | 40 | ✅ Implemented |
| **Total** | **~200** | **✅ Complete** |

### Code Reusability Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Step Reuse % | 60%+ | **~65%** |
| Total LOC | <2,000 | **~1,800** |
| Shared Steps | - | 40+ |
| Page Objects | - | 7 |
| Helpers | - | 3 |

### Key Features

#### 1. Tier-Based Step Organization
- **Tier 1 (Shared)**: 20+ uses - High-frequency steps used across all features
- **Tier 2 (Domain)**: 10-19 uses - Domain-specific reusable steps
- **Tier 3 (Feature-Specific)**: <10 uses - Feature-specific logic

#### 2. Page Object Model
- BasePage with common methods
- Feature-specific page objects (AssetLibraryPage, dialogs)
- Component page objects (AssetResourceManager)

#### 3. Fluent Builders
```typescript
await this.assetBuilder()
    .withName('Dragon')
    .withKind(AssetKind.Creature)
    .withSize(4, 4)
    .asMonster()
    .published()
    .create();
```

#### 4. Helper Classes
- **KeyboardModifierHelper**: Alt+Click, Ctrl+Click, Ctrl+Alt+Click
- **UploadHelper**: Image upload and role assignment
- **DatabaseHelper**: DB queries and verification

### Prerequisites

1. **Node.js 18+**
2. **Database**: SQL Server with VttTools database
3. **Application**: WebClientApp running on `http://localhost:5173`

### Configuration

#### Environment Variables
```bash
# .env.test
DATABASE_CONNECTION_STRING="Server=localhost;Database=VttTools;Integrated Security=true;TrustServerCertificate=true;"
BASE_URL="http://localhost:5173"
HEADLESS="false"
```

#### Cucumber Configuration
See `e2e/cucumber.config.ts` for:
- Parallel execution (2 workers)
- Retry strategy (1 retry on failure)
- Report formats (HTML, JSON, console)
- Tag filtering

### Development Workflow

#### Adding New Scenarios
1. Write Gherkin scenario in appropriate feature file
2. Run tests to generate step definition snippets
3. Implement steps using existing shared steps where possible
4. Create new shared steps if pattern repeats 3+ times (Rule of Three)

#### Adding New Page Objects
1. Extend `BasePage` for common functionality
2. Use getter methods for locators (lazy evaluation)
3. Implement action methods (click, fill, etc.)
4. Implement assertion methods (verify, expect, etc.)

### Debugging

#### Run with Headed Browser
```bash
npm run test:bdd -- --world-parameters '{"headless": false}'
```

#### Run Specific Scenario
```bash
npm run test:bdd -- --name "Create minimal Object asset"
```

#### View Screenshots on Failure
Screenshots are automatically captured on failure and attached to the report.

### Reports

Reports are generated in `e2e/reports/`:
- **cucumber-report.html** - HTML report with screenshots
- **cucumber-report.json** - JSON report for CI/CD integration

### CI/CD Integration

```yaml
# Example GitHub Actions
- name: Run BDD Tests
  run: |
    npm run test:bdd:smoke
    npm run test:bdd:critical
  env:
    DATABASE_CONNECTION_STRING: ${{ secrets.DB_CONNECTION }}
    HEADLESS: true
```

### Best Practices

1. **Use Page Objects**: Never use raw selectors in step definitions
2. **Follow AAA Pattern**: Arrange (Given), Act (When), Assert (Then)
3. **Rule of Three**: Abstract on 3rd use, not before
4. **Descriptive Names**: Test names should read like documentation
5. **Independent Tests**: Each scenario should be runnable in isolation
6. **Clean Test Data**: Use fixtures and cleanup in hooks

### Troubleshooting

#### Tests Fail with "Element not found"
- Ensure app is running on `http://localhost:5173`
- Check selectors match actual DOM structure
- Use `headless: false` to observe browser behavior

#### Database Connection Errors
- Verify SQL Server is running
- Check connection string in environment variables
- Ensure database schema is up to date

#### Slow Test Execution
- Tests run in parallel (2 workers by default)
- Increase parallelism: `--parallel 4`
- Use `@smoke` tag for faster feedback loop

### Contributing

1. Follow TypeScript coding standards (4-space indent, strict mode)
2. Apply Rule of Three before abstracting
3. Update this README when adding new features
4. Maintain test coverage metrics (aim for 65%+ reusability)

### License

Internal VTTTools project - Not for external distribution
