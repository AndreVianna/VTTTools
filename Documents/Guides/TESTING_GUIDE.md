# Testing Guide for VTTTools

This guide defines the testing standards and practices for the VTTTools project, covering both C# backend testing (xUnit + FluentAssertions) and TypeScript/React frontend testing (Vitest + Testing Library).

## Table of Contents

- [Quick Reference](#quick-reference)
- [Testing Philosophy](#testing-philosophy)
- [C# Testing Standards](#c-testing-standards)
- [TypeScript Testing Standards](#typescript-testing-standards)
- [Test Organization](#test-organization)
- [Best Practices](#best-practices)
- [Code Review Checklist](#code-review-checklist)

## Quick Reference

| Aspect | C# (xUnit) | TypeScript (Vitest) |
|--------|------------|---------------------|
| **Framework** | xUnit 2.9+ | Vitest 2.1+ |
| **Assertions** | FluentAssertions 6.12+ | Vitest + Testing Library |
| **Test Pattern** | AAA (Arrange, Act, Assert) | AAA (Arrange, Act, Assert) |
| **File Location** | `*.UnitTests/` projects | `src/**/*.test.tsx` |
| **Naming** | `{Class}Tests.cs` | `{Component}.test.tsx` |
| **Method Naming** | `{Method}_{Scenario}_{Expected}` | `should {expected} when {scenario}` |
| **Coverage Target** | ≥ 80% for services/logic | ≥ 70% for components |
| **Mocking** | Substitutes/Mocks | vi.fn(), msw |
| **Test Runner** | dotnet test | vitest |

## Testing Philosophy

### What to Test

**Backend (C#)**:
- ✅ Business logic in services
- ✅ Domain model validation
- ✅ Data transformation logic
- ✅ API endpoint handlers
- ✅ Extension methods
- ✅ Utility functions
- ✅ Middleware behavior
- ❌ Entity Framework mappings (integration tests)
- ❌ Third-party library code
- ❌ Simple property getters/setters

**Frontend (TypeScript/React)**:
- ✅ Component rendering with various props
- ✅ User interactions (clicks, form submissions)
- ✅ Conditional rendering logic
- ✅ Custom hooks
- ✅ Utility functions
- ✅ Redux slices and reducers
- ❌ Third-party component internals
- ❌ Simple pass-through components
- ❌ Styling-only components

### Test Coverage Goals

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| **Domain Services** | ≥ 90% | Critical |
| **Business Logic** | ≥ 80% | High |
| **API Handlers** | ≥ 80% | High |
| **React Components** | ≥ 70% | Medium |
| **Utility Functions** | ≥ 80% | Medium |
| **Infrastructure** | ≥ 60% | Low |

## C# Testing Standards

### Project Structure

```
Source/
├── Domain/                      # Domain types and interfaces
├── Domain.UnitTests/            # Domain tests
│   ├── Game/
│   │   └── Sessions/
│   │       ├── Model/
│   │       │   └── GameSessionTests.cs
│   │       └── ApiContracts/
│   │           └── CreateGameSessionRequestTests.cs
│   └── GlobalUsings.cs
├── Game/                        # Service implementation
└── Game.UnitTests/              # Service tests
    ├── Services/
    │   └── GameSessionServiceTests.cs
    ├── Handlers/
    │   └── GameSessionHandlersTests.cs
    └── GlobalUsings.cs
```

### Test Class Naming

```csharp
// ✅ Correct: {ClassUnderTest}Tests
public class GameSessionServiceTests { }
public class UserValidationExtensionsTests { }
public class GameSessionHandlersTests { }

// ❌ Incorrect: Various wrong patterns
public class TestGameSessionService { }    // Don't prefix with Test
public class GameSessionServiceTest { }    // Use Tests (plural)
public class GameSessionService_Tests { }  // No underscore
```

### Test Method Naming

```csharp
// ✅ Correct: {MethodName}_{Scenario}_{ExpectedResult}
[Fact]
public void CreateGameSessionAsync_WithValidData_ReturnsCreatedSession() { }

[Fact]
public void CreateGameSessionAsync_WithEmptyTitle_ReturnsValidationError() { }

[Fact]
public void GetByIdAsync_WhenSessionNotFound_ReturnsNull() { }

[Fact]
public void UpdateGameSessionAsync_WhenUserNotOwner_ReturnsForbidden() { }

// ❌ Incorrect: Various wrong patterns
[Fact]
public void Test1() { }                           // Not descriptive
[Fact]
public void CreateSession() { }                   // Missing scenario/expected
[Fact]
public void Should_Return_Created_Session() { }   // Don't use Should_
```

### AAA Pattern (Arrange, Act, Assert)

```csharp
// ✅ Correct: Clear AAA structure with blank lines
[Fact]
public async Task CreateGameSessionAsync_WithValidData_ReturnsCreatedSession() {
    // Arrange
    var userId = Guid.CreateVersion7();
    var data = new CreateGameSessionData {
        Title = "World Adventure",
        EncounterId = Guid.CreateVersion7()
    };
    var storage = Substitute.For<IGameSessionStorage>();
    var service = new GameSessionService(storage);

    // Act
    var result = await service.CreateGameSessionAsync(userId, data);

    // Assert
    result.StatusCode.Should().Be(HttpStatusCode.Created);
    result.Value.Should().NotBeNull();
    result.Value!.Title.Should().Be("World Adventure");
    result.Value.OwnerId.Should().Be(userId);

    await storage.Received(1).AddAsync(
        Arg.Is<GameSession>(s => s.Title == "World Adventure"),
        Arg.Any<CancellationToken>());
}

// ❌ Incorrect: No clear separation
[Fact]
public async Task CreateGameSessionAsync_WithValidData_ReturnsCreatedSession() {
    var userId = Guid.CreateVersion7();
    var service = new GameSessionService(storage);
    var result = await service.CreateGameSessionAsync(userId, data);
    result.StatusCode.Should().Be(HttpStatusCode.Created);
    // Mixed arrange/act/assert - hard to read
}
```

### FluentAssertions Usage

```csharp
// ✅ Correct: FluentAssertions for readable assertions
[Fact]
public void GameSession_WhenCreated_HasExpectedDefaults() {
    // Arrange & Act
    var session = new GameSession {
        Title = "New Session",
        OwnerId = Guid.CreateVersion7()
    };

    // Assert
    session.Id.Should().NotBeEmpty();
    session.Title.Should().Be("New Session");
    session.Status.Should().Be(GameSessionStatus.Draft);
    session.Players.Should().BeEmpty();
    session.Messages.Should().BeEmpty();
}

// ✅ Correct: Collection assertions
[Fact]
public void GetActiveSessions_ReturnsOnlyInProgressSessions() {
    // Arrange
    var sessions = new List<GameSession> {
        new() { Status = GameSessionStatus.Draft },
        new() { Status = GameSessionStatus.InProgress },
        new() { Status = GameSessionStatus.InProgress },
        new() { Status = GameSessionStatus.Finished }
    };

    // Act
    var active = sessions.Where(s => s.Status == GameSessionStatus.InProgress).ToList();

    // Assert
    active.Should().HaveCount(2);
    active.Should().OnlyContain(s => s.Status == GameSessionStatus.InProgress);
    active.Should().NotContain(s => s.Status == GameSessionStatus.Draft);
}

// ✅ Correct: Exception assertions
[Fact]
public void ValidateEmail_WithInvalidFormat_ThrowsValidationException() {
    // Arrange
    var invalidEmail = "not-an-email";

    // Act
    Action act = () => EmailValidator.Validate(invalidEmail);

    // Assert
    act.Should().Throw<ValidationException>()
        .WithMessage("*invalid email*");
}

// ❌ Incorrect: xUnit Assert (less readable)
[Fact]
public void GameSession_WhenCreated_HasExpectedDefaults() {
    var session = new GameSession { Title = "New Session" };

    Assert.NotEqual(Guid.Empty, session.Id);           // Less readable
    Assert.Equal("New Session", session.Title);
    Assert.Equal(GameSessionStatus.Draft, session.Status);
}
```

### Test Data Builders (Complex Objects)

```csharp
// ✅ Correct: Test data builder pattern for complex objects
public class GameSessionBuilder {
    private Guid _id = Guid.CreateVersion7();
    private string _title = "Test Session";
    private Guid _ownerId = Guid.CreateVersion7();
    private GameSessionStatus _status = GameSessionStatus.Draft;
    private List<Participant> _players = [];

    public GameSessionBuilder WithTitle(string title) {
        _title = title;
        return this;
    }

    public GameSessionBuilder WithOwner(Guid ownerId) {
        _ownerId = ownerId;
        return this;
    }

    public GameSessionBuilder WithStatus(GameSessionStatus status) {
        _status = status;
        return this;
    }

    public GameSessionBuilder WithPlayers(params Participant[] players) {
        _players = [.. players];
        return this;
    }

    public GameSession Build() => new() {
        Id = _id,
        Title = _title,
        OwnerId = _ownerId,
        Status = _status,
        Players = _players
    };
}

// Usage in tests
[Fact]
public void DeleteSessionAsync_WhenNotOwner_ReturnsForbidden() {
    // Arrange
    var ownerId = Guid.CreateVersion7();
    var differentUserId = Guid.CreateVersion7();
    var session = new GameSessionBuilder()
        .WithOwner(ownerId)
        .WithStatus(GameSessionStatus.InProgress)
        .Build();

    // Act & Assert
    // ...
}
```

### Parameterized Tests

```csharp
// ✅ Correct: Theory with InlineData for multiple scenarios
[Theory]
[InlineData("", false)]                              // Empty title
[InlineData("A", true)]                              // Min valid length
[InlineData("Valid Session Title", true)]            // Normal case
[InlineData("A very long title that exceeds the maximum allowed length of 128 characters and should fail validation because it is way too long", false)]  // Too long
public void ValidateTitle_WithVariousInputs_ReturnsExpectedResult(string title, bool expectedValid) {
    // Arrange
    var data = new CreateGameSessionData { Title = title };

    // Act
    var result = data.Validate();

    // Assert
    if (expectedValid) {
        result.HasErrors.Should().BeFalse();
    }
    else {
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Contains("title", StringComparison.OrdinalIgnoreCase));
    }
}

// ✅ Correct: MemberData for complex test data
public static IEnumerable<object[]> GameSessionStatusTransitions => new List<object[]> {
    new object[] { GameSessionStatus.Draft, GameSessionStatus.InProgress, true },
    new object[] { GameSessionStatus.InProgress, GameSessionStatus.Finished, true },
    new object[] { GameSessionStatus.Finished, GameSessionStatus.Draft, false },  // Invalid transition
    new object[] { GameSessionStatus.Draft, GameSessionStatus.Finished, false }   // Skip states
};

[Theory]
[MemberData(nameof(GameSessionStatusTransitions))]
public void CanTransitionTo_WithVariousStates_ReturnsExpectedResult(
    GameSessionStatus from,
    GameSessionStatus to,
    bool expectedValid) {
    // Test implementation
}
```

### Async Test Patterns

```csharp
// ✅ Correct: Async test with Task return type
[Fact]
public async Task GetByIdAsync_WithExistingId_ReturnsSession() {
    // Arrange
    var sessionId = Guid.CreateVersion7();
    var expectedSession = new GameSession { Id = sessionId };
    var storage = Substitute.For<IGameSessionStorage>();
    storage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>())
        .Returns(expectedSession);
    var service = new GameSessionService(storage);

    // Act
    var result = await service.GetByIdAsync(sessionId);

    // Assert
    result.Should().NotBeNull();
    result!.Id.Should().Be(sessionId);
}

// ❌ Incorrect: Blocking on async code
[Fact]
public void GetByIdAsync_WithExistingId_ReturnsSession() {
    var result = service.GetByIdAsync(sessionId).Result;  // DON'T DO THIS
}
```

## TypeScript Testing Standards

### Test File Organization

```typescript
// LoginForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
    // Setup before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Group related tests
    describe('rendering', () => {
        it('should render email and password fields', () => {
            // Test implementation
        });

        it('should render submit button', () => {
            // Test implementation
        });
    });

    describe('validation', () => {
        it('should show error for invalid email', async () => {
            // Test implementation
        });

        it('should show error for empty password', async () => {
            // Test implementation
        });
    });

    describe('submission', () => {
        it('should call onSubmit with form data when valid', async () => {
            // Test implementation
        });

        it('should not submit when form is invalid', async () => {
            // Test implementation
        });
    });
});
```

### Test Naming

```typescript
// ✅ Correct: Descriptive test names with "should"
describe('LoginForm', () => {
    it('should render email and password inputs', () => { });
    it('should display validation error for invalid email', () => { });
    it('should call login handler when form is submitted', () => { });
    it('should disable submit button while loading', () => { });
});

// ❌ Incorrect: Vague or poorly structured names
it('renders', () => { });                    // Too vague
it('test login', () => { });                 // Not descriptive
it('LoginForm validation', () => { });       // Missing context
```

### Testing Library Best Practices

```typescript
// ✅ Correct: Query by role and accessible text
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should submit form with valid credentials', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Act - Use accessible queries
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'password123',
        });
    });
});

// ❌ Incorrect: Query by implementation details
it('should submit form', async () => {
    render(<LoginForm onSubmit={onSubmit} />);

    // Don't query by className, testId, or DOM structure
    const emailInput = screen.getByClassName('email-input');      // Bad
    const form = screen.getByTestId('login-form');                // Bad
    const button = screen.container.querySelector('button');      // Bad
});
```

### Component Rendering Tests

```typescript
describe('GameSessionCard', () => {
    const mockSession = {
        id: '123',
        title: 'World Adventure',
        ownerId: 'user-1',
        status: 'InProgress',
        playerCount: 4,
    };

    it('should render session title and status', () => {
        // Arrange
        render(<GameSessionCard session={mockSession} />);

        // Assert
        expect(screen.getByRole('heading', { name: 'World Adventure' })).toBeInTheDocument();
        expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });

    it('should render player count badge', () => {
        // Arrange
        render(<GameSessionCard session={mockSession} />);

        // Assert
        expect(screen.getByText('4 Players')).toBeInTheDocument();
    });

    it('should call onSelect when card is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<GameSessionCard session={mockSession} onSelect={onSelect} />);

        // Act
        const card = screen.getByRole('article');
        await user.click(card);

        // Assert
        expect(onSelect).toHaveBeenCalledWith('123');
    });
});
```

### Conditional Rendering Tests

```typescript
describe('ErrorDisplay', () => {
    it('should not render when error is null', () => {
        // Arrange
        render(<ErrorDisplay error={null} />);

        // Assert
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should render error message when error exists', () => {
        // Arrange
        const error = { message: 'Something went wrong' };
        render(<ErrorDisplay error={error} />);

        // Assert
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show retry button for retryable errors', () => {
        // Arrange
        const error = { message: 'Network error', retryable: true };
        const onRetry = vi.fn();
        render(<ErrorDisplay error={error} onRetry={onRetry} />);

        // Assert
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
});
```

### Testing Theme Support (REQUIRED)

**CRITICAL**: All UI components MUST be tested in both dark and light modes. See [THEME_GUIDE.md](./THEME_GUIDE.md) for theme requirements.

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoginForm } from './LoginForm';

describe('LoginForm theme support', () => {
    // Helper to render with specific theme mode
    const renderWithTheme = (mode: 'light' | 'dark') => {
        const theme = createTheme({ palette: { mode } });
        return render(
            <ThemeProvider theme={theme}>
                <LoginForm />
            </ThemeProvider>
        );
    };

    it('should render correctly in light mode', () => {
        // Arrange & Act
        renderWithTheme('light');

        // Assert - Component renders and is accessible
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render correctly in dark mode', () => {
        // Arrange & Act
        renderWithTheme('dark');

        // Assert - Component renders and is accessible
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should apply theme-specific styles', () => {
        // Arrange & Act
        const { container } = renderWithTheme('dark');

        // Assert - Verify theme-aware styling is applied
        const card = container.querySelector('[class*="AuthCard"]');
        expect(card).toHaveStyle({ backgroundColor: expect.any(String) });
    });
});
```

**Manual Testing Requirements**:
- [ ] Visually test component in light mode
- [ ] Visually test component in dark mode
- [ ] Verify text contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Check that all interactive elements are visible in both modes

**Automated Testing Coverage**:
```typescript
// Example: Testing theme-aware custom component
describe('EncounterCanvas theme support', () => {
    it('should use theme background color in light mode', () => {
        const { container } = renderWithTheme('light');
        const canvas = container.querySelector('[class*="EncounterCanvas"]');

        // Verify light mode background is applied
        expect(canvas).toHaveStyle({ backgroundColor: expect.stringMatching(/#F9FAFB|rgb\(249, 250, 251\)/) });
    });

    it('should use theme background color in dark mode', () => {
        const { container } = renderWithTheme('dark');
        const canvas = container.querySelector('[class*="EncounterCanvas"]');

        // Verify dark mode background is applied
        expect(canvas).toHaveStyle({ backgroundColor: expect.stringMatching(/#1F2937|rgb\(31, 41, 55\)/) });
    });
});
```

### Testing Custom Hooks

```typescript
// useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { Provider } from 'react-redux';
import { store } from '@/store';

describe('useAuth', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );

    it('should return initial auth state', () => {
        // Arrange & Act
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Assert
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should login user successfully', async () => {
        // Arrange
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Act
        await act(async () => {
            await result.current.login('user@example.com', 'password123');
        });

        // Assert
        await waitFor(() => {
            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.email).toBe('user@example.com');
        });
    });

    it('should handle login failure', async () => {
        // Arrange
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Act
        await act(async () => {
            try {
                await result.current.login('invalid@example.com', 'wrongpassword');
            } catch (err) {
                // Expected to throw
            }
        });

        // Assert
        await waitFor(() => {
            expect(result.current.error).not.toBeNull();
            expect(result.current.user).toBeNull();
        });
    });
});
```

### Mocking API Calls (MSW)

```typescript
// setupTests.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
    rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                user: { id: '1', email: 'user@example.com', name: 'Test User' },
                token: 'fake-jwt-token',
            })
        );
    }),

    rest.get('/api/sessions', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { id: '1', title: 'Session 1', status: 'Draft' },
                { id: '2', title: 'Session 2', status: 'InProgress' },
            ])
        );
    }),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Redux Slice Testing

```typescript
// authSlice.test.ts
import { describe, it, expect } from 'vitest';
import authReducer, { loginAsync, logout } from './authSlice';

describe('authSlice', () => {
    const initialState = {
        user: null,
        isLoading: false,
        error: null,
    };

    it('should return initial state', () => {
        // Act
        const result = authReducer(undefined, { type: 'unknown' });

        // Assert
        expect(result).toEqual(initialState);
    });

    it('should handle logout', () => {
        // Arrange
        const previousState = {
            user: { id: '1', email: 'user@example.com' },
            isLoading: false,
            error: null,
        };

        // Act
        const result = authReducer(previousState, logout());

        // Assert
        expect(result.user).toBeNull();
        expect(result.error).toBeNull();
    });

    it('should set loading state when login is pending', () => {
        // Act
        const result = authReducer(initialState, loginAsync.pending);

        // Assert
        expect(result.isLoading).toBe(true);
        expect(result.error).toBeNull();
    });

    it('should set user when login is fulfilled', () => {
        // Arrange
        const user = { id: '1', email: 'user@example.com', name: 'Test User' };

        // Act
        const result = authReducer(
            initialState,
            loginAsync.fulfilled(user, '', { email: '', password: '' })
        );

        // Assert
        expect(result.isLoading).toBe(false);
        expect(result.user).toEqual(user);
        expect(result.error).toBeNull();
    });

    it('should set error when login is rejected', () => {
        // Arrange
        const error = new Error('Invalid credentials');

        // Act
        const result = authReducer(
            initialState,
            loginAsync.rejected(error, '', { email: '', password: '' })
        );

        // Assert
        expect(result.isLoading).toBe(false);
        expect(result.user).toBeNull();
        expect(result.error).toBe('Invalid credentials');
    });
});
```

## Test Organization

### C# Test Project Structure

```
Source/
├── Domain.UnitTests/
│   ├── Game/
│   │   └── Sessions/
│   │       ├── Model/
│   │       │   ├── GameSessionTests.cs
│   │       │   └── PlayerTests.cs
│   │       ├── ApiContracts/
│   │       │   └── CreateGameSessionRequestTests.cs
│   │       └── ServiceContracts/
│   │           └── CreateGameSessionDataTests.cs
│   └── GlobalUsings.cs
└── Game.UnitTests/
    ├── Services/
    │   └── GameSessionServiceTests.cs
    ├── Handlers/
    │   └── GameSessionHandlersTests.cs
    └── GlobalUsings.cs
```

### TypeScript Test Organization

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── RegistrationForm.tsx
│   │   └── RegistrationForm.test.tsx
│   └── error/
│       ├── ErrorBoundary.tsx
│       └── ErrorBoundary.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
├── store/
│   ├── authSlice.ts
│   └── authSlice.test.ts
└── tests/
    ├── setup.ts           # Test setup and global mocks
    └── mocks/
        └── handlers.ts    # MSW request handlers
```

## Best Practices

### Test Independence

```csharp
// ✅ Correct: Each test is independent
public class GameSessionServiceTests {
    private IGameSessionStorage _storage = null!;
    private GameSessionService _service = null!;

    // Use constructor or [Fact] setup for fresh instances
    [Fact]
    public async Task CreateGameSessionAsync_Test1() {
        // Arrange - Fresh instances
        _storage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_storage);

        // Act & Assert
    }

    [Fact]
    public async Task CreateGameSessionAsync_Test2() {
        // Arrange - Fresh instances
        _storage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_storage);

        // Act & Assert
    }
}

