# HandleLogin Test Consolidation Map

## Executive Summary

**Problem**: 18/18 scenarios ambiguous, 58/148 steps ambiguous due to duplicate step definitions across multiple files.

**Root Cause**: Duplicate authentication and form interaction steps across `authentication.steps.ts`, `authentication-state.steps.ts`, `login.steps.ts`, and `form-interaction.steps.ts`.

**Solution**: Consolidate to shared files, remove duplicates, update HandleLogin.feature to use standardized steps.

---

## Critical Issues Found

### 1. Duplicate Authentication Steps (HIGHEST PRIORITY)

**Conflict**: Two different files define "not authenticated" steps

| File | Line | Step Definition | Action |
|------|------|----------------|--------|
| `authentication.steps.ts` | 58 | `Given('I am not authenticated'` | ✅ **KEEP** (canonical version) |
| `authentication-state.steps.ts` | 20 | `Given('I am not currently authenticated'` | ❌ **DELETE** (duplicate) |

**Impact**: HandleLogin.feature Background (line 13) uses "I am not currently authenticated" which will fail after removing duplicate.

**Fix**: Update HandleLogin.feature line 13 to use "I am not authenticated" instead.

---

### 2. Duplicate Authenticated User Steps

**Conflict**: Multiple files define authenticated user setup steps

| File | Line | Step Definition | Action |
|------|------|----------------|--------|
| `authentication.steps.ts` | 12 | `Given('I am authenticated as a Game Master'` | ✅ **KEEP** |
| `authentication.steps.ts` | 38 | `Given('I am authenticated with displayName {string}'` | ✅ **KEEP** |
| `authentication-state.steps.ts` | 34 | `Given('I am authenticated'` | ❌ **CONSOLIDATE** → Move to authentication.steps.ts |
| `authentication-state.steps.ts` | 43 | `Given('I am authenticated as {string}'` | ❌ **CONSOLIDATE** → Move to authentication.steps.ts |

