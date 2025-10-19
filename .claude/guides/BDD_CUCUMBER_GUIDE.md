# Cucumber BDD Features - Cheat Sheet

## Core Concepts

### Generating Feature Files with the Template
To streamline feature file creation and ensure consistency across your test suite, use the provided `CUCUMBER_TEMPLATE.feature` file.
The template uses DSL syntax with variables (like `{feature_name}`, `{user_role}`), conditional blocks (`<if>...</if>`, `<case>...</case>`) and loops (`<foreach>...</foreach>`, `<while>...</while>`) to dynamically generate properly structured `.feature` files.
Before processing, replace all variables with your actual values: set `{feature_name}` to your feature title, populate `{scenarios}` list with your test cases, and configure flags like `{has_background}` or `{use_data_table}` based on your needs. 
The template automatically adapts its structure - it includes Background sections when `{has_background}` is true, generates Scenario Outlines when `{scenario_is_outline}` is set, and creates feature-specific scenarios based on `{feature_type}` (authentication, crud_operations, search, workflow).
This approach ensures all team members create consistent, well-structured feature files that follow BDD principles while reducing boilerplate work.

### Template Usage Guide

#### How to Use the Feature Template
• Copy the template to create your `.feature` file
• Replace all variables (in curly braces) with your actual values
• Set boolean flags (true/false) to control which sections are included
• Remove or modify control flow blocks as needed
• The DSL syntax will be processed to generate the final feature file

#### Template Variable Definitions

**Required Variables:**
• `{feature_name}` - Name of the feature (e.g., "User Login")
• `{user_role}` - Who will use this feature (e.g., "registered user")
• `{feature_goal}` - What the user wants to do (e.g., "access my account")
• `{business_value}` - Why this is important (e.g., "I can use personalized features")
• `{scenarios}` - List of scenario descriptions
• `{given_step}`, `{when_step}`, `{then_step}` - Core scenario steps

**Optional Flags (set to true/false):**
• `{has_background}` - Include Background section
• `{has_rule}` - Include Rule grouping
• `{scenario_is_outline}` - Make scenario a Scenario Outline
• `{use_data_table}` - Include data tables in scenarios
• `{has_doc_string}` - Include doc strings (multi-line text)
• `{is_negative_scenario}` - Tag as negative test
• `{is_edge_case}` - Tag as edge case
• `{include_performance_tests}` - Add performance scenarios
• `{include_accessibility_tests}` - Add accessibility scenarios
• `{include_api_tests}` - Add API test scenarios

**Feature Types (for CASE statement):**
• `"authentication"` - Login/security scenarios
• `"crud_operations"` - Create, Read, Update, Delete scenarios
• `"search"` - Search functionality scenarios
• `"workflow"` - Multi-step process scenarios
• Other values - Default basic scenarios

#### Template Example Usage
Set variables like:
```
{feature_name}="Shopping Cart"
{user_role}="online shopper"
{feature_goal}="manage my shopping cart"
{business_value}="I can purchase products"
{has_background}=true
{background_steps}=["I am logged in", "I have products in my catalog"]
{scenarios}=["Add item to cart", "Remove item from cart", "Update quantity"]
{feature_type}="crud_operations"
{entity}="cart item"
```

The template will generate a properly formatted `.feature` file with all specified components.

### Gherkin Language
• **Definition**: Domain-specific language for writing executable specifications
• **Human-readable**: Plain text that non-technical stakeholders can understand
• **Structure**: Uses whitespace and control characters for formatting
• **File Extension**: `.feature`
• **Comments**: Start with `#` at beginning of new line

## Gherkin Keywords

### Primary Keywords (Must be followed by `:`)

#### Feature
• **Purpose**: High-level description of software feature
• **Usage**: Groups related scenarios
• **Location**: First primary keyword in file
• **Format**:
```gherkin
Feature: User Authentication
  As a registered user
  I want to log in to the application
  So that I can access my account
```

#### Rule
• **Purpose**: Represents one business rule (Since Gherkin v6)
• **Usage**: Groups scenarios that belong to specific business rule
• **Location**: After Feature, before Scenarios
• **Format**:
```gherkin
Rule: Password must be at least 8 characters
  Scenario: Valid password
  Scenario: Invalid password
```

#### Background
• **Purpose**: Common setup steps for all scenarios in a feature
• **Usage**: Replaces repetitive Given steps
• **Execution**: Runs before each scenario, after @Before hooks
• **Limitations**: 
  - Only one per Feature or Rule
  - Cannot use with Scenario Outline variables
  - Should contain only Given steps
• **Format**:
```gherkin
Background:
  Given the database is clean
  And test data is loaded
```

### Scenario Keywords

#### Scenario
• **Purpose**: Describes specific test case or user journey
• **Usage**: Single path through the feature
• **Format**:
```gherkin
Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter valid credentials
  Then I should be logged in
```

#### Scenario Outline (or Scenario Template)
• **Purpose**: Run same scenario with different data sets
• **Usage**: Data-driven testing
• **Requires**: Examples table
• **Format**:
```gherkin
Scenario Outline: Login with different users
  Given I am on login page
  When I login as "<email>" with password "<password>"
  Then I should see "<result>"
  
  Examples:
    | email             | password | result        |
    | admin@host.com    | pass123  | Welcome Admin |
    | user@test.net     | pass456  | Welcome User  |
```

### Step Keywords

#### Given
• **Purpose**: Set up initial context/preconditions
• **Usage**: Describes system state before action
• **Best Practice**: Past tense or present state
```gherkin
Given I have $100 in my account
```

#### When
• **Purpose**: Describes action/event that triggers behavior
• **Usage**: User actions or system events
• **Best Practice**: Present tense
```gherkin
When I withdraw $20
```

#### Then
• **Purpose**: Describes expected outcome
• **Usage**: Assertions and verifications
• **Best Practice**: Should be observable
```gherkin
Then my balance should be $80
```

#### And / But
• **Purpose**: Continue previous step type for readability
• **Usage**: Avoids repetition of Given/When/Then
```gherkin
Given I am logged in
And I have items in cart
But I have no saved payment methods
```