// ❌ Incorrect: Shared mutable state between tests
public class GameSessionServiceTests {
    private readonly GameSessionService _service = new();  // Shared!
    private readonly List<GameSession> _sessions = [];     // Shared!

    [Fact]
    public void Test1() {
        _sessions.Add(new GameSession());  // Affects Test2!
    }

    [Fact]
    public void Test2() {
        _sessions.Should().BeEmpty();  // May fail if Test1 ran first
    }
}
```

### Test Readability

```typescript
// ✅ Correct: Descriptive variable names and clear intent
it('should display error message when login fails', async () => {
    const user = userEvent.setup();
    const invalidCredentials = { email: 'wrong@example.com', password: 'wrong' };
    const expectedErrorMessage = 'Invalid email or password';

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), invalidCredentials.email);
    await user.type(screen.getByLabelText(/password/i), invalidCredentials.password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(expectedErrorMessage)).toBeInTheDocument();
});

// ❌ Incorrect: Cryptic variables and unclear intent
it('should display error', async () => {
    const u = userEvent.setup();
    const d = { e: 'wrong@example.com', p: 'wrong' };

    render(<LoginForm />);
    await u.type(screen.getByLabelText(/email/i), d.e);
    // ... unclear what's being tested
});
```

### Testing Edge Cases

```csharp
// ✅ Correct: Test happy path AND edge cases
public class GameSessionValidationTests {
    [Theory]
    [InlineData(null, false)]               // Null title
    [InlineData("", false)]                 // Empty title
    [InlineData("   ", false)]              // Whitespace only
    [InlineData("A", true)]                 // Minimum valid
    [InlineData("Valid Title", true)]       // Normal case
    [InlineData("A very long title that exceeds 128 characters...", false)]  // Too long
    public void ValidateTitle_WithVariousInputs_ReturnsExpectedResult(
        string? title,
        bool expectedValid) {
        // Test implementation
    }

