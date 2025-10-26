# TypeScript/React Style Guide for VTTTools

This guide defines the TypeScript and React coding standards for the VTTTools WebClientApp project, extracted from the existing codebase, tsconfig.json strict mode settings, and component patterns.

## Related Guides

- **[Theme Guide](./THEME_GUIDE.md)** - Dark/Light mode theming requirements (REQUIRED for all UI components)
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing standards and patterns

## Table of Contents

- [Quick Reference](#quick-reference)
- [File Organization](#file-organization)
- [Formatting Rules](#formatting-rules)
- [Naming Conventions](#naming-conventions)
- [TypeScript Features](#typescript-features)
- [React Patterns](#react-patterns)
- [State Management](#state-management)
- [Best Practices](#best-practices)
- [Code Review Checklist](#code-review-checklist)

## Quick Reference

| Rule | Standard | Example |
|------|----------|---------|
| **Indentation** | 4 spaces | `if (condition) {` |
| **Quotes** | Single quotes | `import { Component } from 'react';` |
| **Semicolons** | Required | `const value = 42;` |
| **Component Type** | Function components | `export const LoginForm: React.FC = () => {}` |
| **Props Interface** | Props suffix | `interface LoginFormProps {}` |
| **Hooks** | Custom hooks | `export const useAuth = () => {}` |
| **File Extensions** | .tsx for components | `LoginForm.tsx`, `useAuth.ts` |
| **Path Aliases** | Use configured aliases | `import { Button } from '@components/ui';` |
| **State** | Redux Toolkit | `const dispatch = useAppDispatch();` |
| **Strict Mode** | Full TypeScript strict | 10 strict flags enabled |

## File Organization

### Project Structure

```
Source/WebClientApp/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── error/         # Error handling components
│   │   ├── layout/        # Layout components
│   │   └── theme/         # Theme components
│   ├── pages/             # Page-level components
│   │   ├── auth/          # Authentication pages
│   │   └── LandingPage.tsx
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services (RTK Query)
│   ├── store/             # Redux store and slices
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Application entry point
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

### Import Organization

```typescript
// 1. React and external libraries (alphabetically)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// 2. Path alias imports (by category)
import { useAuth } from '@/hooks/useAuth';
import { LoginButton } from '@components/auth';
import { ErrorBoundary } from '@components/error';
import { AuthService } from '@services/authService';
import { User } from '@types/user';
import { validateEmail } from '@utils/validation';

// 3. Relative imports (if needed)
import { localHelper } from './helpers';
```

### File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`, `ErrorBoundary.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`, `useGameSession.ts`)
- Utilities: `camelCase.ts` (e.g., `validation.ts`, `errorHandling.ts`)
- Types: `camelCase.ts` (e.g., `user.ts`, `gameSession.ts`)
- Tests: `{Name}.test.tsx` (e.g., `LoginForm.test.tsx`)

### Path Aliases (Configured in tsconfig.json)

```typescript
// ✅ Use path aliases for cleaner imports
import { Button } from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';
import { loginAsync } from '@store/authSlice';
import { User } from '@types/user';

// ❌ Avoid relative paths for shared code
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
```

**Available aliases**:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@hooks/*` → `src/hooks/*`
- `@services/*` → `src/services/*`
- `@store/*` → `src/store/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`

## Formatting Rules

### Indentation

```typescript
// ✅ Correct: 4-space indentation
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateEmail(email)) {
            onSuccess(email);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
        </form>
    );
};

// ❌ Incorrect: 2-space indentation
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  // ...
};
```

### Quotes and Semicolons

```typescript
// ✅ Correct: Single quotes, semicolons required
import React from 'react';
import { Button } from '@mui/material';

const message = 'Hello, World!';
const count = 42;

// ❌ Incorrect: Double quotes or missing semicolons
import React from "react"  // Missing semicolon, double quotes
const message = "Hello"    // Double quotes, missing semicolon
```

### Line Length and Breaking

```typescript
// ✅ Correct: Break long lines appropriately
export const ComplexComponent: React.FC<ComplexComponentProps> = ({
    userId,
    sessionId,
    onSuccess,
    onError,
}) => {
    const { data, error, isLoading } = useGetGameSessionQuery({
        userId,
        sessionId,
    });

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {/* Component content */}
        </Box>
    );
};
```

## Naming Conventions

### Casing Standards

| Element | Casing | Example |
|---------|--------|---------|
| **Component** | PascalCase | `LoginForm`, `ErrorBoundary` |
| **Interface** | PascalCase | `User`, `GameSession` |
| **Props Interface** | PascalCase + Props | `LoginFormProps`, `ButtonProps` |
| **Function** | camelCase | `validateEmail()`, `handleSubmit()` |
| **Custom Hook** | use + PascalCase | `useAuth()`, `useGameSession()` |
| **Variable** | camelCase | `email`, `isLoading`, `userCount` |
| **Constant** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| **Type** | PascalCase | `User`, `ApiResponse<T>` |
| **Enum** | PascalCase | `UserRole`, `GameSessionStatus` |

### Specific Patterns

**Component Props**:
```typescript
// ✅ Correct: Interface with Props suffix
interface LoginFormProps {
    onSuccess: (email: string) => void;
    onError?: (error: string) => void;
    initialEmail?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    onError,
    initialEmail = '',
}) => {
    // Implementation
};

// ❌ Incorrect: Generic interface name
interface LoginFormProperties { }  // Too verbose
interface ILoginForm { }           // Don't use I prefix
```

**Custom Hooks**:
```typescript
// ✅ Correct: use prefix, camelCase
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector(state => state.auth);

    const login = async (email: string, password: string) => {
        await dispatch(loginAsync({ email, password })).unwrap();
    };

    return { user, isLoading, login };
};

// ❌ Incorrect: Missing use prefix
export const auth = () => { };         // Not a hook name
export const getAuth = () => { };      // Sounds like a getter
```

**Event Handlers**:
```typescript
// ✅ Correct: handle prefix for event handlers
const handleSubmit = (e: React.FormEvent) => { };
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => { };
const handleButtonClick = () => { };

// ✅ Correct: on prefix for prop callbacks
interface FormProps {
    onSubmit: (data: FormData) => void;
    onChange?: (value: string) => void;
}
```

**Boolean Variables**:
```typescript
// ✅ Correct: is/has/can prefix
const isLoading = true;
const hasError = false;
const canSubmit = email.length > 0;

// ❌ Incorrect: Ambiguous naming
const loading = true;      // Not obviously boolean
const error = false;       // Could be error object
```

## TypeScript Features

### Strict Mode (MANDATORY - All Flags Enabled)

The tsconfig.json enables **10 strict type-checking flags**:

```json
{
  "compilerOptions": {
    "strict": true,                              // Master strict flag
    "noImplicitAny": true,                       // No implicit 'any' types
    "strictNullChecks": true,                    // null/undefined handling
    "strictFunctionTypes": true,                 // Function type checking
    "noImplicitReturns": true,                   // All code paths return
    "noFallthroughCasesInSwitch": true,          // No fallthrough cases
    "noUncheckedIndexedAccess": true,            // Array access returns T | undefined
    "exactOptionalPropertyTypes": true,          // Optional != undefined
    "noUnusedLocals": true,                      // No unused variables
    "noUnusedParameters": true                   // No unused parameters
  }
}
```

### Type Annotations

```typescript
// ✅ Correct: Explicit types for function parameters and return values
export const validateEmail = (email: string): boolean => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
};

export const fetchUser = async (userId: string): Promise<User | null> => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) return null;
    return response.json();
};