#### * (Asterisk)
• **Purpose**: Alternative to any step keyword
• **Usage**: Bullet-point style lists
```gherkin
Given I have:
  * Eggs
  * Milk
  * Butter
```

## Data Handling

### Data Tables
• **Purpose**: Pass tabular data to single step
• **Usage**: Multiple related data points
• **Format**: Pipe-separated values
```gherkin
Given I have the following books:
  | Title                | Author      | Price |
  | The Hobbit          | Tolkien     | 15.99 |
  | Dune                | Herbert     | 12.99 |
```

### Doc Strings
• **Purpose**: Pass multi-line text to step
• **Usage**: Large text blocks, JSON, XML
• **Format**: Triple quotes
```gherkin
Given a blog post with content:
  """
  This is a multi-line
  text content that preserves
  formatting and line breaks.
  """
```

### Examples Table
• **Purpose**: Provide data for Scenario Outline
• **Usage**: Multiple test iterations
• **Format**: First row = headers, following rows = data
```gherkin
Examples:
  | input | output |
  | 2     | 4      |
  | 3     | 9      |
```

## Tags

### Purpose
• Filter scenarios for execution
• Group related tests
• Control hooks execution

### Format
```gherkin
@smoke @regression
Feature: Login

@critical @authentication
Scenario: Admin login
```

### Common Uses
• `@smoke` - Quick validation tests
• `@regression` - Full regression suite
• `@wip` - Work in progress
• `@skip` - Tests to skip
• `@slow` - Long-running tests

## Best Practices

### Scenario Writing

#### Do's
• **Write declarative scenarios** - Focus on what, not how
• **Keep scenarios independent** - Each should run in isolation
• **Use business language** - Terms stakeholders understand
• **One behavior per scenario** - Single clear purpose
• **Keep scenarios concise** - 3-7 steps ideal
• **Use meaningful titles** - Describe the behavior being tested

#### Don'ts
• **Avoid implementation details** - No CSS selectors, IDs, or technical details
• **Don't test multiple behaviors** - Split into separate scenarios
• **Avoid conjunctive steps** - Break "and" actions into separate steps
• **Don't overuse Scenario Outlines** - Only for truly data-driven tests

### Good vs Bad Examples

#### ❌ Bad - Imperative (too detailed)
```gherkin
Given I open browser
When I navigate to "/login"
And I find element with id "email"
And I type "john@email.com"
And I find element with id "password"
And I type "secret123"
And I click button with class "submit-btn"
Then I should see element with text "Dashboard"
```

#### ✅ Good - Declarative (business-focused)
```gherkin
Given I am on the login page
When I log in as "john@email.com"
Then I should see the dashboard
```

### Step Definitions

#### Guidelines
• **Keep steps reusable** - Generic enough for multiple scenarios
• **Avoid UI-specific steps** - Focus on behavior
• **Use parameters** - Make steps flexible
• **Group related steps** - Organize by feature/domain

#### Example
```csharp
@When("I log in as {string}")
public void iLogInAs(String email) {
    // Implementation details hidden here
    loginPage.loginAs(email);
}
```

## Anti-Patterns to Avoid

### 1. Feature-Coupled Steps
• **Problem**: Steps that can't be reused across features
• **Solution**: Write generic, reusable steps

### 2. Testing Through UI Only
• **Problem**: Slow, brittle tests that break with UI changes
• **Solution**: Layer tests - use API/service layer when possible

### 3. Scenario Outline Overuse
• **Problem**: Explosion of test cases, slow execution
• **Solution**: Use sparingly, prefer single examples for UI tests

### 4. Testing Implementation
• **Problem**: Tests break when implementation changes
• **Solution**: Test behavior and outcomes, not methods

### 5. Missing Scenario Titles
• **Problem**: Unclear test purpose
• **Solution**: Always provide descriptive titles

### 6. Using Cucumber for Unit Tests
• **Problem**: Verbose, hard to maintain
• **Solution**: Use appropriate testing tools (JUnit, NUnit, etc.)

### 7. Conjunctive Steps
• **Problem**: Multiple actions in one step
• **Solution**: Split into atomic steps

### 8. Too Many Scenarios
• **Problem**: Slow test suite, maintenance burden
• **Solution**: Focus on critical paths, use other test levels

### 9. Stub Step Definitions (FALSE POSITIVES) ⚠️ CRITICAL
• **Problem**: Steps that only log/attach messages without implementing actual functionality
• **Impact**: Creates **FALSE POSITIVES** - steps appear to pass but don't set up required state
• **Example of BAD stub**:
```typescript
Given('an account is locked', async function() {
    this.attach('Account locked scenario', 'text/plain'); // ❌ FALSE POSITIVE
});
```
• **Why it's dangerous**:
  - Given step "passes" but doesn't actually lock the account
  - Subsequent steps fail with confusing timeout errors
  - Test results are misleading - scenario appears valid but isn't
  - Hides missing implementation behind passing tests
• **MANDATORY Solution**: Replace ALL stubs with explicit "NOT IMPLEMENTED" errors
```typescript
Given('an account is locked', async function() {
    throw new Error('NOT IMPLEMENTED: Step needs to lock account in database');
});
```
• **✅ Benefits**:
  - Immediate, clear failure with descriptive message
  - No confusion about what needs implementation
  - Test results accurately reflect implementation status
  - Team knows exactly what work remains
• **⚠️ CRITICAL RULE**: NEVER commit step definitions that only use `this.attach()`, `console.log()`, or comments. ALL steps MUST either:
  1. Implement the required functionality, OR
  2. Throw an explicit "NOT IMPLEMENTED" error with description

## Hooks

### Types
• **@Before** - Runs before each scenario
• **@After** - Runs after each scenario
• **@BeforeStep** - Runs before each step
• **@AfterStep** - Runs after each step

### Usage
```java
@Before
public void setup() {
    // Initialize browser, database, etc.
}

@After
public void teardown() {
    // Clean up resources
}

@Before("@database")
public void setupDatabase() {
    // Tagged hook - runs only for @database scenarios
}
```