    [Fact]
    public void CreateSession_WithMaxPlayers_AllowsNoMoreJoins() {
        // Test upper boundary
    }

    [Fact]
    public void CreateSession_WithZeroPlayers_IsValidState() {
        // Test lower boundary
    }
}
```

### Avoid Testing Implementation Details

```typescript
// ✅ Correct: Test behavior, not implementation
it('should filter sessions by status', () => {
    const sessions = [
        { id: '1', status: 'Draft' },
        { id: '2', status: 'InProgress' },
        { id: '3', status: 'Draft' },
    ];

    render(<SessionList sessions={sessions} filterStatus="Draft" />);

    // Test what the user sees, not how it's filtered
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText(/in progress/i)).not.toBeInTheDocument();
});

// ❌ Incorrect: Testing implementation details
it('should call filter function with correct predicate', () => {
    const filterSpy = vi.spyOn(Array.prototype, 'filter');

    render(<SessionList sessions={sessions} filterStatus="Draft" />);

    expect(filterSpy).toHaveBeenCalledWith(expect.any(Function));
    // Don't test how filtering works internally
});
```

## Code Review Checklist

Before submitting tests for review, verify:

### General
- [ ] All tests pass locally
- [ ] Tests are independent (no shared mutable state)
- [ ] AAA pattern followed (clear Arrange, Act, Assert sections)
- [ ] Test names are descriptive and follow conventions
- [ ] No commented-out test code
- [ ] No skipped tests without explanation

### C# Tests
- [ ] xUnit [Fact] or [Theory] attributes used
- [ ] FluentAssertions used for assertions
- [ ] Test class named `{Class}Tests`
- [ ] Test methods named `{Method}_{Scenario}_{Expected}`
- [ ] Async tests return Task and use await
- [ ] Mocks verified with Received() assertions
- [ ] Edge cases tested (null, empty, boundary values)

### TypeScript Tests
- [ ] Testing Library queries used (getByRole, getByLabelText)
- [ ] userEvent used for interactions (not fireEvent)
- [ ] waitFor used for async assertions
- [ ] Component behavior tested (not implementation)
- [ ] Custom hooks tested with renderHook
- [ ] Redux slices tested with all action states
- [ ] MSW used for API mocking

### Coverage
- [ ] New/modified code has tests
- [ ] Critical paths have tests
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Coverage targets met (80% C#, 70% TypeScript)

---

## BDD/E2E Testing (Cucumber + Playwright)

### BDD Testing Philosophy

**CRITICAL**: BDD tests are **independent validators** that verify behavior, not confirm implementation.

**Core Principle**: If the app has bugs, tests MUST fail. That's their job.

```
┌─────────────────────────────────────────────────────────┐
│  BDD Scenarios = SPECIFICATION (What should happen)     │
│  Step Definitions = INDEPENDENT VALIDATOR               │
│  Application Code = IMPLEMENTATION (What does happen)   │
│                                                         │
│  Tests must verify: SPECIFICATION = IMPLEMENTATION      │
└─────────────────────────────────────────────────────────┘
```

### Testing Approach: Black-Box

**BDD E2E Tests** must test from user's perspective:
- ✅ Interact through UI (click buttons, fill forms)
- ✅ Query real database for persistence verification
- ✅ Use real API calls (not mocks)
- ✅ Assert on rendered output (what user sees)
- ❌ Don't access component internals
- ❌ Don't mock business logic
- ❌ Don't check React state directly

**Example**:
```typescript
// ✅ GOOD - Black-box testing
When('I create asset {string}', async function(name) {
  await this.page.click('button:has-text("Create")');
  await this.page.fill('input[name="name"]', name);
  await this.page.click('button:has-text("Save")');

  // Wait for REAL backend response
  const response = await this.page.waitForResponse('/api/assets');
  if (response.status() !== 201) {
    throw new Error(`Creation failed: ${response.status()}`);
  }
});