**Recommendation**:
- Move the simple `I am authenticated` step from `authentication-state.steps.ts` to `authentication.steps.ts`
- Keep the `I am authenticated as {string}` in `authentication-state.steps.ts` (it's different - used by HandleLogin and Landing Page)
- **OR** Consolidate all authenticated steps into `authentication.steps.ts` and delete `authentication-state.steps.ts` entirely

---

### 3. Redundant Form Interaction Steps in login.steps.ts

**Problem**: login.steps.ts duplicates generic form interaction steps that should be in shared file

| login.steps.ts Line | Step Definition | Shared Alternative | Action |
|---------------------|----------------|-------------------|--------|
| 90 | `Given('I have entered valid credentials'` | Use `When('I enter email {string}'` + `When('I enter password {string}'` | ❌ **DELETE** |
| 99 | `When('I enter the correct email'` | `When('I enter email {string}'` | ❌ **DELETE** |
| 103 | `When('I enter the correct password'` | `When('I enter password {string}'` | ❌ **DELETE** |

**Rationale**: These hardcode specific test values. Feature files should use parameterized shared steps like `When I enter email "testuser@example.com"`.

---

### 4. Missing Shared Form Interaction Step

**Missing Step**: `When('I focus out of the email field'`

**Used By**: HandleLogin.feature scenario "Accept valid email format" (will add after fixing illogical scenario)

**Action**: ✅ **ADD** to `form-interaction.steps.ts`:
```typescript
When('I focus out of the email field', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).blur();
});
```

---

## Consolidation Actions

### Phase 1: Delete Duplicate Steps

#### File: `authentication-state.steps.ts`

**DELETE** the following steps (keep rest of file):
```typescript
// Line 20 - DELETE (duplicate of authentication.steps.ts line 58)
Given('I am not currently authenticated', async function (this: CustomWorld) {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});

// Line 34 - MOVE to authentication.steps.ts (or delete if keeping separate)
Given('I am authenticated', { timeout: 30000 }, async function (this: CustomWorld) {
    const password = process.env.BDD_TEST_PASSWORD!;
    await this.page.goto('/login');
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
});

// Line 28 - DELETE (duplicates form-interaction.steps.ts)
Given('I enter valid credentials', async function (this: CustomWorld) {
    const password = process.env.BDD_TEST_PASSWORD!;
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
});
```

**KEEP** the following step (used by HandleLogin and Landing Page):
```typescript
// Line 43 - KEEP (specific displayName variant)
Given('I am authenticated as {string}', { timeout: 30000 }, async function (this: CustomWorld, _displayName: string) {
    // ... implementation
});
```

---

#### File: `login.steps.ts`

**DELETE** the following steps:
```typescript
// Line 90 - DELETE
Given('I have entered valid credentials', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).fill('testuser@example.com');
    await this.page.getByRole('textbox', { name: /password/i }).fill('TestPassword123');
});

// Line 99 - DELETE
When('I enter the correct email', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).fill('testuser@example.com');
});

// Line 103 - DELETE
When('I enter the correct password', async function (this: CustomWorld) {
    await this.page.getByRole('textbox', { name: /password/i }).fill('TestPassword123');
});
```

**KEEP** all other steps in login.steps.ts (they are feature-specific for HandleLogin use case):
- "I am on the login page" (line 30)
- "an account exists with..." variations (lines 36, 46, 54)
- "the account is locked..." (line 70)
- "my account status is {string}" (line 75)
- All THEN assertions for login-specific behavior (2FA, session cookies, Redux state, etc.)

---

### Phase 2: Add Missing Shared Step

#### File: `form-interaction.steps.ts`

**ADD** after line 48:
```typescript
When('I focus out of the email field', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.blur();
});

When('I enter valid email {string}', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.clear();
    await emailInput.fill(email);
});
```

---

### Phase 3: Update HandleLogin.feature

#### Fix Background (line 13)

**BEFORE**:
```gherkin
Background:
  Given I am on the login page
  And I am not currently authenticated
```

**AFTER**:
```gherkin
Background:
  Given I am on the login page
  And I am not authenticated
```

---

#### Fix Illogical Scenario (lines 18-22)

**BEFORE**:
```gherkin
@validation
Scenario: Accept valid email format
  Given I enter email "gamemaster@example.com"
  When I submit the login form                    # ❌ WRONG: No password entered
  Then my email should pass client-side validation
  And my form is submitted                        # ❌ WRONG: Cannot submit without password
```

**AFTER** (Option A - Test only email validation):
```gherkin
@validation
Scenario: Accept valid email format
  Given I enter email "gamemaster@example.com"
  When I focus out of the email field
  Then my email should pass client-side validation
  And I should not see email validation errors
```

**AFTER** (Option B - Test full login flow):
```gherkin
@validation
Scenario: Accept valid email and password format
  Given an account exists with email "gamemaster@example.com" and password "SecurePass123"
  And I enter email "gamemaster@example.com"
  And I enter password "SecurePass123"
  When I submit the login form
  Then I should be authenticated successfully
  And I should be redirected to the dashboard
```

**Recommendation**: Use Option A to keep the scenario focused on email-only validation, as password validation is already covered in scenario at lines 35-41.

---

#### Update Scenarios to Use Shared Steps

**Scenarios that need updates**:

1. **Line 49** - "I enter the correct password" → Use `I enter password "SecurePass123"`
2. **Line 59** - "I enter the correct email" → Use `I enter email "user@example.com"`
3. **Line 92** - "I enter incorrect password {string}" → Already parameterized, but move to login.steps.ts (line 107) if not shared

**Example Update** (Line 66-75):
```gherkin
# BEFORE
@happy-path @critical
Scenario: Successful login with valid credentials
  Given an account exists with email "gamemaster@example.com" and password "SecurePass123"
  And I enter email "gamemaster@example.com"
  And I enter password "SecurePass123"
  When I submit the login form
  Then I should be authenticated successfully
  And a session cookie should be set by the server
  And I should be redirected to the dashboard
  And I should see my user information in the header
  And my auth state should be stored in Redux

# AFTER (no changes needed - already uses shared steps!)
```

---

### Phase 4: Add Missing Shared Step Definitions

#### File: `form-interaction.steps.ts`

**ADD** missing step needed for Option A scenario fix:
```typescript
Then('I should not see email validation errors', async function (this: CustomWorld) {
    const emailError = this.page.getByText(/invalid email address/i);
    await expect(emailError).not.toBeVisible();
});
```

---

## Verification Checklist

After implementing all consolidation actions:

- [ ] Run HandleLogin tests: `npm run test:bdd -- --tags "@use-case and @authentication"`
- [ ] Verify 0/18 scenarios ambiguous (down from 18/18)
- [ ] Verify 0/148 steps ambiguous (down from 58/148)
- [ ] All scenarios pass or have clear, actionable failures
- [ ] No duplicate step definitions remain
- [ ] All shared steps are reusable across features

---

## File Summary

### Files to MODIFY

1. **authentication-state.steps.ts** - Delete 3 duplicate steps
2. **login.steps.ts** - Delete 3 redundant steps
3. **form-interaction.steps.ts** - Add 3 missing steps
4. **HandleLogin.feature** - Update Background + fix 1 illogical scenario

### Files to KEEP AS-IS

1. **authentication.steps.ts** - Canonical authentication steps
2. **messages.steps.ts** - Error/success message assertions
3. **navigation.steps.ts** - Page navigation and transitions

---

## Estimated Effort

- Phase 1 (Delete duplicates): 15 minutes
- Phase 2 (Add missing steps): 10 minutes
- Phase 3 (Update HandleLogin.feature): 20 minutes
- Phase 4 (Add shared steps): 10 minutes
- Phase 5 (Run tests and fix): 30 minutes
- Phase 6 (Verification): 15 minutes

**Total**: ~1.5 hours (Medium complexity)

---

## Next Steps

1. ✅ Review and approve this consolidation map
2. Implement Phase 1: Delete duplicate steps
3. Implement Phase 2: Add missing shared steps
4. Implement Phase 3: Update HandleLogin.feature
5. Implement Phase 4: Add missing THEN assertions
6. Implement Phase 5: Run tests and fix any remaining issues
7. Implement Phase 6: Verify all scenarios pass