### Execution Order
1. @Before hooks (in order if multiple)
2. Background steps
3. Scenario steps
4. @After hooks (reverse order)

## Common Examples

### Login Example
```gherkin
Feature: User Authentication

Background:
  Given the system has the following users:
    | email             | password | role  |
    | admin@host.com    | pass123  | admin |
    | user@test.net     | pass456  | user  |

Scenario: Successful login
  When I log in as "admin" with password "pass123"
  Then I should be logged in as "admin"
  And I should have "admin" permissions
```

### Search Example
```gherkin
Scenario Outline: Search for products
  Given I am on the search page
  When I search for "<query>"
  Then I should see <count> results
  And the results should contain "<expected>"
  
  Examples:
    | query     | count | expected   |
    | laptop    | 10    | Dell XPS   |
    | phone     | 5     | iPhone     |
```

### Validation Example
```gherkin
Scenario: Form validation
  Given I am on the registration form
  When I submit the form with:
    | Field    | Value           |
    | Email    | invalid-email   |
    | Password | 123             |
  Then I should see the following errors:
    | Email must be valid     |
    | Password too short      |
```

## Tips for Success

### Collaboration
• **Three Amigos sessions** - Product Owner, Developer, Tester collaborate
• **Example Mapping** - Discover rules and examples before writing scenarios
• **Living Documentation** - Keep features as single source of truth

### Maintenance
• **Regular refactoring** - Update scenarios as understanding evolves
• **Delete obsolete scenarios** - Don't keep tests "just because"
• **Review test suite** - Ensure alignment with business goals

### Performance
• **Parallelize execution** - Run features concurrently
• **Layer tests appropriately** - Not everything needs UI testing
• **Use tags for subsets** - Run smoke tests frequently, full suite less often

### Language Support
• **Localization**: Gherkin supports 70+ languages
• **Custom keywords**: Use `# language: [code]` at file start
• **Example** (French):
```gherkin
# language: fr
Fonctionnalité: Connexion
  Scénario: Connexion réussie
    Étant donné que je suis sur la page de connexion
    Quand je me connecte
    Alors je devrais voir le tableau de bord
```

## Quick Reference

### Step Definition Patterns (Java)
```java
// Cucumber Expressions
@Given("I have {int} items in cart")
@When("I add {string} to cart")
@Then("the total should be ${float}")

// Regular Expressions
@Given("^I have (\\d+) items$")
@When("^I search for \"([^\"]*)\"$")

// Data Tables
@Given("the following users exist:")
public void usersExist(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();
}

// Doc Strings
@Given("a document with content:")
public void documentWithContent(String docString) {
    // Use docString
}
```

### Command Line Options
```bash
# Run specific tags
cucumber --tags @smoke

# Run all except certain tags
cucumber --tags "not @slow"

# Generate reports
cucumber --format html --out report.html

# Dry run (check step definitions)
cucumber --dry-run
```

## Remember
• **BDD is about collaboration**, not just test automation
• **Cucumber is not a testing tool** - it's a collaboration tool that happens to execute tests
• **Focus on business value** - Every scenario should relate to business goals
• **Keep it simple** - If a scenario is hard to write, the requirement might be unclear

---

# Feature File Excellence Guide

## Complete Feature File Example (HIGH QUALITY)

This section demonstrates a complete, production-ready feature file following all best practices:

```gherkin
# user_registration.feature
@feature @authentication @user-management
Feature: User Registration
  As a new visitor
  I want to create an account
  So that I can access personalized features

  Background:
    Given the registration service is operational
    And no account exists with email "john@example.com"

  Rule: Email must be unique across all users

    Scenario: Register with unique email
      Given I am on the registration page
      When I register with email "john@example.com"
      Then my account should be created successfully
      And I should receive a confirmation email

    Scenario: Reject duplicate email registration
      Given an account exists with email "existing@example.com"
      When I try to register with email "existing@example.com"
      Then I should see error "Email already registered"
      And my account should not be created

  Rule: Password must be at least 8 characters with mixed case

    Scenario: Accept valid password
      Given I am on the registration page
      When I register with password "Secure123"
      Then my account should be created successfully

    Scenario Outline: Reject weak passwords
      Given I am on the registration page
      When I register with password "<password>"
      Then I should see error "<error_message>"
      And my account should not be created

      Examples:
        | password | error_message                    |
        | short    | Password too short (min 8 chars) |
        | alllower | Password must have uppercase     |
        | ALLUPPER | Password must have lowercase     |

  @happy-path @integration
  Scenario: Complete registration flow
    Given I am on the registration page
    When I register with valid details
    Then my account should be created
    And I should be logged in automatically
    And I should see the welcome dashboard

  @error-handling @validation
  Scenario: Handle registration service failure
    Given the registration service is unavailable
    When I try to register
    Then I should see error "Service temporarily unavailable"
    And I should be able to retry later
```

### Why This Is Excellent:

✅ **Clear Rule Usage**: Each Rule states a concrete business constraint
✅ **Single Behavior**: Each scenario tests exactly one thing
✅ **Declarative Language**: Focuses on user outcomes, not implementation
✅ **Appropriate Length**: Scenarios are 3-5 steps each
✅ **Complete Coverage**: Happy path, validation rules, errors all covered
✅ **Good Organization**: Rules group related scenarios logically
✅ **Meaningful Tags**: Tags enable test filtering and categorization
✅ **Data-Driven**: Scenario Outline used appropriately for variations

---

## Scenario Pattern Library

Use these proven patterns for consistent, high-quality scenario generation:

### Pattern 1: Business Rule Validation

**When to use**: Testing concrete business constraints

```gherkin
Rule: [Concrete constraint statement]

  Scenario: [Describe valid case]
    Given [precondition that satisfies rule]
    When [action that should succeed]
    Then [expected success outcome]
    And [observable side effects]

  Scenario: [Describe invalid case]
    Given [precondition that violates rule]
    When [action that should fail]
    Then [appropriate error response]
    And [system remains consistent]
```