Then('the asset should exist in database', async function() {
  // Query REAL test database
  const asset = await this.db.queryTable('Assets', { Name: 'Dragon' });
  expect(asset).toBeDefined();
  expect(asset.OwnerId).toBe(this.currentUser.id);
});

// ❌ BAD - White-box, mocked testing
When('I create asset', async function() {
  mockApi.post('/api/assets').reply(201, { id: 'fake' }); // Always passes!
  await this.page.click('button:has-text("Create")');
});

Then('asset should exist', function() {
  expect(mockDb.assets).toContainEqual({ name: 'Dragon' }); // Fake data!
});
```

### False Positives vs False Negatives

**False Positive** (WORSE): Test passes but app is broken
- Caused by over-mocking, loose assertions, error swallowing
- Result: Bugs reach production

**False Negative** (BETTER): Test fails but app works
- Caused by brittle selectors, timing issues
- Result: Developer fixes test, app still works

**Rule**: Choose semantic assertions over pixel-perfect checks to avoid false negatives.

```typescript
// ❌ FALSE NEGATIVE - Brittle
Then('image has Token role', async function() {
  const borderColor = await image.evaluate(el => getComputedStyle(el).borderColor);
  expect(borderColor).toBe('rgb(33, 150, 243)'); // Exact blue
  // Dev changes to teal → test fails even though feature works
});

// ✅ CORRECT - Semantic
Then('image has Token role', async function() {
  await expect(image.locator('[role="status"]:has-text("Token")')).toBeVisible();
  // Or: await expect(image).toHaveAttribute('data-role', '1');
});
```

### When to Mock vs Use Real Dependencies

**NEVER Mock (Use Real)**:
- ❌ Backend API endpoints
- ❌ Database operations
- ❌ File uploads
- ❌ Authentication
- ❌ Redux store

**SOMETIMES Mock (With Caution)**:
- ⚠️ External services (email, blob storage if unavailable)
- ⚠️ Time-dependent operations (Date.now(), timers)
- ⚠️ Browser APIs (clipboard if not available)

**ALWAYS Mock (Safe)**:
- ✅ Performance monitoring (FPS counters)
- ✅ Analytics (Google Analytics, telemetry)
- ✅ Payment gateways (use test mode)

**VTTTools-Specific**:
- ✅ Use Real: ASP.NET Core backend, SQL Server test DB, Redux, RTK Query, React Router
- ✅ Mock: Azure Blob → local filesystem, SignalR if backend not ready

### Implementation Checklist (Before Each Step)

- [ ] Interacts through UI (not component methods)?
- [ ] Uses real API calls (not mocks)?
- [ ] Verifies real database state (not fixtures)?
- [ ] Will FAIL if feature is broken?
- [ ] Independent of implementation details?
- [ ] Won't break during code refactoring?

### When Tests Fail

1. **Investigate**: Real bug or test issue?
2. **If real bug**: Fix application code
3. **If test issue**: Fix step definition (selector, timing)
4. **Never**: Mock away the failure to make test pass

**Example - The 403 Authorization Bug**:
```gherkin
Scenario: Owner can update their own asset
  When I edit and save the asset
  Then update should succeed with 204 No Content
```

When implemented, this test WILL FAIL with 403 error (exposing the bug). Let it fail, fix the app, then test passes.

---

## 🚨 CRITICAL ANTI-PATTERNS TO AVOID

### Anti-Pattern #1: Step-to-Step Calls ❌ CRITICAL

**Problem**: Calling Cucumber steps from within other steps

```typescript
// ❌ WRONG - Creates tight coupling, TypeScript errors, unmaintainable
When('I Alt+Click the image', async function() {
  await this.keyboard.altClick('[data-testid="resource-image"]');
});

When('I Alt+Click to assign Token role', async function() {
  await this['I Alt+Click the image']();  // DON'T DO THIS!
});
```

**Why It's Bad**:
- TypeScript strict mode error: `Property 'I Alt+Click...' does not exist on type 'CustomWorld'`
- Breaks test independence
- Creates hidden step dependencies
- Stack traces become unintelligible
- Violates Cucumber best practices

**✅ CORRECT - Extract to Helper Function**:
```typescript
// helpers/keyboard.helper.ts
async function altClickImage(world: CustomWorld): Promise<void> {
  const selector = '[data-testid="resource-image"]';
  await world.keyboard.altClick(selector);
}

// keyboard-shortcuts.steps.ts
When('I Alt+Click the image', async function() {
  await altClickImage(this);
});

When('I Alt+Click to assign Token role', async function() {
  await altClickImage(this);  // Reuse helper, not step
});
```

**Impact**: Found 19 instances in agent-generated code - all fixed by extracting helpers.

---

### Anti-Pattern #2: Hard-Coded Credentials ❌ CRITICAL SECURITY

**OWASP**: A02:2021 - Cryptographic Failures

```typescript
// ❌ WRONG - Hard-coded database credentials
this.db = new DatabaseHelper(
  process.env.DATABASE_CONNECTION_STRING ||
  'Server=localhost;Database=VttTools;Integrated Security=true;TrustServerCertificate=true;'
);
```

**Security Issues**:
- Credentials exposed in repository
- `TrustServerCertificate=true` disables SSL validation (MITM vulnerability)
- Fallback allows tests to run without proper configuration

**✅ CORRECT - Fail Fast**:
```typescript
this.db = new DatabaseHelper(
  this.getRequiredEnv('DATABASE_CONNECTION_STRING')
);

private getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`CRITICAL: Required environment variable ${key} is not set. Tests cannot run.`);
  }
  return value;
}
```

**Action**: Tests must fail loudly if configuration is missing. Don't use insecure defaults.

---

### Anti-Pattern #3: SQL Injection in Table Names ❌ CRITICAL SECURITY

**OWASP**: A03:2021 - Injection

```typescript
// ❌ WRONG - SQL injection via tableName parameter
async queryTable(tableName: string, where?: Record<string, any>): Promise<any[]> {
  const query = `SELECT * FROM ${tableName} ${conditions}`;  // INJECTION!
  return await sql.query(query, where);
}

