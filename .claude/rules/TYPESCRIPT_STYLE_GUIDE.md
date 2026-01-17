# TypeScript/React Style

tsconfig strict (10 flags) + ESLint | Coverage ≥95%

## Rules
| Rule | Standard |
|------|----------|
| Indent | 4 spaces |
| Quotes | Single |
| Semicolons | Required |
| Components | Function (`React.FC`) |
| Props | `{Component}Props` |
| Hooks | `use{Name}` |
| Files | `.tsx` components, `.ts` utils |
| State | Redux Toolkit + RTK Query |

Strict: `strict` | `noImplicitAny` | `strictNullChecks` | `strictFunctionTypes` | `noImplicitReturns` | `noFallthroughCasesInSwitch` | `noUncheckedIndexedAccess` | `exactOptionalPropertyTypes` | `noUnusedLocals` | `noUnusedParameters`

## File Size Limits (CRITICAL for Agentic Coding)
Small, focused files reduce AI context consumption and enable faster, safer edits.

| File Type | Target | Max | Action if Exceeded |
|-----------|--------|-----|-------------------|
| Component | ≤300 | 500 | Extract handlers/hooks |
| Hook | ≤200 | 400 | Split by concern |
| Utility | ≤150 | 300 | Split by domain |
| Handler file | ≤200 | 300 | Group by entity |

**When files exceed limits:**
1. Extract handlers → `{Feature}/handlers/{entity}Handlers.ts`
2. Extract hooks → `{Feature}/hooks/use{Concern}.ts`
3. Extract sub-components → `{Feature}/components/{Name}.tsx`
4. Extract types → `{Feature}/types.ts`

## Component File Organization (REQUIRED)
Files MUST follow this section order with blank lines between sections:

```typescript
// 1. IMPORTS (grouped: external → aliases → relative)
import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { useAppDispatch } from '@/store';
import { localHelper } from './helpers';

// 2. TYPES (if not imported)
interface MyComponentProps {
    value: string;
    onChange: (value: string) => void;
}

// 3. CONSTANTS (static values, configs)
const MAX_LENGTH = 100;
const DEFAULT_OPTIONS = ['a', 'b', 'c'];

// 4. COMPONENT
export const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => {
    // 4.1 STATE (useState, useReducer, useContext - grouped together)
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    // 4.2 REFS (useRef - grouped together)
    const inputRef = useRef<HTMLInputElement>(null);

    // 4.3 DERIVED STATE (useMemo for computed values)
    const isValid = useMemo(() => value.length <= MAX_LENGTH, [value]);

    // 4.4 EFFECTS (useEffect - grouped together)
    useEffect(() => {
        // side effect
    }, [dependency]);

    // 4.5 HANDLERS (useCallback - grouped together, alphabetized)
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    const handleSubmit = useCallback(() => {
        // submit logic
    }, []);

    // 4.6 RENDER
    return (
        <Box>
            <input ref={inputRef} value={value} onChange={handleChange} />
        </Box>
    );
};

// 5. CHILD COMPONENTS (small, file-specific helpers - optional)
const HelperComponent: React.FC<{ label: string }> = ({ label }) => (
    <span>{label}</span>
);
```

❌ **Anti-patterns:**
- Imports after component definition
- Helper functions before component
- Mixed useState/useEffect/useCallback (not grouped)
- Handlers defined inside render
- Constants inside component (causes re-creation)

## Handler Extraction Pattern
For components >300 lines, extract handlers to separate files:

```typescript
// handlers/userHandlers.ts
import type { User } from '@/types';

export interface UserHandlerDeps {
    setUser: (user: User) => void;
    setError: (error: string | null) => void;
    onSuccess?: () => void;
}

export const createUserHandlers = (deps: UserHandlerDeps) => ({
    handleUserUpdate: async (userId: string, data: Partial<User>) => {
        try {
            const result = await updateUser(userId, data);
            deps.setUser(result);
            deps.onSuccess?.();
        } catch (err) {
            deps.setError(err instanceof Error ? err.message : 'Update failed');
        }
    },
    handleUserDelete: async (userId: string) => {
        // ...
    },
});

// Component usage:
const handlers = useMemo(
    () => createUserHandlers({ setUser, setError, onSuccess }),
    [setUser, setError, onSuccess]
);
```

## Naming
| Element | Casing |
|---------|--------|
| Component/Interface/Type/Enum | PascalCase |
| Props | `{Component}Props` |
| Hook | `use{Name}` |
| Function/Variable | camelCase |
| Constant | UPPER_SNAKE_CASE |
| Boolean | is/has/can prefix |
| Handler | handle prefix |
| Callback prop | on prefix |
Files: `PascalCase.tsx` | `use{Name}.ts` | `{Name}.test.tsx`