**Example**:
```gherkin
Rule: Order total must be at least $10

  Scenario: Accept order above minimum
    Given I have items totaling $15 in cart
    When I proceed to checkout
    Then my order should be accepted
    And I should see payment options

  Scenario: Reject order below minimum
    Given I have items totaling $5 in cart
    When I try to proceed to checkout
    Then I should see error "Minimum order is $10"
    And I should remain on cart page
```

### Pattern 2: Happy Path

**When to use**: Core functionality success scenario

```gherkin
Scenario: [Core action with expected success]
  Given [user is ready to perform action]
  And [all prerequisites are met]
  When [user performs the action]
  Then [desired outcome is achieved]
  And [expected side effects occur]
```

**Example**:
```gherkin
Scenario: Successfully create budget
  Given I am logged in as a budget user
  And I have defined income of $5000
  When I create a budget for "January 2025"
  Then my budget should be saved
  And I should see the budget dashboard
```

### Pattern 3: Error Handling

**When to use**: Testing failure modes and error responses

```gherkin
Scenario: [Error condition description]
  Given [setup that will cause error]
  When [action that triggers error]
  Then [appropriate error message shown]
  And [system remains stable]
  And [user can recover]
```

**Example**:
```gherkin
Scenario: Handle insufficient account balance
  Given my account balance is $50
  When I try to transfer $100
  Then I should see error "Insufficient funds"
  And my balance should remain $50
  And I should be able to retry with lower amount
```

### Pattern 4: Edge Case Testing

**When to use**: Testing boundary conditions

```gherkin
Scenario: [Boundary condition description]
  Given [setup at boundary]
  When [action at boundary]
  Then [boundary handling verified]
```

**Example**:
```gherkin
Scenario: Handle exactly minimum transaction data
  Given I have exactly 30 days of transaction history
  When I request spending analysis
  Then analysis should be generated successfully
  And I should see a note about limited data scope
```

### Pattern 5: Data-Driven Variations

**When to use**: Same logic with multiple data combinations

```gherkin
Scenario Outline: [Action with various inputs]
  Given [parameterized setup]
  When [parameterized action]
  Then [parameterized outcome]

  Examples:
    | param1    | param2   | expected_result |
    | value1    | value2   | result1         |
    | value3    | value4   | result2         |
```

**Example**:
```gherkin
Scenario Outline: Calculate interest for different account types
  Given I have a "<account_type>" account
  And my balance is <balance>
  When monthly interest is calculated
  Then I should earn <interest> in interest

  Examples:
    | account_type | balance | interest |
    | savings      | 1000    | 2.50     |
    | premium      | 1000    | 5.00     |
    | basic        | 1000    | 0.50     |
```

### Pattern 6: Integration Testing

**When to use**: Testing cross-component workflows

```gherkin
Scenario: [Workflow spanning multiple components]
  Given [component A is in state X]
  And [component B is in state Y]
  When [action affecting both components]
  Then [component A shows expected change]
  And [component B shows expected change]
  And [data consistency is maintained]
```

**Example**:
```gherkin
Scenario: Budget update reflects in financial reports
  Given I have an active budget with $500 for groceries
  And my financial report shows budget allocations
  When I update grocery budget to $600
  Then my budget should show $600 for groceries
  And my financial report should reflect the updated amount
  And historical data should be preserved
```

---

## Step Writing Best Practices

### Given Step Patterns

**Purpose**: Establish context and preconditions

✅ **Good Patterns**:
```gherkin
Given I am [role/state]
Given I have [resource/data]
Given [something] exists
Given [something] is [state]
```

✅ **Examples**:
```gherkin
Given I am authenticated as an admin
Given I have 90 days of transaction history
Given a budget exists for "January 2025"
Given the analytics service is available
```

❌ **Avoid**:
```gherkin
Given the system is initialized  # System focus
Given I open the application  # Implementation detail
Given the database has data  # Infrastructure concern
```

### When Step Patterns

**Purpose**: Describe the action being tested

✅ **Good Patterns**:
```gherkin
When I [action]
When I [action] with [details]
When [event] occurs
```

✅ **Examples**:
```gherkin
When I create a new budget
When I upload a receipt for $25.50
When the monthly billing cycle completes
```

❌ **Avoid**:
```gherkin
When the system processes the request  # System focus
When I click the "Submit" button  # UI implementation
When the API is called  # Technical implementation
```

### Then Step Patterns

**Purpose**: Assert expected outcomes

✅ **Good Patterns**:
```gherkin
Then I should see [outcome]
Then [something] should be [state]
Then I should receive [result]
Then [something] should [change]
```

✅ **Examples**:
```gherkin
Then I should see my budget dashboard
Then my account balance should be updated
Then I should receive a confirmation email
Then my spending patterns should be analyzed
```

❌ **Avoid**:
```gherkin
Then the database should contain  # Infrastructure
Then the system should save  # System focus
Then the UI should display  # Implementation detail
```

### Transformation Rules

Use these rules to convert system-focused language to user-focused:

| ❌ System-Focused | ✅ User-Focused |
|------------------|----------------|
| the system validates | my input is validated |
| the application processes | my request is processed |
| the service analyzes | my data is analyzed |
| the system sends email | I receive an email |
| the database stores | my data is saved |
| the API returns | I receive response |

---

## Business Rule Identification Guide

### What Makes a Good Gherkin Rule?

A Rule should be a **concrete business constraint** that can be stated as:
- "X must [constraint]"
- "X cannot [constraint]"
- "X should [constraint]"

### Identifying Rules from Specifications

Look for these indicators in requirements:

✅ **Valid Rule Indicators**:
- "must be at least/most"
- "cannot exceed"
- "requires minimum/maximum"
- "should contain"
- "must match format"
- "only accepts"

✅ **Examples from Requirements → Rules**:

**Requirement**: "Passwords must be at least 8 characters long and contain uppercase, lowercase, and numbers"
```gherkin
Rule: Password must be at least 8 characters with mixed case and numbers
```