// Attack vector:
await db.queryTable("Assets; DROP TABLE Assets--");
```

**✅ CORRECT - Whitelist Allowed Tables**:
```typescript
const ALLOWED_TABLES = [
  'Assets.Assets',
  'Assets.AssetResources',
  'Media.Resources'
] as const;

async queryTable(
  tableName: typeof ALLOWED_TABLES[number],
  where?: Record<string, any>
): Promise<any[]> {
  if (!ALLOWED_TABLES.includes(tableName as any)) {
    throw new Error(`Table ${tableName} is not allowed for testing`);
  }
  // Safe to use after validation
  const query = `SELECT * FROM ${tableName} WHERE ...`;
}
```

---

### Anti-Pattern #4: Catch-All Regex Steps ❌ CRITICAL

**Problem**: Using `/^(.*)$/` regex to catch undefined steps

```typescript
// ❌ WRONG - Hides missing implementations, causes 1932 ambiguous steps!
Given(/^(.*)$/, async function(step: string) {
  debugLog(`${step}`);
});
```

**Impact**: Every step matches the catch-all, causing "Multiple step definitions match" errors.

**✅ CORRECT - Let Cucumber Report Undefined Steps**:
```
// Don't add catch-alls. Cucumber will report:
? And I should see asset name "Wooden Crate"
    Undefined. Implement with the following snippet:

    Then('I should see asset name {string}', function(string) {
      return 'pending';
    });
```

**Action**: Remove all catch-all steps. Undefined steps are better than ambiguous steps.

---

### Anti-Pattern #5: Excessive `any` Types ❌ TYPE SAFETY

```typescript
// ❌ WRONG - Defeats TypeScript
currentAsset: any = null;
createdAssets: any[] = [];
async queryTable(...): Promise<any[]> { }
```

**✅ CORRECT - Define Proper Interfaces**:
```typescript
interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  ownerId: string;
  resources: AssetResource[];
  isPublic: boolean;
  isPublished: boolean;
}

currentAsset: Asset | null = null;
createdAssets: Asset[] = [];
async queryTable(...): Promise<DbRecord[]> { }
```

---

### Anti-Pattern #6: Hard-Coded Timeouts ❌ FLAKY TESTS

```typescript
// ❌ WRONG - Race conditions, flaky on slow machines
Then('checkbox should auto-check', async function(name) {
  await this.page.waitForTimeout(100);  // Arbitrary wait
  await expect(this.page.locator(`input[name="${name}"]`)).toBeChecked();
});
```

**✅ CORRECT - Wait for Conditions**:
```typescript
Then('checkbox should auto-check', async function(name) {
  const checkbox = this.page.locator(`input[name="${name}"]`);
  await expect(checkbox).toBeChecked({ timeout: 5000 });
});
```

---

### Anti-Pattern #7: Brittle Text Selectors ❌ FRAGILE

```typescript
// ❌ WRONG - Breaks with whitespace, i18n, or text changes
await expect(this.page.locator('text=Manage your objects and creatures')).toBeVisible();
```

**✅ CORRECT - Use data-testid or Flexible Regex**:
```typescript
await expect(this.page.getByTestId('page-subtitle')).toBeVisible();
// Or:
await expect(this.page.getByText(/manage.*objects.*creatures/i)).toBeVisible();
```

---

### Anti-Pattern #8: XSS via evaluateAll() ❌ SECURITY

**OWASP**: A03:2021 - Injection (XSS variant)

```typescript
// ❌ WRONG - Direct DOM manipulation vulnerability
await this.page.locator('[role="dialog"]').evaluateAll((dialogEl) => {
  const backdrop = dialogEl.parentElement?.querySelector('.MuiBackdrop-root');
  (backdrop as HTMLElement).click();  // XSS risk
});
```

**✅ CORRECT - Use Playwright Built-In**:
```typescript
await this.page.locator('.MuiBackdrop-root').click({ force: true });
```

---

## BDD STEP DEFINITION BEST PRACTICES

### Correct Reusability Pattern

**✅ ALWAYS - Extract Shared Logic to Helpers**:

```typescript
// 1. Create helper function
// helpers/accordion.helper.ts
export async function expandAccordion(page: Page, name: string): Promise<void> {
  const header = page.locator(`button:has-text("${name}")`);
  if (await header.getAttribute('aria-expanded') !== 'true') {
    await header.click();
  }
}

// 2. Import and use in multiple steps
// accordion.steps.ts
import { expandAccordion, verifyExpanded } from '../helpers/accordion.helper.js';

When('I expand the {string} accordion', async function(name) {
  await expandAccordion(this.page, name);
});

When('I expand {string} accordion', async function(name) {
  await expandAccordion(this.page, name);  // Same helper
});

Then('accordion should be expanded', async function(name) {
  await verifyExpanded(this.page, name);  // Different helper
});
```

**Refactoring Trigger**: Extract to helper on **3rd use** (Rule of Three)

---

### Helper Function Organization

```
e2e/support/helpers/
├── keyboard.helper.ts      # Alt+Click, Ctrl+Click actions
├── upload.helper.ts        # Image upload workflow
├── database.helper.ts      # DB queries (with SQL injection protection)
├── accordion.helper.ts     # Accordion expand/collapse/verify
├── wait.helper.ts          # Timing utilities
└── validation.helper.ts    # Common assertions
```

**Each helper exports**:
- Pure functions (no side effects)
- Accept Page/Locator as parameters
- Return Promise<void> or data
- Include error handling
- JSDoc comments

---

### Security Checklist for BDD Code

Before committing step definitions:
- [ ] No hard-coded credentials or secrets
- [ ] SQL queries use whitelisted table names
- [ ] No direct DOM manipulation (evaluateAll)
- [ ] All external input validated
- [ ] Environment variables have no insecure defaults
- [ ] File paths validated (no directory traversal)
- [ ] No secrets in console.log() statements

---

## 🔧 BDD TEST DEBUGGING & COMMON FIXES

### Quick Diagnostic Commands

```bash
# Check for issues before running
npm run test:bdd:dry-run                           # Find undefined/ambiguous steps
npx tsc --noEmit --project tsconfig.e2e.json      # TypeScript errors

# Run tests
npm run test:bdd:debug:scenario "Scenario Name"    # Single test with visible browser
npm run test:bdd:scenario "Scenario Name"          # Single test headless
npm run test:bdd                                   # All tests
```

### Common Error Patterns & Fixes

#### 1. Cucumber Crash: "Cannot read properties of null"
**Symptom**: TypeError in Cucumber's internal code
**Cause**: Duplicate step definition (same pattern twice in file)
**Fix**: DELETE duplicate, search: `grep -rn "Then('pattern'" e2e/step-definitions/`

#### 2. Undefined Parameter Types
**Symptom**: "Undefined parameter types: {id}, {guid}"
**Cause**: Cucumber doesn't recognize custom types
**Fix**: Use `{string}` or escape: `the asset DELETE API should be called`

#### 3. Cucumber Expression Parsing Error
**Symptom**: "Alternative may not be empty" at `/` character
**Cause**: `/` is OR operator in Cucumber Expressions
**Fix**: Remove `/` from step text or escape: `\/`

#### 4. Empty Step Implementations
**Symptom**: Step does nothing (comment: "declarative for BDD readability")
**Fix**: `throw new Error('NOT IMPLEMENTED: describe what needs implementing');`

#### 5. Wrong Table Names
**Symptom**: "Invalid object name 'Assets.Assets'"
**Cause**: Schema prefix doesn't exist in DB
**Fix**: Check migrations, use actual table names (no prefixes)
**Tables**: `Assets`, `Users`, `Encounters`, `GameSessions` (NOT `Assets.Assets`)

#### 6. Use Semantic IDs, Not Text Selectors (CRITICAL)
**Problem**: Text-based selectors are FRAGILE - break with text changes, I18n, refactoring
**Anti-pattern**: `data-testid` (test-specific pollution)
**Best Practice**: Semantic `id` attributes

**Why Semantic IDs are Better:**
- ✅ Stable across text changes
- ✅ I18n/localization ready
- ✅ Refactoring-safe
- ✅ Help accessibility (screen readers)
- ✅ Easier debugging

**Example:**
```typescript
// ❌ FRAGILE - breaks with text change or I18n
await this.page.locator('button:has-text("Browse Assets")').click();
await expect(this.page.locator('button:has-text("Coming in Phase 7-8")')).toBeVisible();

