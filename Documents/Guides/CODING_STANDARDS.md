# VTTTools Coding Standards

This document provides an overview of the coding standards and conventions used in the VTTTools project. These standards have been extracted from the existing codebase through systematic analysis and are enforced through .editorconfig rules and development practices.

## Table of Contents

- [Overview](#overview)
- [Language-Specific Guides](#language-specific-guides)
- [Architecture Standards](#architecture-standards)
- [General Principles](#general-principles)
- [Code Quality Requirements](#code-quality-requirements)
- [Documentation Standards](#documentation-standards)

## Overview

VTTTools follows a **DDD Contracts + Service Implementation** architecture pattern with strict adherence to modern .NET and TypeScript/React best practices. All code must pass automated quality checks enforced through .editorconfig and linting tools.

### Project Technology Stack

**Backend (C# / .NET 9)**:
- ASP.NET Core with Minimal APIs
- Entity Framework Core
- xUnit with FluentAssertions
- File-scoped namespaces with K&R brace style

**Frontend (TypeScript / React)**:
- React 18 with TypeScript 5
- Redux Toolkit 2.9 with RTK Query
- Material-UI (MUI) for components
- Vite build system
- Vitest with Testing Library

**UI Framework (Blazor)**:
- Blazor Server + WebAssembly hybrid
- Bootstrap 5 for styling
- ASP.NET Core Identity integration
- InteractiveWebAssembly render mode

## Language-Specific Guides

For detailed language-specific coding standards, refer to these dedicated guides:

- [C# Style Guide](./CSHARP_STYLE_GUIDE.md) - Comprehensive C# formatting, naming, and patterns
- [TypeScript Style Guide](./TYPESCRIPT_STYLE_GUIDE.md) - TypeScript/React component and state management standards
- [Razor Style Guide](./RAZOR_STYLE_GUIDE.md) - Blazor component and page development patterns
- [Testing Guide](./TESTING_GUIDE.md) - Unit testing standards for C# and TypeScript

## Architecture Standards

### DDD Contracts + Service Implementation Pattern

**Domain Layer** (anemic model):
```csharp
// Domain records with init-only properties
public record GameSession {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Title { get; init; } = string.Empty;
    public List<Participant> Players { get; init; } = [];
}
```

**Service Layer** (business logic):
```csharp
// Services use primary constructors and express business rules
public class GameSessionService(IGameSessionStorage storage) : IGameSessionService {
    public async Task<TypedResult<HttpStatusCode, GameSession>> CreateAsync(
        Guid userId, CreateGameSessionData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors])
                .WithNo<GameSession>();

        var session = new GameSession { Title = data.Title, OwnerId = userId };
        await storage.AddAsync(session, ct);
        return TypedResult.As(HttpStatusCode.Created, session);
    }
}
```

**Storage Layer** (repository pattern):
```csharp
// Interface-based storage abstraction
public interface IGameSessionStorage {
    Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(GameSession session, CancellationToken ct = default);
    Task UpdateAsync(GameSession session, CancellationToken ct = default);
}
```

**API Layer** (minimal APIs):
```csharp
// Static handlers in dedicated classes
public static class GameSessionHandlers {
    public static async Task<Results<Ok<GameSession>, NotFound>> GetById(
        Guid id, IGameSessionService service) {
        var session = await service.GetByIdAsync(id);
        return session is null ? TypedResults.NotFound() : TypedResults.Ok(session);
    }
}
```

### Error Handling Pattern

**Backend**: Use `Result<T>` pattern for business logic errors (no exceptions):
```csharp
public async Task<TypedResult<HttpStatusCode, GameSession>> UpdateAsync(...) {
    var session = await storage.GetByIdAsync(sessionId, ct);
    if (session is null)
        return TypedResult.As(HttpStatusCode.NotFound).WithNo<GameSession>();

    if (session.OwnerId != userId)
        return TypedResult.As(HttpStatusCode.Forbidden).WithNo<GameSession>();

    // ... update logic
    return TypedResult.As(HttpStatusCode.OK, session);
}
```

**Frontend**: Redux Toolkit Query handles API errors automatically:
```typescript
const { data, error, isLoading } = useGetGameSessionQuery(sessionId);

if (error) {
    // RTK Query provides structured error information
    return <ErrorDisplay error={error} />;
}
```

### Dependency Injection

**C# Service Registration**:
```csharp
// Extension methods for clean registration
public static class HostApplicationBuilderExtensions {
    public static IHostApplicationBuilder AddGameServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IGameSessionService, GameSessionService>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
        return builder;
    }
}
```

**React Context/Hooks**:
```typescript
// Custom hooks encapsulate Redux store access
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector(state => state.auth);

    const login = async (email: string, password: string) => {
        await dispatch(loginAsync({ email, password })).unwrap();
    };

    return { user, isLoading, login };
};
```

## UI/Frontend Standards

### Theme System Requirements

**CRITICAL**: All UI components MUST support both dark and light modes. See [THEME_GUIDE.md](./THEME_GUIDE.md) for complete documentation.

#### Centralized Color Configuration

**Location**: `Source/WebClientApp/src/components/theme/themeColors.ts`

All theme colors are centralized in a single file. To customize colors across the entire application, modify this file.

#### Required Pattern: Use Theme Palette

**✅ CORRECT - Use theme colors**:
```typescript
import { useTheme } from '@mui/material';

export const MyComponent: React.FC = () => {
    const theme = useTheme();

    return (
        <Box sx={{ bgcolor: 'background.default' }}>
            <Canvas backgroundColor={theme.palette.background.default} />
        </Box>
    );
};
```

**❌ WRONG - Hardcoded colors**:
```typescript
// DON'T DO THIS - breaks dark/light mode support
<Box sx={{ bgcolor: '#1F2937' }}>
    <Canvas backgroundColor="#F9FAFB" />
</Box>
```

#### Theme-Aware Styled Components

```typescript
import { styled } from '@mui/material/styles';

// ✅ Correct: Theme-aware component
const AuthCard = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
}));
```

#### Exception: Intentional Fixed Colors

Hardcoded colors are acceptable ONLY when:
1. **Hero sections** with branded gradient backgrounds
2. **Brand identity elements** that must remain consistent
3. **Tactical map backgrounds** with specific image requirements

**Document all exceptions**:
```typescript
// EXCEPTION: White text on gradient hero - intentional for brand consistency
const HeroTitle = styled(Typography)({
    color: '#FFFFFF',  // Intentional: Always white on gradient background
});
```

#### Required Testing

Every new UI component MUST be tested in:
- [ ] Light mode
- [ ] Dark mode
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text)

### Component Organization

**React Components**:
```
src/components/
├── auth/              # Authentication forms
├── error/             # Error handling UI
├── layout/            # Layout containers
├── scene/             # Scene editor components
└── theme/             # Theme configuration
    ├── themeColors.ts     # Centralized color palette
    └── VTTThemeProvider.tsx  # Theme implementation
```

### State Management

**Redux Toolkit** for global state:
```typescript
// Slice definition with typed hooks
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: { /* ... */ },
});

// Use typed hooks
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.auth.user);
```

**RTK Query** for API data:
```typescript
// API slice with auto-generated hooks
export const gameApi = createApi({
    reducerPath: 'gameApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getSession: builder.query<GameSession, string>({ /* ... */ }),
    }),
});

// Use auto-generated hooks
const { data, error, isLoading } = useGetSessionQuery(sessionId);
```

## General Principles

### Code Consistency

1. **Follow established patterns**: Analyze similar existing code before implementing new features
2. **Use .editorconfig**: All formatting rules are enforced automatically
3. **Leverage modern language features**: Primary constructors, collection expressions, pattern matching
4. **Prefer explicit over implicit**: Clear intent beats clever brevity

### Performance Considerations

1. **Async all the way**: All I/O operations must be asynchronous
2. **Use streaming for large data**: Avoid loading entire datasets into memory
3. **Implement cancellation**: All async methods accept `CancellationToken`
4. **Optimize queries**: Use projection and filtering at the database level

### Security Standards

1. **Validate all inputs**: Use validation attributes and manual validation for complex rules
2. **Sanitize user data**: Never trust client input
3. **Use parameterized queries**: Entity Framework prevents SQL injection by default
4. **Implement proper authentication**: ASP.NET Core Identity with JWT tokens
5. **Apply authorization**: Verify user permissions before executing operations

### Maintainability

1. **Single Responsibility Principle**: Classes and methods should do one thing well
2. **Dependency Inversion**: Depend on abstractions (interfaces), not concrete implementations
3. **Keep methods small**: Aim for 20 lines or fewer per method
4. **Avoid deep nesting**: Maximum 3 levels of indentation
5. **Use meaningful names**: Variables, methods, and classes should be self-documenting

## Code Quality Requirements

### Required Quality Gates

**C# Code**:
- Zero compiler warnings
- All .editorconfig rules followed (warning level or higher)
- Unit test coverage ≥ 80% for services and business logic
- FluentAssertions for readable test assertions

**TypeScript Code**:
- Zero TypeScript errors in strict mode
- Zero ESLint warnings
- Component test coverage ≥ 70%
- Vitest snapshots for complex UI components

**All Code**:
- No hardcoded secrets or configuration
- No commented-out code in commits
- No TODO comments without GitHub issues
- No magic numbers (use named constants)

### Code Review Checklist

Before submitting a pull request, verify:

**All Code**:
- [ ] All tests pass locally
- [ ] Code follows language-specific style guide
- [ ] No new compiler/linter warnings introduced
- [ ] Public APIs have XML documentation (C#) or JSDoc (TypeScript)
- [ ] Complex logic has explanatory comments
- [ ] Error handling is appropriate and consistent
- [ ] Security considerations addressed
- [ ] Performance implications evaluated
- [ ] Database migrations included (if schema changes)
- [ ] Breaking changes documented

**UI Components** (additional requirements):
- [ ] Component supports both dark and light modes
- [ ] Uses `theme.palette.*` instead of hardcoded hex colors
- [ ] Text contrast meets WCAG AA standards (4.5:1)
- [ ] Manually tested in both light and dark modes
- [ ] Any hardcoded colors are documented with EXCEPTION comment

## Documentation Standards

### Code Documentation

**C# XML Documentation**:
```csharp
/// <summary>
/// Creates a new game session for the specified user.
/// </summary>
/// <param name="userId">The ID of the user creating the session.</param>
/// <param name="data">The session creation data.</param>
/// <param name="ct">Cancellation token.</param>
/// <returns>
/// A result containing the created session or error information.
/// </returns>
public async Task<TypedResult<HttpStatusCode, GameSession>> CreateAsync(
    Guid userId, CreateGameSessionData data, CancellationToken ct = default);
```

**TypeScript JSDoc**:
```typescript
/**
 * Custom hook for managing game session state
 * @returns Session data, loading state, and mutation functions
 */
export const useGameSession = (sessionId: string) => {
    // Implementation
};
```

### Architecture Documentation

- **ADR (Architecture Decision Records)**: Document significant architectural decisions
- **API Documentation**: OpenAPI/Swagger for backend APIs
- **Component Stories**: Storybook for reusable React components (future)
- **Runbooks**: Deployment and operational procedures

### Inline Comments

**When to comment**:
- Complex algorithms or business rules
- Non-obvious performance optimizations
- Workarounds for external library issues
- Regex patterns and their purpose

**When NOT to comment**:
- Obvious code that explains itself
- Redundant descriptions of what code does
- Version history (use git instead)
- Commented-out code (delete it)

## Continuous Improvement

These standards are living documents. As the project evolves:

1. Propose changes through pull requests
2. Discuss significant pattern changes in team reviews
3. Update guides when new patterns emerge from the codebase
4. Extract reusable patterns into shared libraries

---

**Evidence-Based Confidence**: ★★★★★ (extracted from 100+ source files, .editorconfig, and tsconfig.json)

**Last Updated**: 2025-10-03 (extracted from VTTTools codebase analysis)

**Version**: 1.0