**Requirement**: "Users can only withdraw up to their available balance"
```gherkin
Rule: Withdrawal amount cannot exceed account balance
```

**Requirement**: "Analysis needs at least 30 days of historical data"
```gherkin
Rule: Spending analysis requires minimum 30 days of transaction data
```

### When NOT to Use Rule

❌ **Don't use Rule for**:
- Organizational categories ("User Management Scenarios")
- Workflow descriptions ("Complete Registration Flow")
- Feature areas ("Integration Testing")
- Process names ("Budget Optimization Workflow")

**Instead**: List scenarios directly under Feature/Background

```gherkin
# ❌ WRONG
Rule: User Authentication Workflows
  Scenario: Login
  Scenario: Logout

# ✅ CORRECT - No Rule needed
Scenario: Login with valid credentials
Scenario: Logout and clear session
```

### Rule Extraction Exercise

**Given this requirement**:
"Budget totals cannot exceed the user's income. Each category must have a positive allocation. The budget period must be a valid month."

**Extract Rules**:
```gherkin
Rule: Budget total cannot exceed user income
Rule: Category allocation must be positive
Rule: Budget period must be a valid calendar month
```

---

## Coverage Completeness Checklist

Use this checklist to ensure complete scenario coverage:

### ✅ Happy Path Coverage
- [ ] Core functionality works as expected
- [ ] User can complete primary workflow
- [ ] All main features are accessible
- [ ] Expected outcomes are achieved

### ✅ Business Rules Coverage
- [ ] Each business rule has valid case scenario
- [ ] Each business rule has invalid case scenario
- [ ] Edge cases at rule boundaries are tested
- [ ] Rule violations show appropriate errors

### ✅ Error Scenarios Coverage
- [ ] Invalid inputs are handled gracefully
- [ ] Missing required data shows clear errors
- [ ] System failures have fallback behavior
- [ ] Timeout conditions are handled
- [ ] Authentication/authorization failures covered

### ✅ Edge Cases Coverage
- [ ] Minimum boundary conditions tested
- [ ] Maximum boundary conditions tested
- [ ] Empty/null data scenarios covered
- [ ] Exactly-at-limit scenarios tested
- [ ] Unusual but valid combinations tested

### ✅ Integration Coverage
- [ ] Cross-component data flow verified
- [ ] Dependent system interactions tested
- [ ] State consistency across components checked
- [ ] Event propagation validated

### ✅ Data Variations Coverage
- [ ] Different user roles tested (if applicable)
- [ ] Different data types/formats tested
- [ ] Multiple valid/invalid combinations covered
- [ ] Scenario Outlines used appropriately

### Example Application

**For feature: "Spending Pattern Analysis"**

✅ **Happy Path**:
- Analyze spending with 90+ days of data

✅ **Business Rules**:
- Rule: Minimum 30 days required
  - Valid: 30 days ✓
  - Invalid: 15 days ✓

✅ **Error Scenarios**:
- ML service unavailable ✓
- Analysis timeout ✓
- Invalid date range ✓

✅ **Edge Cases**:
- Exactly 30 days ✓
- Very large dataset (2+ years) ✓
- No transactions in period ✓

✅ **Integration**:
- Analysis results feed recommendations ✓
- Domain events published ✓

✅ **Data Variations**:
- Different confidence thresholds ✓
- Various category filters ✓

**Result**: Comprehensive coverage achieved!

---

## BDD Implementation Lessons Learned - HandleLogin Case Study

This section documents critical lessons learned from refactoring the HandleLogin feature BDD tests, particularly the shift from API-based user creation to database fixtures.

### Context

**Initial Problem**: Tests were using `/api/auth/register` endpoint to create test users, but this endpoint has business logic (validation, email confirmation, etc.) that could interfere with test isolation.

**Solution**: Refactor to use direct database insertion via DatabaseHelper for precise control over test user state.

### Lesson 1: Database Fixtures vs API Endpoints

**Problem**: Using API endpoints for test setup introduces:
- Business logic side effects (email validation, confirmation tokens, etc.)
- Unpredictable state (what if registration rules change?)
- Slower execution (HTTP overhead)
- Coupling to API implementation details

**Solution**: Direct database insertion for test fixtures.

**Implementation**:
```typescript
// helpers/test-user.helper.ts
async function createTestUser(
    world: CustomWorld,
    email: string,
    options?: {
        name?: string;
        displayName?: string;
        emailConfirmed?: boolean;
        lockoutEnd?: Date;
        accessFailedCount?: number;
        twoFactorEnabled?: boolean;
    }
): Promise<string> {
    const userToInsert = {
        email,
        userName: email,  // Domain requirement: userName = email
        emailConfirmed: options?.emailConfirmed ?? true,
        passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
    };

    // Only add optional properties if they have values
    if (options?.name) userToInsert.name = options.name;
    if (options?.displayName) userToInsert.displayName = options.displayName;

    const userId = await world.db.insertUser(userToInsert);

    // Apply additional settings via updateRecord
    if (options?.lockoutEnd || options?.accessFailedCount !== undefined || options?.twoFactorEnabled !== undefined) {
        const updates: Record<string, any> = {};
        if (options.lockoutEnd) {
            updates.LockoutEnd = options.lockoutEnd.toISOString();
            updates.LockoutEnabled = true;
        }
        if (options.accessFailedCount !== undefined) {
            updates.AccessFailedCount = options.accessFailedCount;
        }
        if (options.twoFactorEnabled !== undefined) {
            updates.TwoFactorEnabled = options.twoFactorEnabled;
        }
        await world.db.updateRecord('Users', userId, updates);
    }

    // Track for cleanup
    world.createdTestUsers.push(userId);
    return userId;
}
```

**Benefits**:
- ✅ Precise control over user state (confirmed/unconfirmed, locked/unlocked, 2FA enabled/disabled)
- ✅ Faster test execution (no HTTP overhead)
- ✅ Test isolation (no side effects from business logic)
- ✅ Decoupled from API implementation changes