// ❌ ANTI-PATTERN - test pollution
<Button data-testid="browse-assets-button">Browse Assets</Button>

// ✅ BEST PRACTICE - semantic ID
<Button id="btn-browse-assets">Browse Assets</Button>
await this.page.locator('#btn-browse-assets').click();
```

**ID Naming Convention:**
- Buttons: `#btn-{action}` (e.g., `#btn-open-editor`, `#btn-browse-assets`)
- Cards: `#card-{name}` (e.g., `#card-encounter-editor`)
- Sections: `#section-{name}` (e.g., `#hero-section`, `#dashboard-section`)
- Labels: `#label-{context}` (e.g., `#label-content-library-disabled`)
- Headings: `#heading-{context}` or `#{type}-{context}` (e.g., `#hero-title`, `#dashboard-greeting`)

**When to Use Text Selectors:**
- ✅ Dynamic content (user names, counts)
- ✅ Content that must match exactly for validation
- ✅ Error messages (verify exact wording)

**When to Use IDs:**
- ✅ Interactive elements (buttons, links, inputs)
- ✅ Section containers
- ✅ Navigation elements
- ✅ Cards/tiles
- ✅ Any element tested frequently

#### 7. Wrong Routes
**Symptom**: Page not found / Navigation fails
**Fix**: Check `App.tsx` routes - Asset Library is `/assets` not `/asset-library`

#### 8. Authentication Fails
**Symptom**: 401 Unauthorized on API calls after login
**Cause**: Hard-coded headers override login cookies
**Fix**: Remove `extraHTTPHeaders` from world.ts, let login set cookies

#### 9. Database Connection Timeout (LocalDB)
**Symptom**: "Failed to connect to localhost\MSSQLLocalDB"
**Cause**: `mssql` library uses TCP/IP, LocalDB needs Named Pipes
**Fix**: Use `msnodesqlv8` library + ODBC Driver 17
**Connection String**: `Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\...;Trusted_Connection=yes;`

#### 10. Hardcoded Values
**Symptom**: Passwords, IDs in code
**Fix**: `.env` file + validation:
```typescript
const password = process.env.BDD_TEST_PASSWORD;
if (!password) throw new Error('BDD_TEST_PASSWORD not set');
```

#### 11. Context Closure Causes about:blank
**Symptom**: Browser briefly shows page, then redirects to `about:blank`
**Cause**: Step closes browser context, destroying the current page
**Example:**
```typescript
// ❌ WRONG - Destroys page
Given('I am not authenticated', async function() {
  await this.context.close();  // Kills current page!
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();  // New blank page
});
```
**Fix:** Clear auth state without closing context:
```typescript
// ✅ CORRECT - Keeps page alive
Given('I am not authenticated', async function() {
  await this.context.clearCookies();
  await this.page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  // Page stays at current URL, just auth cleared
});
```

#### 12. Feature File Not Found (0 scenarios)
**Symptom**: Test runs but reports "0 scenarios, 0 steps"
**Cause**: Feature file not in `cucumber.cjs` paths for the profile being used
**Fix:** Add feature to both `default` and `debug` profile paths
**Check:** `cucumber.cjs` lines 33-40 and 75-82

#### 13. @anonymous Tag for Guest Tests
**Pattern:** Use `@anonymous` tag to skip user pool acquisition for guest/unauthenticated scenarios
**Implementation:**
```typescript
// In Before hook - check tags
const isAnonymous = testCase.pickle.tags.some(tag => tag.name === '@anonymous');
if (isAnonymous) {
  // Skip user acquisition, init without currentUser
  await this.init();
  return;
}
```
**Benefits:** Faster test execution, no unnecessary user creation, clearer test intent

### Test Infrastructure Setup Pattern

**BeforeAll** (runs once per test run):
```typescript
1. Cleanup orphaned test users from crashed runs
2. Create test user pool via backend API (NOT UI registration)
3. Store users in global array
```

**Before** (runs before each scenario):
```typescript
1. Acquire free user from pool (thread-safe)
2. Initialize browser + page objects
3. Set currentUser = pool user
```

**After** (runs after each scenario):
```typescript
1. Cleanup user's data (DELETE WHERE OwnerId = userId)
   CRITICAL: Use deleteUserDataOnly(), NOT deleteUser()
2. Release user back to pool
3. Close browser
```

**AfterAll** (runs once at end):
```typescript
1. Delete all test users from pool
2. Verify cleanup complete
```

### BDD Test Isolation - Critical Lessons

#### Problem: Tests Pass Individually, Fail in Suite

**Symptom**: First 16 scenarios pass, then auth failures start occurring.

**Root Cause**: User deletion in After hook - tests were calling `deleteUser()` which deleted the **user account**, not just the user's data.

**Impact**: After test #N uses `bdd-test-user-1`, that user no longer exists. Test #N+16 tries to login with deleted user → 400 Bad Request "Invalid email or password".

**Solution**:
```typescript
// ❌ WRONG - Deletes user account from database
async deleteUser(userId: string): Promise<void> {
    const query = `
        DELETE FROM Assets WHERE OwnerId = ?;
        DELETE FROM Encounters WHERE OwnerId = ?;
        ...
        DELETE FROM Users WHERE Id = ?;  // ← USER DELETED!
    `;
    await this.executeQuery(query, Array(14).fill(userId));
}

// ✅ CORRECT - Keeps user, deletes only their data
async deleteUserDataOnly(userId: string): Promise<void> {
    const query = `
        DELETE FROM Assets WHERE OwnerId = ?;
        DELETE FROM Encounters WHERE OwnerId = ?;
        ...
        // NO: DELETE FROM Users WHERE Id = ?;
    `;
    await this.executeQuery(query, Array(13).fill(userId));
}

// In After hook - use the correct function
After(async function (this: CustomWorld, testCase) {
    if (this.currentUser && this.db) {
        await this.db.deleteUserDataOnly(this.currentUser.id); // ← Preserves user
    }
    if (this.currentUser) {
        releaseUser(this.currentUser.id);
    }
});
```

**Verification**:
1. Run single scenario → Should pass
2. Run full feature (20+ scenarios) → All should pass
3. Check database after test → Pool users still exist, but no test data

#### Problem: Browser State Leakage Between Tests

**Symptom**: Dashboard not rendering after login, even though cookie exists.

**Root Cause**: React's `globalAuthInitialized` flag prevents `useGetCurrentUserQuery` from running when it's already been initialized.

**Solution**: Force page reload after login to reset React's global state:

```typescript
// In authenticated setup steps
When('I successfully log in', { timeout: 60000 }, async function (this: CustomWorld) {
    await this.page.locator('#cta-explore-features').click();
    await this.page.waitForURL(/login/);

    const password = process.env.BDD_TEST_PASSWORD!;
    await this.page.fill('input[type="email"]', this.currentUser.email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    await this.page.waitForURL(url => !url.pathname.includes('/login'));
    await this.page.waitForLoadState('networkidle');

    // CRITICAL: Reset React's global auth state
    await this.page.reload({ waitUntil: 'networkidle' });

    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');

    await this.page.waitForFunction(() => {
        return document.querySelector('#dashboard-greeting') !== null;
    }, { timeout: 30000 });
});
```

#### Problem: Insufficient Browser State Cleanup

**Initial (Wrong) Approach**:
```typescript
Given('I am viewing the landing page as unauthenticated visitor', async function() {
    await this.context.clearCookies(); // Only cleared cookies
    await this.page.reload();
});
```

**Why It Failed**: localStorage and sessionStorage persisted between tests, causing auth state pollution.

**Correct Approach**:
```typescript
Given('I am viewing the landing page as unauthenticated visitor', async function() {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
});
```

#### Debugging BDD Test Failures - Systematic Approach

When tests fail after N scenarios:

1. **Add Debug Logging** (temporarily):
```typescript
console.log('[DEBUG] Login: Email:', this.currentUser.email);
const response = await loginResponse;
const responseBody = await response.json();
console.log('[DEBUG] API Response:', JSON.stringify(responseBody));
const cookies = await this.context.cookies();
console.log('[DEBUG] Cookies count:', cookies.length);
```

2. **Identify the Pattern**:
   - Does it always fail at the same scenario number?
   - Does it fail on the same user?
   - What's the actual error from the backend?