// ✅ Correct: Type inference for simple cases
const count = 42;                    // Inferred as number
const message = 'Hello';             // Inferred as string
const items = [1, 2, 3];             // Inferred as number[]

// ❌ Incorrect: Implicit any (strict mode violation)
export const processData = (data) => {  // Error: Parameter 'data' has implicit 'any'
    return data.value;
};
```

### Interfaces vs Types

```typescript
// ✅ Prefer interfaces for object shapes (can be extended)
interface User {
    id: string;
    email: string;
    name: string;
}

interface AdminUser extends User {
    permissions: string[];
}

// ✅ Use types for unions, intersections, and complex types
type Result<T> = Success<T> | Failure;
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ReadonlyUser = Readonly<User>;

// ✅ Use types for mapped types
type Optional<T> = {
    [P in keyof T]?: T[P];
};
```

### Null/Undefined Handling (strictNullChecks)

```typescript
// ✅ Correct: Explicit null/undefined handling
const user: User | null = await fetchUser(userId);

if (user !== null) {
    console.log(user.name);  // Safe: TypeScript knows user is not null
}

// ✅ Correct: Optional chaining
const userName = user?.name ?? 'Anonymous';
const playerCount = session?.players?.length ?? 0;

// ✅ Correct: Nullish coalescing
const title = session.title ?? 'Untitled Session';
const timeout = config.timeout ?? DEFAULT_TIMEOUT;