**When to Use Database Fixtures**:
- ✅ Test setup and preconditions
- ✅ Creating users with specific states (locked, unconfirmed, etc.)
- ✅ Setting up complex data relationships

**When to Use API Endpoints**:
- ✅ Testing the API itself (authentication flow, registration validation)
- ✅ Integration tests verifying end-to-end behavior

### Lesson 2: Domain-Specific Requirements (userName = email)

**Critical Domain Rule**: In VTTTools, `userName` must ALWAYS equal `email` per `AuthService.cs:81`.

**Implementation**:
```typescript
const userToInsert = {
    email,
    userName: email,  // CRITICAL: userName is ALWAYS email per AuthService.cs:81
    // ...
};
```

**Why This Matters**:
- Backend expects userName == email for authentication
- Tests will fail with 400 Bad Request if userName differs
- This is a domain invariant that must be respected in all test fixtures

**Lesson**: Always document domain-specific requirements in helper functions. Add comments explaining WHY constraints exist, not just WHAT they are.

### Lesson 3: TypeScript Strict Mode Compliance (exactOptionalPropertyTypes)

**Problem**: With `exactOptionalPropertyTypes: true`, you cannot pass `undefined` to optional properties.

**Compilation Error**:
```typescript
// ❌ WRONG - Passes undefined
const userId = await world.db.insertUser({
    email,
    userName: email,
    name: options?.name,  // Can be undefined - ERROR!
    displayName: options?.displayName  // Can be undefined - ERROR!
});

// Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solution**: Conditional property assignment - only add properties when they have values.

```typescript
// ✅ CORRECT - Only adds properties with values
const userToInsert: {
    email: string;
    userName: string;
    emailConfirmed: boolean;
    passwordHash: string;
    name?: string;
    displayName?: string;
} = {
    email,
    userName: email,
    emailConfirmed: options?.emailConfirmed ?? true,
    passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
};

// Only add optional properties if they have values
if (options?.name) {
    userToInsert.name = options.name;
}
if (options?.displayName) {
    userToInsert.displayName = options.displayName;
}

const userId = await world.db.insertUser(userToInsert);
```

**Pattern**: Build object with required properties, then conditionally add optional properties only when they exist.

**When to Use This Pattern**:
- ✅ TypeScript projects with `exactOptionalPropertyTypes: true`
- ✅ Database insertion functions with optional fields
- ✅ API request builders with optional parameters

### Lesson 4: User Cleanup Strategies

**Critical Distinction**: `deleteUser()` vs `deleteUserDataOnly()`

**Problem**: After hook was calling `deleteUser()` which deleted the user account, not just their data. This caused tests to fail after N scenarios when user pool was exhausted.

**Wrong Approach**:
```typescript
// ❌ WRONG - Deletes user account from database
async deleteUser(userId: string): Promise<void> {
    const query = `
        DELETE FROM Assets WHERE OwnerId = ?;
        DELETE FROM Scenes WHERE OwnerId = ?;
        ...
        DELETE FROM Users WHERE Id = ?;  // ← USER DELETED!
    `;
    await this.executeQuery(query, Array(14).fill(userId));
}

// In After hook - WRONG
After(async function (this: CustomWorld, testCase) {
    await this.db.deleteUser(this.currentUser.id); // Deletes pool user!
});
```

**Correct Approach**:
```typescript
// ✅ CORRECT - Keeps user, deletes only their data
async deleteUserDataOnly(userId: string): Promise<void> {
    const query = `
        DELETE FROM Assets WHERE OwnerId = ?;
        DELETE FROM Scenes WHERE OwnerId = ?;
        DELETE FROM GameSessions WHERE OwnerId = ?;
        ...
        -- NO: DELETE FROM Users WHERE Id = ?;
    `;
    await this.executeQuery(query, Array(13).fill(userId));
}

// In After hook - CORRECT
After(async function (this: CustomWorld, testCase) {
    if (this.currentUser && this.db) {
        // Delete user's data but preserve the user account for reuse
        await this.db.deleteUserDataOnly(this.currentUser.id);

        // Reset user state to defaults (for reuse in next scenario)
        await this.db.updateRecord('Users', this.currentUser.id, {
            TwoFactorEnabled: false,
            LockoutEnd: null,
            LockoutEnabled: true,
            AccessFailedCount: 0,
            EmailConfirmed: true
        });
    }

    // Cleanup test users created during scenario (via createTestUser helper)
    if (this.createdTestUsers && this.createdTestUsers.length > 0) {
        for (const userId of this.createdTestUsers) {
            await this.db.deleteUser(userId);  // Delete these completely
        }
        this.createdTestUsers = [];
    }
});
```

**Two Types of Test Users**:
1. **Pool Users** (created in BeforeAll):
   - Created once, reused across scenarios
   - Clean data only, preserve account
   - Reset state after each test

2. **Scenario-Specific Users** (created via createTestUser):
   - Created during test execution
   - Delete completely after test
   - Tracked in `world.createdTestUsers`

**Verification**:
```bash
# All scenarios should pass, regardless of execution order
npm run test:bdd -- HandleLogin.feature
```

### Lesson 5: Password Hashing Approach

**Security**: Never hardcode passwords or generate hashes in test code.

**Solution**: Pre-generate password hash and store in `.env` file.

**Setup**:
```bash
# .env file
BDD_TEST_PASSWORD=YourSecureTestPassword123!
BDD_TEST_PASSWORD_HASH=<pre-generated-hash-matching-password>
```

**Usage**:
```typescript
const userToInsert = {
    email,
    userName: email,
    passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
};