3. **Common Causes**:
   - User pool exhaustion (not enough users)
   - User deletion instead of data cleanup
   - Browser state leakage (cookies, localStorage)
   - Backend session state not cleared
   - Frontend global state not reset

4. **Verification Steps**:
```typescript
// Check user exists in database
const user = await db.queryTable('Users', { Email: 'bdd-test-user-1@test.local' });
console.log('User exists:', !!user);

// Check cookies after login
const cookies = await this.context.cookies();
const sessionCookie = cookies.find(c => c.name.includes('AspNetCore'));
console.log('Session cookie:', sessionCookie ? 'EXISTS' : 'MISSING');

// Check React auth state
const authState = await this.page.evaluate(() => {
    return window.localStorage.getItem('auth');
});
console.log('Auth state:', authState);
```

5. **Remove Debug Logging** after fix is confirmed.

#### Test Isolation Checklist

Before considering a BDD test suite "done":

- [ ] Each test starts with completely clean state
- [ ] After hook deletes data, NOT users
- [ ] Browser context cleared (cookies + localStorage + sessionStorage)
- [ ] Tests pass individually
- [ ] Tests pass when run as full suite (all scenarios)
- [ ] Tests pass in any order (randomize execution)
- [ ] No hardcoded timeouts (use conditions)
- [ ] No shared mutable state between scenarios
- [ ] User pool size ≥ parallel workers
- [ ] Database cleanup respects foreign keys

### Cleanup Query Pattern

```typescript
// Delete in foreign key order:
DELETE FROM AssetResources WHERE AssetId IN (SELECT Id FROM Assets WHERE OwnerId = ?);
DELETE FROM EncounterAssets WHERE EncounterId IN (SELECT Id FROM Encounters WHERE OwnerId = ?);
DELETE FROM Assets WHERE OwnerId = ?;
DELETE FROM Encounters WHERE OwnerId = ?;
// ... more tables
DELETE FROM Users WHERE Id = ?;

// Parameters: userId repeated N times (count your DELETE statements)
const params = Array(14).fill(userId);
```

### Step Definition Best Practices for Agents

**DO:**
- ✅ **Use semantic IDs as primary selectors** (`#btn-save`, `#card-encounter-editor`)
- ✅ Use text selectors only for dynamic content (user names, error messages)
- ✅ Wait for conditions: `expect(locator).toBeVisible({ timeout: 10000 })`
- ✅ Query real database for verification
- ✅ Use real API calls
- ✅ Extract to helpers on 3rd use
- ✅ Parameterize steps: `When('the {string} page loads', ...)`
- ✅ Read backend migrations to verify schema
- ✅ Add semantic IDs to components (not data-testids)

**DON'T:**
- ❌ Call steps from other steps
- ❌ Add data-testids to production components
- ❌ Mock backend business logic
- ❌ Hardcode credentials/secrets
- ❌ Use `waitForTimeout()` (use `waitFor` conditions)
- ❌ Assume table names (check schema)
- ❌ Create empty placeholder steps

---

## Database Fixture Patterns (BDD Tests)

### Why Database Fixtures Over API Endpoints

**Problem**: Using API endpoints (like `/api/auth/register`) for test setup introduces:
- Business logic side effects (validation, email confirmation, password strength requirements)
- Unpredictable state (what if registration rules change?)
- Slower execution (HTTP overhead + business logic execution)
- Coupling to API implementation details

**Solution**: Direct database insertion for precise control over test user state.

### Creating Test Users - The createTestUser Pattern

This pattern allows flexible test user creation with optional parameters and sensible defaults.

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
    // Build user object with only defined properties (exactOptionalPropertyTypes compliance)
    const userToInsert: {
        email: string;
        userName: string;
        emailConfirmed: boolean;
        passwordHash: string;
        name?: string;
        displayName?: string;
    } = {
        email,
        userName: email,  // CRITICAL: userName is ALWAYS email per AuthService.cs:81
        emailConfirmed: options?.emailConfirmed ?? true,  // Default confirmed unless specified
        passwordHash: process.env.BDD_TEST_PASSWORD_HASH!
    };

    // Only add optional properties if they have values (TypeScript strict mode compliance)
    if (options?.name) {
        userToInsert.name = options.name;
    }
    if (options?.displayName) {
        userToInsert.displayName = options.displayName;
    }

    const userId = await world.db.insertUser(userToInsert);

    // Apply additional settings via updateRecord (for properties that need special handling)
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

### Usage Examples

```typescript
// Default user (confirmed email)
Given('an account exists with email {string}', async function(email) {
    const userId = await createTestUser(this, email);
    this.currentUser = { id: userId, email, name: email.split('@')[0] };
});

// Unconfirmed email
Given('an unconfirmed account exists with email {string}', async function(email) {
    const userId = await createTestUser(this, email, {
        emailConfirmed: false
    });
    this.currentUser = { id: userId, email, name: email.split('@')[0] };
});

// Locked account
Given('the account is locked due to failed login attempts', async function() {
    const lockoutEnd = new Date(Date.now() + 5 * 60 * 1000);
    await createTestUser(this, 'locked@example.com', {
        lockoutEnd,
        accessFailedCount: 5
    });
});

// 2FA enabled account
Given('an account exists with 2FA enabled', async function() {
    await this.db.updateRecord('Users', this.currentUser.id, {
        TwoFactorEnabled: true
    });
});
```

### TypeScript Strict Mode Compliance (exactOptionalPropertyTypes)

**Problem**: With `exactOptionalPropertyTypes: true`, you cannot pass `undefined` to optional properties.