// ❌ Incorrect: Non-null assertion (avoid unless absolutely certain)
const userName = user!.name;  // Dangerous: runtime error if user is null
```

### Array Access (noUncheckedIndexedAccess)

```typescript
// ✅ Correct: Handle potentially undefined array access
const firstPlayer = players[0];  // Type: Player | undefined

if (firstPlayer !== undefined) {
    console.log(firstPlayer.name);
}

// Or use optional chaining
console.log(players[0]?.name ?? 'No player');

// ❌ Incorrect: Assume array access is defined
const firstName = players[0].name;  // Error: Object is possibly 'undefined'
```

### Generics

```typescript
// ✅ Correct: Generic functions and components
export const createArray = <T,>(length: number, value: T): T[] => {
    return Array(length).fill(value);
};

interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

export const List = <T,>({ items, renderItem }: ListProps<T>) => {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{renderItem(item)}</li>
            ))}
        </ul>
    );
};

// Usage
<List<User> items={users} renderItem={(user) => <span>{user.name}</span>} />
```

### Utility Types

```typescript
// ✅ Use built-in utility types
type PartialUser = Partial<User>;              // All properties optional
type RequiredUser = Required<User>;            // All properties required
type ReadonlyUser = Readonly<User>;            // All properties readonly
type UserKeys = keyof User;                    // 'id' | 'email' | 'name'
type UserEmail = Pick<User, 'email'>;          // { email: string }
type UserWithoutId = Omit<User, 'id'>;         // User without id property

// ✅ Create custom utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
```

## React Patterns

### Function Components (MANDATORY)

```typescript
// ✅ Correct: Function component with TypeScript
interface LoginFormProps {
    onSuccess: (email: string) => void;
    initialEmail?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    initialEmail = '',
}) => {
    const [email, setEmail] = useState(initialEmail);

    return (
        <form>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </form>
    );
};

// ❌ Incorrect: Class components (outdated pattern)
class LoginForm extends React.Component<LoginFormProps> {
    // Don't use class components in new code
}
```

### Hooks Pattern

```typescript
// ✅ Correct: Use hooks for state and side effects
export const GameSessionPage: React.FC = () => {
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        }
    }, [user, navigate]);

    const { data, isLoading, error } = useGetGameSessionsQuery(user?.id);

    if (isLoading) return <Spinner />;
    if (error) return <ErrorDisplay error={error} />;

    return (
        <div>
            {data?.map((session) => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onSelect={setSelectedSession}
                />
            ))}
        </div>
    );
};
```

### Custom Hooks

```typescript
// ✅ Correct: Encapsulate reusable logic in custom hooks
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading, error } = useAppSelector((state) => state.auth);

    const login = async (email: string, password: string) => {
        try {
            await dispatch(loginAsync({ email, password })).unwrap();
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        }
    };

    const logout = () => {
        dispatch(logoutAsync());
    };

    return { user, isLoading, error, login, logout };
};

// Usage in component
const { user, login, logout } = useAuth();
```

### Component Composition

```typescript
// ✅ Correct: Compose components for reusability
interface CardProps {
    children: React.ReactNode;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, title }) => (
    <div className="card">
        {title && <h3>{title}</h3>}
        <div className="card-content">{children}</div>
    </div>
);

// Usage
<Card title="Game Session">
    <SessionDetails session={session} />
    <PlayerList players={session.players} />
</Card>
```

### Styled Components (MUI Pattern)

```typescript
// ✅ Correct: Use styled() from MUI for component styling
import { styled } from '@mui/material/styles';
import { Button, TextField } from '@mui/material';

const AuthCard = styled(Paper)(({ theme }) => ({
    maxWidth: '440px',
    margin: '0 auto',
    padding: '48px 40px',
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
}));

const AuthTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: theme.palette.background.default,

        '&:hover fieldset': {
            borderColor: theme.palette.primary.light,
        },
    },
}));