// In test steps
await this.page.fill('input[type="password"]', process.env.BDD_TEST_PASSWORD!);
```

**Why Pre-Generate**:
- ✅ Consistent across all test users
- ✅ Matches backend hashing algorithm (ASP.NET Identity)
- ✅ Faster test execution (no hash generation)
- ✅ Secure (not exposed in code)

### Lesson 6: Flexible Test Helpers with Optional Parameters

**Pattern**: Use optional parameters for flexible test setup without assumptions.

**Anti-Pattern**:
```typescript
// ❌ BAD - Assumes values
async function createTestUser(world: CustomWorld, email: string): Promise<string> {
    return await world.db.insertUser({
        email,
        userName: email,
        emailConfirmed: true,  // ASSUMPTION!
        displayName: 'Test User',  // ASSUMPTION!
        passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
    });
}
```

**Why This Is Bad**: You need unconfirmed email for some tests, or no displayName for others. Every variation requires a new function.

**Best Practice**:
```typescript
// ✅ GOOD - Flexible with sensible defaults
async function createTestUser(
    world: CustomWorld,
    email: string,
    options?: {
        name?: string;
        displayName?: string;
        emailConfirmed?: boolean;  // Default: true
        lockoutEnd?: Date;
        accessFailedCount?: number;
        twoFactorEnabled?: boolean;
    }
): Promise<string> {
    const userToInsert = {
        email,
        userName: email,
        emailConfirmed: options?.emailConfirmed ?? true,  // Sensible default
        passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
    };

    // Only add if specified
    if (options?.name) userToInsert.name = options.name;
    if (options?.displayName) userToInsert.displayName = options.displayName;

    // ... rest of implementation
}
```

**Usage Flexibility**:
```typescript
// Default user (confirmed email)
const userId1 = await createTestUser(this, 'user1@test.com');

// Unconfirmed email
const userId2 = await createTestUser(this, 'user2@test.com', {
    emailConfirmed: false
});

// Locked account
const userId3 = await createTestUser(this, 'user3@test.com', {
    lockoutEnd: new Date(Date.now() + 5 * 60 * 1000),
    accessFailedCount: 5
});
```

### Lesson 7: Empty Implementations Are FORBIDDEN (CRITICAL)

**⚠️ ANTI-PATTERN #9 UPDATE**: Not only empty functions, but also functions with ONLY `this.attach()` or `console.log()` are **STRICTLY FORBIDDEN**.

**Why This Matters**: These create **FALSE POSITIVES** - tests appear to pass but don't actually set up required state or perform assertions.

**Examples of FORBIDDEN Patterns**:

```typescript
// ❌ FORBIDDEN #1 - Empty function
Given('an account is locked', async function() {
    // Empty - no implementation
});

// ❌ FORBIDDEN #2 - Only this.attach()
Given('an account is locked', async function() {
    this.attach('Account locked scenario', 'text/plain');
});

// ❌ FORBIDDEN #3 - Only console.log()
Given('an account is locked', async function() {
    console.log('TODO: Lock account');
});

// ❌ FORBIDDEN #4 - Only comments
Given('an account is locked', async function() {
    // Declarative step for BDD readability
    // The actual locking happens in the When step
});
```

**Why These Are Dangerous**:
- Given step "passes" but doesn't actually lock the account
- Subsequent steps fail with confusing timeout errors
- Test results are misleading - scenario appears valid but isn't
- Hides missing implementation behind passing tests

**MANDATORY Solution**:
```typescript
// ✅ REQUIRED - Explicit NOT IMPLEMENTED error
Given('an account is locked', async function() {
    throw new Error('NOT IMPLEMENTED: Step needs to lock account in database by setting LockoutEnd and LockoutEnabled=true');
});
```

**Benefits of NOT IMPLEMENTED Pattern**:
- ✅ Immediate, clear failure with descriptive message
- ✅ No confusion about what needs implementation
- ✅ Test results accurately reflect implementation status
- ✅ Team knows exactly what work remains
- ✅ Can track progress by counting NOT IMPLEMENTED steps

**Detection**: Search for stub patterns:
```bash
# Find potential stubs
grep -rn "this.attach(" e2e/step-definitions/
grep -rn "console.log(" e2e/step-definitions/
grep -rn "async function.*{$" e2e/step-definitions/
```

**Rule**: ALL step definitions MUST either:
1. **Implement the required functionality**, OR
2. **Throw an explicit "NOT IMPLEMENTED" error with description**

No middle ground. No "I'll implement it later" comments. Make failures explicit.

### Lesson 8: BDD Step Organization

**Three-Tier Structure**:

```
e2e/step-definitions/
├── shared/              # Tier 1: Universal steps (20+ uses)
│   ├── authentication.steps.ts
│   ├── form-interaction.steps.ts
│   ├── navigation.steps.ts
│   └── visibility.steps.ts
├── domain/              # Tier 2: Domain-specific (10-19 uses)
│   ├── accordion.steps.ts
│   ├── checkbox.steps.ts
│   └── keyboard-shortcuts.steps.ts
└── feature-specific/    # Tier 3: Feature-specific (< 10 uses)
    └── authentication/
        └── login.steps.ts
```

**Where to Put HandleLogin Steps**:
- Helper function: `helpers/test-user.helper.ts` (reusable)
- Given/When/Then: `feature-specific/authentication/login.steps.ts` (specific to login)

**When to Extract**:
- 1st use: Write inline
- 2nd use: Add TODO comment
- 3rd use: Extract to helper

### Lesson 9: API Mocking for Edge Cases

**Pattern**: Use Playwright's `page.route()` for edge cases that can't be reproduced via database setup.

**Example - Malformed API Response**:
```typescript
Given('some action card data is missing or malformed', async function() {
    await this.page.route('**/api/auth/user', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: this.currentUser.id,
                email: this.currentUser.email,
                // Missing displayName and name fields to simulate malformed data
            })
        });
    });
});
```

**When to Mock**:
- ✅ Network failures (timeout, connection refused)
- ✅ Malformed responses from backend
- ✅ Edge cases that can't be set up via database
- ✅ External service failures

**When NOT to Mock**:
- ❌ Normal success paths (use real API)
- ❌ Standard error responses (use real API)
- ❌ Authentication (use real cookies/sessions)

### Lesson 10: Test Data Isolation

**Key Principle**: Each test must start with completely clean state.

**Implementation**:
```typescript
// Before hook - Clean state
Before(async function (this: CustomWorld, testCase) {
    const poolUser = acquireUser(testCase.pickle.name);
    this.currentUser = {
        id: poolUser.id,
        email: poolUser.email,
        name: poolUser.username
    };
    await this.init();
});