```typescript
// ❌ WRONG - Compilation error
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
const userToInsert = {
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

### User Cleanup Strategies

**Critical Distinction**: `deleteUser()` vs `deleteUserDataOnly()`

**Two Types of Test Users**:
1. **Pool Users** (created in BeforeAll):
   - Created once, reused across scenarios
   - Clean data only, preserve account
   - Reset state after each test

2. **Scenario-Specific Users** (created via createTestUser):
   - Created during test execution
   - Delete completely after test
   - Tracked in `world.createdTestUsers`

```typescript
// In After hook - CORRECT cleanup approach
After(async function (this: CustomWorld, testCase) {
    if (this.currentUser && this.db) {
        // Delete pool user's data but preserve the account for reuse
        await this.db.deleteUserDataOnly(this.currentUser.id);

        // Reset pool user state to defaults (for reuse in next scenario)
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

    // Release pool user for next test
    if (this.currentUser) {
        releaseUser(this.currentUser.id);
    }
});
```

**deleteUserDataOnly Implementation**:
```typescript
// ✅ CORRECT - Keeps user, deletes only their data
async deleteUserDataOnly(userId: string): Promise<void> {
    const query = `
        DELETE FROM AssetResources WHERE AssetId IN (SELECT Id FROM Assets WHERE OwnerId = ?);
        DELETE FROM Assets WHERE OwnerId = ?;
        DELETE FROM Encounters WHERE OwnerId = ?;
        DELETE FROM GameSessions WHERE OwnerId = ?;
        -- NO: DELETE FROM Users WHERE Id = ?;
    `;
    await this.executeQuery(query, Array(13).fill(userId));
}
```

### Password Hashing Approach

**Security**: Never hardcode passwords or generate hashes in test code.

**Setup** (.env file):
```bash
BDD_TEST_PASSWORD=YourSecureTestPassword123!
BDD_TEST_PASSWORD_HASH=<pre-generated-hash-matching-password>
```

**Benefits**:
- ✅ Consistent across all test users
- ✅ Matches backend hashing algorithm (ASP.NET Identity)
- ✅ Faster test execution (no hash generation)
- ✅ Secure (not exposed in code)

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

### When to Use Database Fixtures vs API Endpoints

**Use Database Fixtures For**:
- ✅ Test setup and preconditions
- ✅ Creating users with specific states (locked, unconfirmed, 2FA enabled)
- ✅ Setting up complex data relationships
- ✅ Scenarios requiring precise control over entity state

**Use API Endpoints For**:
- ✅ Testing the API itself (authentication flow, registration validation)
- ✅ Integration tests verifying end-to-end behavior
- ✅ Scenarios where you want to test the complete registration workflow

### Related Patterns

For more comprehensive documentation on BDD testing patterns, see:
- `.claude/guides/BDD_CUCUMBER_GUIDE.md` - Complete BDD guide with HandleLogin case study
- "BDD Implementation Lessons Learned - HandleLogin Case Study" section for detailed examples

### Systematic Fix Approach

1. **Run dry-run**: Identify undefined/ambiguous steps
2. **Run one test**: `npm run test:bdd:debug:scenario "Name"`
3. **Watch browser**: See where it fails visually
4. **Check console**: Read error messages
5. **Fix root cause**: Apply pattern from this guide
6. **Verify**: Test should pass or fail for right reason
7. **Document new patterns**: Add to this section
8. **Move to next**: One test at a time

### Configuration Files

**`.env`** (required):
```env
PARALLEL_WORKERS=1
BDD_TEST_PASSWORD=<secure-password>
DATABASE_CONNECTION_STRING=Driver={ODBC Driver 17...};
VITE_API_URL=http://localhost:5173/api
```

**`cucumber.cjs`**: Read `PARALLEL_WORKERS` from env, not hardcoded

**`package.json`**: Suppress deprecation warnings:
```json
"test:bdd": "cross-env NODE_OPTIONS='--disable-warning=DEP0180' cucumber-js"
"test:bdd:debug": "cross-env DEBUG_MODE=true NODE_OPTIONS='--disable-warning=DEP0180' cucumber-js --profile debug"
```

**`tsconfig.e2e.json`**: Include Node types:
```json
"types": ["node", "@cucumber/cucumber", "@playwright/test"]
```

---

## Integration Testing

### Purpose

Integration tests verify that multiple components work together correctly:
- Frontend → Backend API
- Backend API → Database
- Component → Component
- Service → Storage

### Frontend Integration Tests

**Framework**: Vitest + MSW (Mock Service Worker)

```typescript
// Integration test with mocked API (Component Tests)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ user: { id: '1' } }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

it('should login user and update Redux state', async () => {
  // This is grey-box: Tests component + Redux + API (mocked)
  const { result } = renderHook(() => useAuth(), { wrapper: ReduxProvider });

  await act(() => result.current.login('user@test.com', 'pass'));

  expect(result.current.user).toBeDefined();
  expect(result.current.isAuthenticated).toBe(true);
});
```

### Backend Integration Tests

**Framework**: xUnit + In-Memory Database

```csharp
public class AssetServiceIntegrationTests {
    private readonly ApplicationDbContext _context;
    private readonly AssetService _service;

    public AssetServiceIntegrationTests() {
        // Use in-memory database for integration tests
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        var storage = new AssetStorage(_context);
        var mediaStorage = new InMemoryMediaStorage();
        _service = new AssetService(storage, mediaStorage);
    }

    [Fact]
    public async Task CreateAsset_PersistsToDatabase() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new CreateAssetData { Name = "Test" };

        // Act - Uses REAL storage layer
        var result = await _service.CreateAssetAsync(userId, data);

        // Assert - Query REAL in-memory database
        var asset = await _context.Assets.FindAsync(result.Value!.Id);
        asset.Should().NotBeNull();
        asset!.Name.Should().Be("Test");
    }
}
```

### Database Verification in BDD

```typescript
// In BDD step definitions - query REAL database
Then('the database should contain the asset record', async function() {
  const asset = await this.db.queryTable('Assets', { Id: this.assetId });

  expect(asset).toBeDefined();
  expect(asset.Name).toBe('Dragon');
  expect(asset.OwnerId).toBe(this.currentUser.id);
  expect(asset.CreatedAt).toBeDefined();
});

Then('AssetResources table should have {int} records', async function(count) {
  const records = await this.db.queryTable('AssetResources', {
    AssetId: this.assetId
  });
  expect(records.length).toBe(count);
});
```

---

## BDD Step Definition Reusability

### Rule of Three

**Don't abstract until 3rd use**:
1. First use: Write inline
2. Second use: Add TODO comment
3. Third use: **REFACTOR to shared helper**

### Reusability Tiers

**Tier 1** (20+ uses) - Create immediately:
- `When I click {string}` (60 uses)
- `Then I should see {string}` (80 uses)
- `When I fill in name {string}` (35 uses)
- Button state assertions (25 uses)

**Tier 2** (10-19 uses) - Create on 2nd use:
- Upload workflow (18 uses)
- Keyboard shortcuts (Alt+Click, Ctrl+Click - 15 uses)
- Accordion operations (12 uses)
- Checkbox operations (25 uses)

**Tier 3** (5-9 uses) - Wait for 3rd use
**Tier 4** (<5 uses) - Keep inline

### Directory Structure

```
Source/WebClientApp/e2e/
├── step-definitions/
│   ├── shared/              # Tier 1: High frequency
│   ├── domain/              # Tier 2: Domain-specific
│   ├── feature-specific/    # Tier 3-4: Feature-specific
│   └── integration/         # Database/API verification
├── page-objects/            # Page Object Model
├── support/
│   ├── fixtures/            # Test data builders
│   ├── helpers/             # Utilities
│   └── world.ts             # Cucumber World
└── test-data/images/        # Test assets
```

### Estimated Impact

**Without Reusability**:
- 200 scenarios × 5 steps = 1,000 implementations
- 1,000 steps × 10 lines = 10,000 lines of code

**With Reusability**:
- ~80 unique step definitions
- ~1,700 total lines (steps + helpers + page objects)
- **83% reduction**, **~8,300 lines saved**

---

## Unit Testing for Authorization Bug Diagnosis

### Problem: 403 Forbidden on Asset Update

**Root Cause**: Unknown - could be GUID encoding, backend decoding, or ownership comparison

**Solution**: Create unit tests to isolate each layer

### Frontend: GUID Encoding Test

**File**: `Source/WebClientApp/src/services/enhancedBaseQuery.test.ts` (CREATE)

```typescript
describe('GUID encoding for x-user header', () => {
  it('should match .NET Guid.ToByteArray() format', () => {
    const guid = '019639ea-c7de-7a01-8548-41edfccde206';
    const expectedBase64Url = '6jmWAd7HAXqFSEHt_M3iBg';

    // Test mixed endianness: Data1-3 little-endian, Data4 big-endian
    const result = encodeGuidToBase64Url(guid);
    expect(result).toBe(expectedBase64Url);
  });

  it('should handle mixed endianness correctly', () => {
    const guid = '01020304-0506-0708-090a-0b0c0d0e0f10';
    const bytes = guidToByteArray(guid);

    // Verify little-endian for Data1-3
    expect(bytes[0]).toBe(0x04); // Data1: 01020304 → [04,03,02,01]
    expect(bytes[4]).toBe(0x06); // Data2: 0506 → [06,05]
    expect(bytes[6]).toBe(0x08); // Data3: 0708 → [08,07]

    // Verify big-endian for Data4
    expect(bytes[8]).toBe(0x09); // Data4: 090a0b... → [09,0a,...]
  });
});
```

### Backend: UserIdentificationHandler Test

**File**: `Source/Common.UnitTests/Middlewares/UserIdentificationHandlerTests.cs` (ENHANCE)

```csharp
[Theory]
[InlineData("019639ea-c7de-7a01-8548-41edfccde206", "6jmWAd7HAXqFSEHt_M3iBg")]
[InlineData("0199bf66-76d7-7e4a-9398-8022839c7d80", "Zr-ZAdf2SvaSk4AiQ5x9gA")]
public async Task RoundTrip_EncodeDecodeGuid_ReturnsOriginal(
    string originalGuid,
    string base64Url)
{
    // Verify frontend encoding matches backend decoding
    var guid = new Guid(originalGuid);
    var bytes = guid.ToByteArray();
    var encoded = Base64UrlTextEncoder.Encode(bytes);

    encoded.Should().Be(base64Url);

    var decoded = new Guid(Base64UrlTextEncoder.Decode(base64Url));
    decoded.Should().Be(guid);
}
```

### Diagnostic Process

1. **Run frontend encoding test** - Verifies GUID→bytes→base64url
2. **Run backend decoding test** - Verifies base64url→bytes→GUID
3. **Run round-trip test** - Verifies frontend ↔ backend compatibility
4. **If all pass but 403 still occurs** - Bug is in ownership comparison logic

**See**: `Documents/Areas/Assets/UNIT_TEST_RECOMMENDATIONS.md` for complete examples

---

**Evidence-Based Confidence**: ★★★★★ (extracted from 100+ test files, verified patterns)

**Enforcement**: Code review, coverage reports

**Last Updated**: 2025-10-12

**Version**: 2.0 (Added BDD/E2E and Integration Testing sections)