## Folder Structure
```
src/
├── components/{category}/
├── pages/{Feature}/
│   ├── {Feature}Page.tsx        # Main component (<500 lines)
│   ├── handlers/                 # Extracted handlers
│   │   ├── {entity}Handlers.ts
│   │   └── index.ts
│   ├── hooks/                    # Feature-specific hooks
│   │   └── use{Concern}.ts
│   ├── components/               # Sub-components
│   └── types.ts                  # Feature types
├── hooks/                        # Shared hooks
├── services/                     # API services
├── store/                        # Redux store
├── types/                        # Shared types
└── utils/                        # Shared utilities
```
Imports: React+external → Path aliases (@components/, @hooks/) → Relative

## TypeScript
```typescript
// Interface (extendable) vs Type (unions)
interface User { id: string; name: string; }
type Result<T> = Success<T> | Failure;

// Null handling
const name = user?.name ?? 'Anonymous';
// Array access (noUncheckedIndexedAccess)
const first = players[0]; // Player | undefined
if (first !== undefined) console.log(first.name);
```
❌ `user!.name` (non-null assertion)

## React
```typescript
interface LoginFormProps { onSuccess: (email: string) => void; initialEmail?: string; }
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    return <form><input value={email} onChange={(e) => setEmail(e.target.value)} /></form>;
};

// Hook
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector(s => s.auth);
    const login = async (email: string, pwd: string) => { await dispatch(loginAsync({ email, password: pwd })).unwrap(); };
    return { user, isLoading, login };
};
```

## State
```typescript
// Slice
const authSlice = createSlice({
    name: 'auth', initialState: { user: null, isLoading: false, error: null },
    reducers: { logout: (s) => { s.user = null; } },
    extraReducers: (b) => {
        b.addCase(loginAsync.pending, (s) => { s.isLoading = true; })
         .addCase(loginAsync.fulfilled, (s, a) => { s.user = a.payload; s.isLoading = false; });
    },
});

// RTK Query
export const sessionApi = createApi({
    reducerPath: 'sessionApi', baseQuery: fetchBaseQuery({ baseUrl: '/api' }), tagTypes: ['Session'],
    endpoints: (b) => ({
        getSessions: b.query<Session[], string>({ query: (userId) => `/sessions?userId=${userId}`, providesTags: ['Session'] }),
        createSession: b.mutation<Session, Partial<Session>>({ query: (body) => ({ url: '/sessions', method: 'POST', body }), invalidatesTags: ['Session'] }),
    }),
});
```

## Semantic IDs (REQUIRED)
All interactive elements MUST have `id` (NOT data-testid).
Convention: `#btn-{action}` | `#nav-{dest}` | `#{name}-section` | `#card-{name}` | `#input-{field}`
```typescript
<Box id="hero-section">
    <Typography id="hero-title">Craft Adventures</Typography>
    <Button id="cta-start-creating">Start</Button>
</Box>
```
❌ data-testid | ❌ No ID | ❌ Generic IDs (button1)

## Performance
```typescript
const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);
const handleClick = useCallback((id: string) => { /* ... */ }, []);
export const ExpensiveCard = React.memo<CardProps>(({ data }) => <div>{data.title}</div>);
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
```

## Error Handling
```typescript
try { await login(email, pwd); navigate('/dashboard'); }
catch (err) { setError(err instanceof Error ? err.message : 'Unexpected'); }
```

## Review Checklist
**File Organization:**
- [ ] Sections in order: Imports → Types → Constants → Component → Child Components
- [ ] Inside component: State → Refs → Derived → Effects → Handlers → Render
- [ ] No imports after helper functions
- [ ] No mixed useState/useEffect/useCallback

**File Size (Agentic):**
- [ ] Component ≤500 lines (target ≤300)
- [ ] Hook ≤400 lines (target ≤200)
- [ ] Handlers extracted if component >300 lines

**TypeScript:**
- [ ] Strict mode zero errors | No `any` | Null handled | Array access checked

**React:**
- [ ] Function components | Hooks rules | `use` prefix | `Props` suffix | `handle` prefix | Key props

**Style:**
- [ ] 4-space indent | Single quotes | Semicolons | Path aliases | No console.log

**State:**
- [ ] Redux slices | RTK Query | Immutable | Loading/error states

**Performance:**
- [ ] useMemo for expensive computations | useCallback for handlers | React.memo for pure components

**IDs:**
- [ ] Semantic IDs on interactive elements | Convention followed | Unique
