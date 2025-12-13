# Testing Guide

Coverage ≥95% | AAA Pattern (Arrange, Act, Assert)

## Overview
| Aspect | C# (xUnit) | TypeScript (Vitest) |
|--------|------------|---------------------|
| Framework | xUnit+FluentAssertions+NSubstitute | Vitest+Testing Library+MSW |
| Location | `{Area}.UnitTests/` | `*.test.tsx` (colocated) |
| Class | `{Class}Tests` | `describe('{Component}')` |
| Method | `{Method}_{Scenario}_{Expected}` | `should {expected} when {scenario}` |

Philosophy: Unit→SHOULD PASS (mocks, fast, every commit) | BDD→SHOULD FAIL (real deps, slow, black-box)

## What to Test
Backend: Services | Handlers | Validation | Middleware | Skip: EF mappings, third-party
Frontend: Components | Interactions | Hooks | Slices | Skip: Third-party, styling-only

## C# Tests
```csharp
[Fact]
public async Task CreateAsync_ValidData_ReturnsCreated() {
    // Arrange
    var storage = Substitute.For<IGameSessionStorage>();
    var svc = new GameSessionService(storage);
    // Act
    var result = await svc.CreateAsync(userId, new CreateData { Title = "Test" });
    // Assert
    result.StatusCode.Should().Be(HttpStatusCode.Created);
    await storage.Received(1).AddAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
}

[Theory]
[InlineData("", false)]
[InlineData("Valid", true)]
public void Validate_Title(string title, bool valid) { }
```

## TypeScript Tests
```typescript
describe('LoginForm', () => {
    it('should render email field', () => {
        render(<LoginForm />);
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });
    it('should submit', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<LoginForm onSubmit={onSubmit} />);
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /submit/i }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });
});
```
Query priority: getByRole → getByLabelText → getByText → getElementById
❌ getByTestId | ❌ data-testid | ❌ container.querySelector

## BDD (Cucumber+Playwright)
**Black-box testing**: Real UI + Real DB + Real API | ❌ Component internals | ❌ Mock business logic
```typescript
When('I create asset {string}', async function(name) {
    await this.page.click('#btn-create-asset');
    await this.page.fill('input[name="name"]', name);
    await this.page.click('#btn-save');
});
Then('asset exists in DB', async function() {
    const asset = await this.db.queryTable('Assets', { Name: 'Dragon' });
    expect(asset.OwnerId).toBe(this.currentUser.id);
});
```

## BDD Anti-Patterns (CRITICAL)
```typescript
// ❌ Step-to-step calls
await this['I Alt+Click'](); // DON'T! Extract helper function instead

// ❌ Hardcoded credentials
'Server=localhost;' // Use: this.getRequiredEnv('DATABASE_CONNECTION_STRING')

// ❌ SQL injection in table names
`SELECT * FROM ${tableName}` // Use whitelist: ALLOWED_TABLES.includes(tableName)

// ❌ Catch-all regex
Given(/^(.*)$/, async function(step) { }); // Let Cucumber report undefined

// ❌ Excessive any
currentAsset: any = null; // Use: Asset | null

// ❌ Hardcoded timeouts
await this.page.waitForTimeout(100); // Use: await expect(el).toBeChecked({ timeout: 5000 })

// ❌ Brittle selectors
'button:has-text("Save")' // Use: '#btn-save'
```

## BDD Lifecycle
BeforeAll: Cleanup orphans → Create user pool
Before: Acquire user → Init browser
After: `deleteUserDataOnly()` (NOT deleteUser!) → Reset state → Release user
AfterAll: Delete pool users

```typescript
// Browser cleanup
await this.context.clearCookies();
await this.page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

// Test user - userName = email per AuthService.cs:81
const user = { email, userName: email, emailConfirmed: true, passwordHash: process.env.BDD_TEST_PASSWORD_HASH! };
```

## BDD Errors & Fixes
| Error | Fix |
|-------|-----|
| Cucumber "null" crash | Delete duplicate step definition |
| "Undefined parameter {id}" | Use `{string}` |
| "Alternative empty" | Escape `\/` in step text |
| 401 after login | Remove `extraHTTPHeaders` |
| LocalDB timeout | Use `msnodesqlv8` + ODBC 17 |
| about:blank redirect | Use clearCookies() not context.close() |
| 0 scenarios | Add feature to both profiles in cucumber.cjs |

## Semantic IDs
Convention: `#btn-{action}` | `#card-{name}` | `#section-{name}` | `#input-{field}`
```typescript
await this.page.locator('#btn-save').click(); // ✓
await this.page.locator('button:has-text("Save")').click(); // ✗
```

## Helper Reusability
Tier 1 (20+ uses): Create immediately | Tier 2 (10-19): Create on 2nd use | Tier 3 (5-9): Wait for 3rd | Tier 4 (<5): Inline
Location: `e2e/support/helpers/` (keyboard, upload, database, wait)

## Commands
```bash
dotnet test --filter "FullyQualifiedName~TestClass"     # Backend
npm test -- TestFile.test.ts --run                       # Frontend
npm run test:bdd                                         # All BDD
npm run test:bdd:scenario "Name"                         # Single
npm run test:bdd:debug:scenario "Name"                   # Visible browser
npm run test:bdd:dry-run                                 # Find undefined
```

## Isolation Checklist
Each test: clean state | After: deleteUserDataOnly() | Browser cleared | Pass solo AND suite | No hardcoded timeouts | No shared mutable state | User pool ≥ workers