// Usage
export const LoginForm: React.FC = () => (
    <AuthCard>
        <AuthTextField label="Email" fullWidth />
    </AuthCard>
);
```

### Theme-Aware Components (REQUIRED)

**CRITICAL**: All UI components MUST support both dark and light modes. See [THEME_GUIDE.md](./THEME_GUIDE.md) for complete documentation.

```typescript
// ✅ Correct: Theme-aware component using useTheme hook
import { useTheme } from '@mui/material';

export const SceneCanvas: React.FC<SceneCanvasProps> = ({ children }) => {
    const theme = useTheme();

    return (
        <Box sx={{ bgcolor: 'background.default' }}>
            <Canvas backgroundColor={theme.palette.background.default}>
                {children}
            </Canvas>
        </Box>
    );
};

// ✅ Correct: Theme-aware styled component
const AuthCard = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,  // Adapts to theme
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,

    // Conditional styling based on theme mode
    boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 25px rgba(0, 0, 0, 0.3)'
        : '0 20px 25px rgba(17, 24, 39, 0.1)',
}));

// ❌ WRONG: Hardcoded colors that don't adapt to theme
const BrokenCard = styled(Paper)({
    backgroundColor: '#FFFFFF',  // Breaks in dark mode
    color: '#111827',            // Breaks in dark mode
});
```

#### Theme Color Guidelines

**DO** - Use theme palette:
```typescript
// Backgrounds
sx={{ bgcolor: 'background.default' }}    // Page background
sx={{ bgcolor: 'background.paper' }}      // Card/panel background

// Text
sx={{ color: 'text.primary' }}            // Main text
sx={{ color: 'text.secondary' }}          // Secondary text
sx={{ color: 'text.disabled' }}           // Disabled text

// Borders
sx={{ borderColor: 'divider' }}           // Dividers and borders

// Semantic colors
sx={{ color: 'primary.main' }}            // Primary brand color
sx={{ color: 'error.main' }}              // Error state
```

**DON'T** - Hardcode hex colors:
```typescript
// ❌ WRONG: Breaks theme switching
sx={{ bgcolor: '#1F2937' }}
sx={{ color: '#FFFFFF' }}
```

**EXCEPTION** - Document intentional fixed colors:
```typescript
// EXCEPTION: White text on branded gradient - intentional for hero section
const HeroTitle = styled(Typography)({
    color: '#FFFFFF',  // Always white on blue gradient background
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
});
```

#### Customizing Theme Colors

All theme colors are centralized in `src/components/theme/themeColors.ts`. To change colors across the entire application:

```typescript
// In themeColors.ts
export const semanticColors = {
    primary: {
        main: '#2563EB',  // Change this to modify primary brand color
        light: '#3B82F6',
        dark: '#1D4ED8',
    },
    // ... other colors
};
```

## State Management

### Redux Toolkit Pattern

```typescript
// ✅ Correct: Redux Toolkit slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};