// After hook - Cleanup
After(async function (this: CustomWorld, testCase) {
    if (this.currentUser && this.db) {
        // Delete user's data only
        await this.db.deleteUserDataOnly(this.currentUser.id);

        // Reset user state
        await this.db.updateRecord('Users', this.currentUser.id, {
            TwoFactorEnabled: false,
            LockoutEnd: null,
            AccessFailedCount: 0,
            EmailConfirmed: true
        });
    }

    // Cleanup created test users
    if (this.createdTestUsers && this.createdTestUsers.length > 0) {
        for (const userId of this.createdTestUsers) {
            await this.db.deleteUser(userId);
        }
        this.createdTestUsers = [];
    }

    // Release pool user
    if (this.currentUser) {
        releaseUser(this.currentUser.id);
    }
});
```

**Verification Checklist**:
- [ ] Each test starts with clean database state
- [ ] Pool users are preserved across tests
- [ ] Scenario-specific users are deleted
- [ ] User state is reset to defaults
- [ ] Tests pass when run individually
- [ ] Tests pass when run as full suite
- [ ] Tests pass in any order (randomize execution)

### Lesson 11: Documentation Practices

**What to Document**:
- ✅ Domain-specific requirements (userName = email)
- ✅ Why constraints exist (not just what they are)
- ✅ TypeScript workarounds (exactOptionalPropertyTypes)
- ✅ Security considerations (password hashing)
- ✅ Cleanup strategies (deleteUserDataOnly vs deleteUser)

**Where to Document**:
- **Inline comments**: For critical domain rules and security considerations
- **Helper function JSDoc**: For usage patterns and parameters
- **Project guides**: For architectural patterns and best practices
- **Feature files**: For business rules and acceptance criteria

**Example - Well-Documented Helper**:
```typescript
/**
 * Create test user via direct database insertion
 *
 * CRITICAL: userName is ALWAYS email per AuthService.cs:81 requirement
 * Password is always BDD_TEST_PASSWORD_HASH from .env
 *
 * @param world - Test world context
 * @param email - User email (also used as userName)
 * @param options - Optional user configuration
 * @returns User ID for cleanup
 */
async function createTestUser(
    world: CustomWorld,
    email: string,
    options?: {
        name?: string;
        displayName?: string;
        emailConfirmed?: boolean;
        lockoutEnd?: Date;
        accessFailedCount?: number;
        twoFactorEnabled?: boolean;
    }
): Promise<string> {
    // Implementation...
}
```

### Lesson 12: Stub Detection Limitations

**Problem**: Automated stub detection (grep, regex) has high false positive rate.

**Why**:
- Parameter storage patterns look like stubs
- Test context setup looks like stubs
- Documentation-only pass-through assertions look like stubs

**Solution**: Manual review with understanding of BDD patterns.

**Valid Patterns That Look Like Stubs**:
```typescript
// ✅ VALID - Parameter storage
When('I enter email {string}', async function(email) {
    this.lastEnteredEmail = email;
});

// ✅ VALID - Test context setup
Given('I am not authenticated', async function() {
    await this.context.clearCookies();
    // More cleanup...
});

// ✅ VALID - Documentation assertion
Then('I should be able to retry', async function() {
    // No action needed - verifies form state allows retry
    // Implicit: Previous steps didn't disable form
});
```

**True Stubs to Fix**:
```typescript
// ❌ STUB - No implementation
Given('an account is locked', async function() {
    throw new Error('NOT IMPLEMENTED: Lock account via database update');
});
```

**Lesson**: Use tools to identify candidates, but require human judgment for confirmation.

---

## Summary: Key Takeaways

1. **Database Fixtures > API Endpoints** for test setup (isolation, speed, control)
2. **TypeScript Strict Mode** requires conditional property assignment pattern
3. **Empty Implementations** including `this.attach()` only methods are **STRICTLY FORBIDDEN**
4. **User Cleanup Strategy** matters: deleteUserDataOnly() for pool users, deleteUser() for scenario users
5. **Password Hashing** must be pre-generated and stored in .env
6. **Optional Parameters** make helpers flexible without assumptions
7. **Domain Rules** must be documented and enforced (userName = email)
8. **API Mocking** is for edge cases only, use real APIs for normal paths
9. **Test Isolation** requires careful cleanup and state reset
10. **Documentation** should explain WHY, not just WHAT

**Next Steps**: Apply these patterns to other authentication scenarios (logout, registration, password reset).

---

## Quality Self-Assessment Rubric

Before finalizing a feature file, score it against these criteria:

### Structure Quality (25 points)

- [ ] 5pts: Feature has clear title and user story format
- [ ] 5pts: Background used appropriately (user context only)
- [ ] 5pts: Rule keyword used correctly (or not used if not applicable)
- [ ] 5pts: Scenarios have clear, descriptive titles
- [ ] 5pts: Proper Gherkin hierarchy maintained

### Language Quality (25 points)

- [ ] 10pts: All steps use declarative language (no "the system")
- [ ] 5pts: Consistent verb tenses throughout
- [ ] 5pts: Business domain terminology used
- [ ] 5pts: Steps are stakeholder-readable

### Coverage Completeness (30 points)

- [ ] 10pts: Happy path scenarios present
- [ ] 10pts: All business rules tested (valid + invalid)
- [ ] 5pts: Error scenarios covered
- [ ] 5pts: Edge cases included

### Maintainability (20 points)

- [ ] 10pts: Scenarios are 3-7 steps (average)
- [ ] 5pts: Scenarios test single behavior each
- [ ] 5pts: Logical organization and flow

### **Scoring**:
- 90-100: Excellent - Production ready
- 80-89: Good - Minor improvements needed
- 70-79: Acceptable - Several improvements needed
- <70: Needs significant revision

**Minimum acceptable score: 80/100**