# Task Specification: [Task Name]

<!--
GUIDANCE: Replace [Task Name] with a clear, descriptive name for the implementable task.
Example: "Implement User Login Authentication"
Note: Tasks typically represent 1-2 weeks of development work for a single developer.
-->

## Task Information

**Task ID**: [TC###]
**User Story**: [US### from parent feature]
**Feature**: [Parent Feature Name]
**Estimated Effort**: [1-2 weeks]
**Priority**: [High/Medium/Low]
**Assigned Team/Role**: [Frontend Developer/Backend Developer/Full-stack Developer]

## Actor
[Primary user role who will benefit from this task]
<!-- Examples: User, GM, Player, Administrator, Developer -->

## Goal
[Single, clear objective that this task accomplishes]
<!-- Should be specific and measurable, focusing on one capability -->

## Preconditions
[System state and user context required before this task begins]
<!-- Include authentication, permissions, data state, other completed tasks -->

## Main Flow
1. [Step 1 - User action or system trigger]
2. [Step 2 - System response]
3. [Step 3 - Continue step-by-step interaction]
4. [Final step - Successful completion]

## Alternative Flows
**A1 - [Error Scenario 1]:**
1. [Error condition occurs]
2. [System error handling]
3. [User recovery action]
4. [Return to main flow or exit]

**A2 - [Edge Case Scenario]:**
1. [Edge case condition]
2. [System response]
3. [Resolution path]

## Postconditions
[System state and user context after successful completion]
<!-- Include data changes, UI state, user permissions, integration effects -->

## Acceptance Criteria
[Specific, testable requirements for this task]
<!-- Each criterion should be measurable and verifiable -->

- [ ] [Specific functional requirement with measurable outcome]
- [ ] [User interface requirement with visual specifications]
- [ ] [Performance requirement with specific metrics]
- [ ] [Error handling requirement with specific scenarios]
- [ ] [Integration requirement with other system components]
- [ ] [Security requirement if applicable]

## Technical Implementation Notes

### Frontend Considerations
[React/UI specific implementation guidance]
<!-- Component patterns, state management, styling requirements -->

### Backend Integration
[API integration and service communication]
<!-- Existing API endpoints, contracts, authentication patterns -->

### Dependencies
[Other tasks or system components this task depends on]
<!-- Technical dependencies, prerequisite tasks, external services -->

### Performance Requirements
[Specific performance targets and optimization considerations]
<!-- Load times, responsiveness, memory usage, scalability -->

### Testing Requirements
**CRITICAL**: Reference Documents/Guides/TESTING_BEST_PRACTICES.md for comprehensive implementation patterns.
**INFRASTRUCTURE FIRST**: Always validate Aspire service health before testing features.

<!--
GUIDANCE: Choose appropriate testing sections based on task complexity.
Phase 1 lessons: Service health validation is mandatory for all testing.
-->

#### Infrastructure Health Validation [ALWAYS REQUIRED]
**Pre-Testing Checklist** (Critical Phase 1 Lesson):
- [ ] All services show "Healthy" in Aspire Dashboard (https://localhost:17086)
- [ ] Service discovery working through Vite proxy (React → Microservices)
- [ ] Database connectivity confirmed (check Migration Service logs)
- [ ] Authentication service responding (test login/logout endpoints)

#### [OPTIONAL] Unit Test Strategy [IF complex logic/mocking needed]
**Include this section if the task involves:**
- Complex business logic requiring isolation
- External service integration requiring mocking
- Database operations requiring test doubles
- Authentication/authorization logic

**Testing Frameworks (Phase 1 Standards):**
- **C# Services**: xUnit v3 + NSubstitute + FluentAssertions
- **React Components**: React Testing Library + Jest + @testing-library/user-event

**Required Mocks (Phase 1 Patterns):**
```csharp
// C# Service Mocking Pattern (Auth service example)
private readonly IUserManager _mockUserManager;
private readonly ISignInManager _mockSignInManager;
private readonly ILogger<AuthService> _mockLogger;

public TaskServiceTests()
{
    _mockUserManager = Substitute.For<IUserManager>();
    _mockSignInManager = Substitute.For<ISignInManager>();
    _mockLogger = Substitute.For<ILogger<AuthService>>();
}

[Fact]
public async Task TaskMethod_ValidInput_ReturnsExpectedResult()
{
    // Arrange - Setup mocks with specific return values
    _mockUserManager.FindByEmailAsync("test@example.com")
        .Returns(Task.FromResult(new ApplicationUser()));

    // Act - Execute method under test
    var result = await _service.TaskMethod("test@example.com");

    // Assert - Verify behavior and mock interactions
    result.Should().NotBeNull();
    await _mockUserManager.Received(1).FindByEmailAsync("test@example.com");
}
```

```typescript
// React Component Mocking Pattern
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('Task component handles user interaction', async () => {
  const mockHandler = jest.fn().mockResolvedValue({ success: true });

  render(<TaskComponent onSubmit={mockHandler} />);

  await userEvent.type(screen.getByLabelText(/input/i), 'test data');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(mockHandler).toHaveBeenCalledWith('test data');
});
```

**Test Quality Standards (Phase 1 Lessons):**
- **Fast**: < 100ms per test
- **Isolated**: All external dependencies mocked
- **Deterministic**: Same result every time
- **Error Coverage**: Test all failure scenarios

#### [OPTIONAL] Integration Test Strategy [IF service integration needed]
**Include this section if the task involves:**
- Service-to-service communication within Aspire
- Database operations with real data persistence
- Authentication flows with real Identity providers
- API contract validation

**Integration Frameworks (Phase 1 Standards):**
- **Backend**: xUnit v3 + Microsoft.AspNetCore.Mvc.Testing + TestContainers (if needed)
- **Frontend**: React Testing Library + MSW (Mock Service Worker)

**Integration Test Pattern (Phase 1 Experience):**
```csharp
[Collection("Integration")]
public class TaskIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly ApplicationDbContext _dbContext;

    public TaskIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Use in-memory database for integration tests
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase($"TaskTestDb_{Guid.NewGuid()}"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task TaskEndpoint_ValidRequest_ReturnsExpectedData()
    {
        // Arrange - Setup test data in database
        // Act - Make HTTP request through entire service stack
        // Assert - Verify response and database state
    }
}
```

**Integration Quality Standards (Phase 1 Lessons):**
- **Real Dependencies Within Boundaries**: Use actual service implementations within test scope
- **Mock at System Edges**: Mock external systems but use real internal services
- **Clean Test Data**: Each test starts with known state and cleans up after
- **Service Health First**: Verify Aspire services are healthy before integration tests

#### [OPTIONAL] End-to-End Test Scenarios [IF full user workflow needed]
**Include this section if the task involves:**
- Complete user workflows from authentication to task completion
- Visual UI validation (canvas, forms, interactions)
- Cross-service communication validation
- Performance validation under realistic load

**E2E Testing Framework (Phase 1 Standard):** Playwright MCP

**Scenario Examples:**
```typescript
// Full user workflow testing with Playwright MCP
test('User completes task workflow successfully', async () => {
  // Navigate to task page
  await page.goto('/tasks/new');

  // Authenticate user
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  // Complete task workflow
  await page.fill('[data-testid="task-input"]', 'Task data');
  await page.click('[data-testid="submit-button"]');

  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

#### Standard Testing Requirements (Phase 1 Baseline)
**Always Required:**
- [ ] Infrastructure health validation before any testing
- [ ] Error scenario testing for all user-facing features
- [ ] Performance validation within established targets
- [ ] Security testing for any authentication/authorization changes

## Business Value
[Clear explanation of why this task matters to users and business]
<!-- User benefit, business impact, success metrics -->

## Risk Factors
[Potential challenges and mitigation strategies]
<!-- Technical risks, timeline risks, dependency risks -->

## Definition of Done
[Clear criteria for considering this task complete based on Phase 1 testing lessons]

**Infrastructure Validation (Critical Phase 1 Requirement):**
- [ ] All Aspire services show "Healthy" status in dashboard
- [ ] Service discovery working correctly (React → Microservices)
- [ ] Database connectivity confirmed and migrations applied
- [ ] Authentication service responding to health checks

**Code Quality and Testing:**
- [ ] All acceptance criteria verified and tested
- [ ] Code review completed and approved
- [ ] **Unit tests written and passing** (xUnit v3 + NSubstitute for C#, Jest + RTL for React)
- [ ] **Integration tests passing** (with real database/service interactions where applicable)
- [ ] **End-to-end tests passing** (Playwright MCP for user workflows, if applicable)
- [ ] Performance requirements met and validated against Phase 1 baselines
- [ ] Error scenarios tested and handled appropriately
- [ ] Security requirements validated (authentication/authorization changes)

**Deployment and Documentation:**
- [ ] Feature deployed and functional in development environment
- [ ] All services maintain health status after deployment
- [ ] Documentation updated (including API contracts if applicable)
- [ ] Testing patterns documented for future reference

**Phase 1 Quality Gates:**
- [ ] No breaking changes to existing authentication flows
- [ ] Service startup time remains under 30 seconds
- [ ] API response times within established targets (< 2s CRUD, < 500ms queries)
- [ ] Frontend performance maintains > 50fps for interactive features

---

<!--
QUALITY CHECKLIST:
□ Task is atomic (single responsibility, implementable in 1-2 weeks)
□ Goal is specific and measurable
□ All acceptance criteria are testable and objective
□ Dependencies clearly identified
□ Error scenarios included in alternative flows
□ Technical notes provide clear implementation guidance
□ Business value clearly articulated
□ Testing strategy matches task complexity (remove optional sections if not needed)
□ Unit test mocks specified if complex integration required
□ BDD scenarios included if cross-system integration testing needed
□ Definition of done is comprehensive and verifiable
-->