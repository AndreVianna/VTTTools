# BDD Feature File Template

This template defines the structure and quality standards for BDD feature files.
Works for both Feature-level and Use Case-level BDD files.

---

## File Structure

### Metadata Section (Required)
```gherkin
# Generated: {YYYY-MM-DD}
# {Feature|Use Case}: {Name}
```

### Feature Declaration (Required)
```gherkin
Feature: {Name}
  As a {user role}
  I want to {capability}
  So that {business value}
```

### Background Section (Required)
```gherkin
Background:
  Given I am authenticated as {role}
  And {essential prerequisite}
```

### Rule Section (Conditional - Use Only for Concrete Business Constraints)

#### When to Use Rule:

✅ **USE Rule keyword when you have concrete business constraints:**
```gherkin
Rule: Budget total cannot exceed income

  Scenario: Accept budget within limit
    Given my monthly income is $5000
    When I create a budget totaling $4500
    Then the budget should be created successfully

  Scenario: Reject budget exceeding limit
    Given my monthly income is $5000
    When I attempt to create a budget totaling $5500
    Then the request should fail
    And I should see error "Budget cannot exceed income"
```

✅ **Additional valid Rule examples:**
- "Analysis requires minimum 30 days of data"
- "Password must contain at least 8 characters"
- "Only owner can delete resource"
- "Session must be Active to accept participants"
- "Asset name cannot exceed 128 characters"
- "Recovery codes can only be used once"

❌ **DON'T use Rule for categories or workflows:**
```gherkin
# BAD - This is NOT a concrete constraint:
Rule: User Registration Flow
  Scenario: Register with email...
  Scenario: Register with social...

# BETTER - No Rule needed, list scenarios directly:
@registration
Scenario: Register with email
Scenario: Register with social login
```

❌ **DON'T use Rule for scenario grouping:**
```gherkin
# BAD - These are categories, not constraints:
Rule: Happy Path Scenarios
Rule: Error Handling Scenarios
Rule: Validation Scenarios

# BETTER - Use tags instead:
@happy-path
@error-handling
@validation
```

#### Rule Structure Requirements:

**Each Rule must have:**
1. Clear constraint statement (what must/cannot happen)
2. At least 2 scenarios: valid case + invalid case
3. Scenarios that directly test the constraint

**Example with multiple constraints:**
```gherkin
Feature: Create Asset

  Background:
    Given I am authenticated as a Game Master

  Rule: Name is required and cannot be empty

    Scenario: Accept asset with valid name
      Given I provide name "Dragon Token"
      When I create the asset
      Then the asset should be created

    Scenario: Reject asset with empty name
      Given I provide empty name
      When I attempt to create the asset
      Then the request should fail
      And I should see error "Name is required"

  Rule: Description cannot exceed 4096 characters

    Scenario: Accept description at maximum length
      Given I provide description with 4096 characters
      When I create the asset
      Then the asset should be created

    Scenario: Reject description exceeding maximum
      Given I provide description with 4097 characters
      When I attempt to create the asset
      Then the request should fail
      And I should see error "Description too long"

  # Direct scenarios (no Rule needed):
  @happy-path
  Scenario: Successfully create complete asset
    Given I provide valid asset data
    When I create the asset
    Then the asset should be saved
```

#### Decision Tree for Rule Usage:

```
Is this a concrete business constraint?
  (e.g., "cannot exceed", "must be minimum", "requires")

  YES → Use Rule keyword
    ├─ Create Rule with constraint statement
    ├─ Add valid case scenario (satisfies constraint)
    └─ Add invalid case scenario(s) (violates constraint)

  NO → Don't use Rule
    ├─ List scenarios directly under Feature
    └─ Use tags for organization (@happy-path, @error-handling)
```

#### Common Rule Patterns:

1. **Validation Rules:**
   - "Field X is required"
   - "Field X cannot exceed Y characters"
   - "Field X must match pattern"

2. **Business Logic Rules:**
   - "Total cannot exceed limit"
   - "Action requires minimum data"
   - "Operation only allowed in state X"

3. **Authorization Rules:**
   - "Only owner can perform action"
   - "User must be authenticated"
   - "Permission X required"

4. **State Transition Rules:**
   - "Session must be Active to..."
   - "Budget must be approved before..."
   - "Cannot delete while in use"

---

## Scenario Requirements (Complexity-Based)

### ✅ MINIMUM (Simple Use Cases): 4 Scenarios

1. **Happy Path** (1 minimum)
   - Primary success flow

2. **Validation** (1 minimum)
   - Required field OR format validation

3. **Error Handling** (1 minimum)
   - Invalid input OR system failure

4. **Edge Case** (1 minimum)
   - Boundary condition testing

### ✅ RECOMMENDED (Standard Use Cases): 6-8 Scenarios

Add to minimum:
- **Authorization** (if access control applies)
- **Data-Driven** (Scenario Outline with Examples)
- Additional validation/error scenarios

### ✅ COMPREHENSIVE (Complex Use Cases): 10+ Scenarios

Add to recommended:
- Multiple validation scenarios (Rule groups)
- Multiple error scenarios
- Integration scenarios (cross-area)
- Multiple Scenario Outlines

---

## Complete Example (Standard Complexity)