export const loginAsync = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }) => {
        const response = await authService.login(email, password);
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? 'Login failed';
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

### RTK Query Pattern

```typescript
// ✅ Correct: RTK Query API service
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface GameSession {
    id: string;
    title: string;
    ownerId: string;
    players: Player[];
}

export const gameSessionApi = createApi({
    reducerPath: 'gameSessionApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['GameSession'],
    endpoints: (builder) => ({
        getGameSessions: builder.query<GameSession[], string>({
            query: (userId) => `/sessions?userId=${userId}`,
            providesTags: ['GameSession'],
        }),
        getGameSession: builder.query<GameSession, string>({
            query: (id) => `/sessions/${id}`,
            providesTags: (result, error, id) => [{ type: 'GameSession', id }],
        }),
        createGameSession: builder.mutation<GameSession, Partial<GameSession>>({
            query: (body) => ({
                url: '/sessions',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['GameSession'],
        }),
    }),
});

export const {
    useGetGameSessionsQuery,
    useGetGameSessionQuery,
    useCreateGameSessionMutation,
} = gameSessionApi;
```

### Hook Usage in Components

```typescript
// ✅ Correct: Use generated hooks from RTK Query
export const GameSessionList: React.FC = () => {
    const { user } = useAuth();
    const { data, isLoading, error } = useGetGameSessionsQuery(user?.id ?? '');
    const [createSession] = useCreateGameSessionMutation();

    const handleCreate = async () => {
        try {
            await createSession({ title: 'New Session' }).unwrap();
        } catch (err) {
            console.error('Failed to create session:', err);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading sessions</div>;

    return (
        <div>
            <button onClick={handleCreate}>Create Session</button>
            {data?.map((session) => (
                <div key={session.id}>{session.title}</div>
            ))}
        </div>
    );
};
```

## ⚠️ Code Comments Policy (CRITICAL)

**Comments are a LAST RESORT.** Write self-documenting code.

**Before Adding a Comment, Try:**
1. **Better naming:** `calculateTotalWithTax()` not `calc()`
2. **Extract method:** Complex condition → `isEligibleForPromotion(user)`
3. **Simplify structure:** Early returns, guard clauses
4. **ONLY THEN** comment if truly needed

**DELETE These Comments Immediately:**
- ❌ Obvious: `// Render the button` above JSX
- ❌ Redundant: `// Map over items` above `.map()`
- ❌ Commented-out code
- ❌ Outdated: Comments not matching code
- ❌ AI placeholders: `// TODO:`, `// Implementation here`

**GOOD Comments (Rare):**
```typescript
// WCAG: 4.5:1 contrast ratio required for normal text
const minContrast = 4.5;

// Performance: Debounce prevents excessive API calls during typing
const debouncedSearch = useDebounce(searchTerm, 300);
```

**BAD Comments:**
```typescript
// ❌ Set loading state
setLoading(true);

// ❌ Check if user is authenticated
if (isAuthenticated) { }

// ❌ Return JSX
return <div>...</div>;
```

**This Rule Applies To ALL Code** - delete useless comments from any source.

## Best Practices

### Error Handling

```typescript
// ✅ Correct: Type-safe error handling
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        await login(email, password);
        navigate('/dashboard');
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred');
        }
    }
};

// ✅ Correct: Error boundaries for React errors
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}
```

### Performance Optimization

```typescript
// ✅ Correct: Memoization for expensive computations
import { useMemo, useCallback } from 'react';

export const PlayerList: React.FC<{ players: Player[] }> = ({ players }) => {
    // Memoize expensive calculations
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => a.name.localeCompare(b.name));
    }, [players]);

    // Memoize callbacks passed to child components
    const handlePlayerClick = useCallback((playerId: string) => {
        console.log('Player clicked:', playerId);
        // callback implementation
    }, []);

    return (
        <ul>
            {sortedPlayers.map((player) => (
                <PlayerCard
                    key={player.id}
                    player={player}
                    onClick={handlePlayerClick}
                />
            ))}
        </ul>
    );
};

// ✅ Correct: React.memo for expensive components
export const PlayerCard = React.memo<PlayerCardProps>(({ player, onClick }) => {
    return (
        <div onClick={() => onClick(player.id)}>
            <h3>{player.name}</h3>
            <p>{player.role}</p>
        </div>
    );
});
```

### Semantic IDs for Testability & Accessibility (MANDATORY)

**CRITICAL**: All interactive elements, sections, and testable components MUST have semantic `id` attributes.

**Why Semantic IDs:**
- ✅ **Stable selectors** - Don't break with text changes or i18n
- ✅ **Accessibility** - Help screen readers navigate
- ✅ **Debugging** - Easy to locate in DevTools
- ✅ **Refactor-safe** - Survive code restructuring
- ✅ **Better than data-testid** - Serve production AND testing

**ID Naming Convention:**
```typescript
// Buttons: #btn-{action}-{context}
<Button id="btn-save">Save</Button>
<Button id="btn-cancel">Cancel</Button>
<Button id="btn-header-login">Login</Button>
<Button id="btn-browse-assets">Browse Assets</Button>

// Navigation: #nav-{destination}
<Button id="nav-assets" onClick={() => navigate('/assets')}>Assets</Button>
<Button id="nav-scene-editor">Scene Editor</Button>

// Sections: #{name}-section
<Box id="hero-section">...</Box>
<Box id="dashboard-section">...</Box>

// Cards/Tiles: #card-{name}
<Card id="card-scene-editor">...</Card>
<Card id="card-asset-library">...</Card>

// Headings: #{type}-{context}
<Typography id="hero-title" variant="h1">...</Typography>
<Typography id="dashboard-greeting" variant="h2">...</Typography>

// Form inputs: #input-{field}
<TextField id="input-email" name="email" />
<TextField id="input-password" name="password" />

// Menus: #{context}-menu
<Menu id="user-menu">...</Menu>
<MenuItem id="menu-profile">Profile</MenuItem>

// Footer links: #footer-link-{page}
<Link id="footer-link-about" href="/about">About</Link>
```

**Elements That MUST Have Semantic IDs:**

1. **Interactive Controls**
   - Buttons (all types)
   - Links/anchors (`<a>` tags)
   - Icon buttons

2. **Form Elements**
   - Text inputs, textareas
   - Dropdowns/selects
   - Checkboxes, radio buttons
   - Form labels (`<label>`)
   - Form containers (`<form>`)

3. **Major Page Sections**
   - Header/AppBar
   - Main content areas
   - Footer
   - Sidebars/panels
   - Modal containers

4. **Component Widgets**
   - Cards, tiles
   - Panels, containers with semantic purpose
   - Tables (and actionable rows)
   - Dialog boxes, modals, drawers
   - Accordions (headers and content)

5. **Navigation Elements**
   - Menu containers and menu items
   - Breadcrumbs
   - Pagination controls
   - Tab controls and tab panels

6. **Feedback Elements**
   - Alerts, notifications, toasts
   - Status badges, chips (if independently meaningful)
   - Error messages
   - Loading indicators

7. **Content Headings**
   - h1-h6 when serving as section landmarks
   - Page titles
   - Section headers

**Optional IDs (Use Judgment):**
- Complex component internals (if parent ID + child selector works)
- List items in dynamic lists (if parent + index works)
- Decorative icons (non-interactive)
- Spacing/layout containers

**SKIP (Don't Add IDs):**
- Purely decorative elements (spacers, dividers)
- Layout-only containers (Box, Grid without semantic purpose)
- Anonymous wrapper divs

**Complex Components Pattern:**

```typescript
// ✅ GOOD - Minimal IDs when children are unique
<Card id="card-user-profile">
  <h6>User Profile</h6>           // ← Only one h6 in card
  <p>Email: ...</p>                // ← Only one p tag
  <Button>Edit</Button>            // ← Only one button
</Card>
// Selector: '#card-user-profile button'

// ✅ BETTER - Full IDs when elements tested independently
<Card id="card-user-profile">
  <Typography id="title-user-profile">User Profile</Typography>
  <Typography id="email-user-profile">Email: ...</Typography>
  <Button id="btn-edit-profile">Edit</Button>
</Card>
// Selector: '#btn-edit-profile' ← More precise, reusable
```

**Rule:** Add full IDs when:
- Element tested in multiple scenarios
- Multiple similar elements exist
- Element might appear in different contexts

**Example - Complete Landing Page:**
```typescript
export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <Box id="dashboard-section">
      <Typography id="dashboard-greeting" variant="h2">
        Welcome back!
      </Typography>
      <Card id="card-scene-editor">
        <Typography id="title-scene-editor" variant="h6">Scene Editor</Typography>
        <Button id="btn-open-editor">Open Editor</Button>
      </Card>
    </Box>
  ) : (
    <Box id="hero-section">
      <Typography id="hero-title" variant="h1">Craft Legendary Adventures</Typography>
      <Button id="cta-start-creating">Start Creating</Button>
      <Button id="cta-explore-features">Explore Features</Button>
    </Box>
  );
};
```

**Anti-Patterns:**
```typescript
// ❌ WRONG - data-testid pollutes production
<Button data-testid="login-button">Login</Button>

// ❌ WRONG - No ID, relies on fragile text selector
<Button>Login</Button>  // Test breaks if text changes to "Sign In"

// ❌ WRONG - Generic IDs that aren't unique
<Button id="button1">Save</Button>
<Button id="button2">Cancel</Button>

// ❌ WRONG - Ambiguous label reference
<label>Email</label>  // Which email field? Login? Register? Profile?
// Correct: <label id="label-login-email" for="input-login-email">Email</label>
```

**BAD Ways to Locate Elements (Avoid in Tests):**
- ❌ **By state** - `button:disabled` (which button?)
- ❌ **By text** - `button:has-text("Save")` (text changes, i18n)
- ❌ **By CSS class** - `[class*="MuiButton"]` (implementation detail)
- ❌ **By position** - `.first()`, `:nth-child(2)` (order changes)
- ❌ **By DOM hierarchy** - `div > div > button` (structure changes)
- ❌ **By computed style** - Color/font checks (theme-dependent)

**GOOD Ways (Prefer in Order):**
1. ✅ **Semantic ID** - `#btn-save` (most stable)
2. ✅ **ID + child selector** - `#card-user button` (when parent has ID)
3. ✅ **Role + unique name** - `getByRole('button', { name: 'Save Changes' })` (when ID not available)
4. ✅ **Label for inputs** - `getByLabelText('Email')` (semantic relationship)

### Accessibility

```typescript
// ✅ Correct: Semantic HTML, ARIA attributes, AND semantic IDs
export const LoginForm: React.FC = () => (
    <form id="form-login" onSubmit={handleSubmit} aria-label="Login form">
        <TextField
            id="input-email"
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            aria-required="true"
            aria-describedby="email-helper"
        />
        <span id="email-helper">Enter your registered email address</span>

        <Button id="btn-submit-login" type="submit" aria-label="Sign in to your account">
            Sign In
        </Button>
    </form>
);
```

### Code Splitting

```typescript
// ✅ Correct: Lazy load routes and heavy components
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const GameSessionPage = lazy(() => import('@pages/GameSessionPage'));

export const App: React.FC = () => (
    <Suspense fallback={<LoadingSpinner />}>
        <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sessions/:id" element={<GameSessionPage />} />
        </Routes>
    </Suspense>
);
```

## Code Review Checklist

Before submitting TypeScript/React code for review, verify:

### TypeScript Standards
- [ ] All strict mode flags respected (no type errors)
- [ ] No implicit `any` types
- [ ] Proper null/undefined handling with optional chaining
- [ ] Array access checked for undefined (noUncheckedIndexedAccess)
- [ ] Function return types explicitly typed
- [ ] Interfaces used for object shapes, types for unions
- [ ] Generic types used appropriately

### React Patterns
- [ ] Function components only (no class components)
- [ ] Hooks used correctly (not in conditionals/loops)
- [ ] Custom hooks follow `use` naming convention
- [ ] Props interfaces have `Props` suffix
- [ ] Event handlers use `handle` prefix
- [ ] Proper key props on list items

### Code Quality
- [ ] 4-space indentation throughout
- [ ] Single quotes for strings
- [ ] Semicolons on all statements
- [ ] Path aliases used instead of relative imports
- [ ] No unused variables or imports
- [ ] No console.logs in production code
- [ ] Error boundaries wrap component trees
- [ ] **CRITICAL: No unnecessary comments** - code is self-documenting
- [ ] **CRITICAL: Useless comments deleted** - removed obvious/redundant/outdated comments

### State Management
- [ ] Redux Toolkit slices properly structured
- [ ] RTK Query used for API calls
- [ ] No direct state mutation (immutable updates)
- [ ] Proper loading/error state handling

### Performance
- [ ] useMemo for expensive computations
- [ ] useCallback for stable callbacks
- [ ] React.memo for expensive components
- [ ] Code splitting for large components/routes

### Semantic IDs (MANDATORY)
- [ ] All interactive elements have semantic `id` attributes
- [ ] ID naming convention followed (btn-, nav-, card-, etc.)
- [ ] No data-testid attributes (use semantic IDs instead)
- [ ] IDs are unique across the page
- [ ] Context-specific suffixes used (e.g., btn-header-login vs btn-footer-login)

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA attributes where needed (aria-label, aria-describedby)
- [ ] Keyboard navigation supported
- [ ] Form labels properly associated with inputs
- [ ] All interactive elements have semantic IDs

### Theme Support (REQUIRED)
- [ ] Component supports both dark and light modes
- [ ] Uses `theme.palette.*` instead of hardcoded hex colors
- [ ] Manually tested in both light and dark modes
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Any hardcoded colors documented with EXCEPTION comment
- [ ] Styled components use `({ theme }) =>` pattern

### Testing
- [ ] Component tests written with Testing Library
- [ ] User-centric queries (getByRole, getByLabelText)
- [ ] Integration tests for critical flows
- [ ] Snapshot tests for complex UI

---

**Evidence-Based Confidence**: ★★★★★ (extracted from tsconfig.json, 60+ TypeScript/React files, verified patterns)

**Enforcement**: Automated via tsconfig.json strict mode (10 flags) and ESLint

**Last Updated**: 2025-10-03

**Version**: 1.0
