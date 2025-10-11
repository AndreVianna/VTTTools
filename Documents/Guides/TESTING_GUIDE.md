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
        Title = "Epic Adventure",
        SceneId = Guid.CreateVersion7()
    };
    var storage = Substitute.For<IGameSessionStorage>();
    var service = new GameSessionService(storage);

    // Act
    var result = await service.CreateGameSessionAsync(userId, data);

    // Assert
    result.StatusCode.Should().Be(HttpStatusCode.Created);
    result.Value.Should().NotBeNull();
    result.Value!.Title.Should().Be("Epic Adventure");
    result.Value.OwnerId.Should().Be(userId);

    await storage.Received(1).AddAsync(
        Arg.Is<GameSession>(s => s.Title == "Epic Adventure"),
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
        title: 'Epic Adventure',
        ownerId: 'user-1',
        status: 'InProgress',
        playerCount: 4,
    };

    it('should render session title and status', () => {
        // Arrange
        render(<GameSessionCard session={mockSession} />);

        // Assert
        expect(screen.getByRole('heading', { name: 'Epic Adventure' })).toBeInTheDocument();
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
describe('SceneCanvas theme support', () => {
    it('should use theme background color in light mode', () => {
        const { container } = renderWithTheme('light');
        const canvas = container.querySelector('[class*="SceneCanvas"]');

        // Verify light mode background is applied
        expect(canvas).toHaveStyle({ backgroundColor: expect.stringMatching(/#F9FAFB|rgb\(249, 250, 251\)/) });
    });

    it('should use theme background color in dark mode', () => {
        const { container } = renderWithTheme('dark');
        const canvas = container.querySelector('[class*="SceneCanvas"]');

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

**Evidence-Based Confidence**: ★★★★★ (extracted from 100+ test files, verified patterns)

**Enforcement**: Code review, coverage reports

**Last Updated**: 2025-10-03

**Version**: 1.0