```gherkin
# Generated: 2025-09-30
# Use Case: Create Budget

Feature: Create Budget
  As a budget planner
  I want to create a new budget
  So that I can track my spending

  Background:
    Given I am authenticated as a budget planner
    And I have income data available

  Rule: Budget total cannot exceed income

    Scenario: Accept budget within income limit
      Given my monthly income is $5000
      When I create a budget totaling $4500
      Then the budget should be created successfully
      And I should see confirmation

    Scenario: Reject budget exceeding income
      Given my monthly income is $5000
      When I attempt to create a budget totaling $5500
      Then the request should fail
      And I should see error "Budget cannot exceed income"

  @happy-path
  Scenario: Successfully create complete budget
    Given I have income of $5000
    And I provide valid categories
    When I create the budget
    Then the budget should be saved
    And I should see confirmation

  @error-handling
  Scenario: Handle service timeout
    Given I provide valid budget data
    When the service times out
    Then I should see error "Service unavailable"
    And my input should be preserved

  @edge-case
  Scenario: Create budget with zero income
    Given my income is $0
    When I attempt to create any budget
    Then the request should fail
    And I should see error "Cannot budget without income"

  @authorization
  Scenario: Unauthorized user cannot create budget
    Given I am not authenticated
    When I attempt to create a budget
    Then the request should fail
    And I should be redirected to login

  @data-driven
  Scenario Outline: Validate budget amounts
    Given I provide budget total of <amount>
    And my income is $5000
    When I create the budget
    Then the result should be <result>

    Examples:
      | amount | result  |
      | 4000   | success |
      | 5001   | failure |
```

---

## Language Guidelines

### ✅ DO (Declarative, User-Focused):
- "Then the budget should be created"
- "And I should see confirmation"
- "Then my input is validated"

### ❌ DON'T (System-Focused):
- "Then the system should create the budget"
- "And the application should display confirmation"
- "Then the system validates the input"

### Transformation Rules:
- "the system validates" → "my input is validated"
- "the application processes" → "my request is processed"
- "the service returns" → "I receive"
- "the system should display" → "I should see"
- "the application grants access" → "I should gain access"

---

## Tags Usage

- `@happy-path` - Primary success scenarios
- `@error-handling` - Failure mode scenarios
- `@edge-case` - Boundary condition scenarios
- `@authorization` - Access control scenarios
- `@data-driven` - Scenario Outlines
- `@integration` - Cross-component scenarios
- `@cross-area` - Cross-bounded-context scenarios
- `@performance` - Performance-sensitive scenarios
- `@real-time` - Real-time/SignalR scenarios

---

## Anti-Patterns to Avoid

❌ **Too Vague**:
```gherkin
Scenario: Create budget
  When I create a budget
  Then it should be created
```

❌ **System-Centric**:
```gherkin
Then the system should validate the input
And the system should save to database
And the application should notify user
```

❌ **Too Many Steps** (>7):
```gherkin
Scenario: Complex workflow
  Given step 1
  And step 2
  And step 3
  When step 4
  And step 5
  Then step 6
  And step 7
  And step 8  # TOO MANY - split into multiple scenarios
```

❌ **Misusing Rule**:
```gherkin
Rule: Registration Workflows  # This is a category, not a constraint!
  Scenario: Register with email
  Scenario: Register with Google
```

✅ **Good Example**:
```gherkin
Scenario: Successfully create budget with valid data
  Given I provide valid budget data
  When I create the budget
  Then the budget should be saved
  And I should see confirmation
```

---

<!--
═══════════════════════════════════════════════════════════════
QUALITY CHECKLIST (Review Before Submitting)
═══════════════════════════════════════════════════════════════

## Structure Quality (25 points)
□ 5pts: Feature has user story format (As/I want/So that)
□ 5pts: Background contains ONLY user context (no system state)
□ 5pts: Rule used correctly:
  - If Rules present: Each has 2+ scenarios (valid + invalid cases)
  - Rules only for concrete constraints (not categories/workflows)
  - If no constraints: Scenarios listed directly with tags
□ 5pts: Scenario titles are descriptive and specific
□ 5pts: Proper Gherkin hierarchy maintained

## Language Quality (25 points)
□ 10pts: Zero occurrences of "the system/application/service"
□ 5pts: All steps focus on user outcomes (declarative)
□ 5pts: Business domain terminology used consistently
□ 5pts: Consistent verb tenses throughout

## Coverage Completeness (30 points)
□ 10pts: Happy path scenario present
□ 10pts: Business rules tested (valid + invalid if Rules used)
□ 5pts: Error scenario included
□ 5pts: Edge case scenario addressed

## Maintainability (20 points)
□ 10pts: Scenarios average 3-7 steps (none exceed 7)
□ 5pts: Each scenario tests ONE behavior (single When-Then)
□ 5pts: Logical organization and proper tagging

## Minimum Requirements Met
□ At least 4 scenarios (Happy, Validation, Error, Edge)
□ 60+ lines minimum (scales with complexity)
□ Background section present
□ At least 1 scenario for each acceptance criterion
□ Data-Driven scenario (Scenario Outline) if applicable
□ Authorization scenario if access control applies
□ If Rules used: Each Rule has 2+ scenarios

## Target Score: 80/100 minimum
□ Structure: ___/25
□ Language: ___/25
□ Coverage: ___/30
□ Maintainability: ___/20
□ TOTAL: ___/100

If score < 80: File must be revised before acceptance

═══════════════════════════════════════════════════════════════
-->
