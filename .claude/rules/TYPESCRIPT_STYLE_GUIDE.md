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

## Agentic Compatibility (CRITICAL)
File structure impacts AI agent effectiveness. Optimize for these principles:

| Principle | Description | Why It Matters |
|-----------|-------------|----------------|
| **Cognitive Load** | Can the file structure be held in working memory? | Agents need to understand relationships between sections |
| **Change Safety** | Can edits be made without unintended side effects? | Single-responsibility sections enable surgical changes |
| **Navigation Speed** | Can relevant sections be found quickly? | Consistent section ordering enables fast lookup |
| **Dependency Clarity** | Are dependencies between sections obvious? | Downward-only flow prevents circular reference bugs |

**When to Extract:**
Extract when a file violates these principles, not based on arbitrary line counts:
1. **Multiple responsibilities** → Extract to separate hooks/handlers
2. **Tangled dependencies** → Split by concern to clarify flow
3. **Difficult navigation** → Add section headers or extract sub-components
4. **Risky edits** → Isolate volatile logic into dedicated files

**Extraction Patterns:**
- Handlers → `{Feature}/handlers/{entity}Handlers.ts`
- Hooks → `{Feature}/hooks/use{Concern}.ts`
- Sub-components → `{Feature}/components/{Name}.tsx`
- Types → `{Feature}/types.ts`

## Component File Organization (REQUIRED)
Files MUST follow this section order with blank lines between sections:

```typescript
// 1. IMPORTS (grouped: external → aliases → relative)
import React, { useCallback, useMemo, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { useGetDataQuery } from '@/services/api';
import { useCustomHook } from '@/hooks';
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
    // ═══════════════════════════════════════════════════════════════════════════
    // 4.1 ROUTING
    // Router hooks: useNavigate, useParams, useLocation, useSearchParams
    // ═══════════════════════════════════════════════════════════════════════════
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.2 THEME
    // Theme/UI hooks: useTheme, useMediaQuery
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.3 QUERIES & MUTATIONS
    // RTK Query hooks for data fetching and mutations
    // ═══════════════════════════════════════════════════════════════════════════
    const { data, isLoading, refetch } = useGetDataQuery(id);
    const [updateData] = useUpdateDataMutation();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.4 QUERY ADAPTERS
    // Wrappers that transform query results for hook consumption
    // ═══════════════════════════════════════════════════════════════════════════
    const wrappedRefetch = useMemo(() => createRefetchWrapper(refetch), [refetch]);
    const mutations = useMemo(() => ({ update: updateData }), [updateData]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.5 CONTEXT HOOKS
    // App-level context: useUndoRedoContext, useClipboard, useConnectionStatus
    // ═══════════════════════════════════════════════════════════════════════════
    const { undo, redo } = useUndoRedoContext();
    const { isOnline } = useConnectionStatus();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.6 TRANSACTIONS
    // Transaction management hooks
    // ═══════════════════════════════════════════════════════════════════════════
    const transaction = useTransaction();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.7 STATE
    // Local component state: useState, useReducer
    // ═══════════════════════════════════════════════════════════════════════════
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Data | null>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.8 REFS
    // References: useRef
    // ═══════════════════════════════════════════════════════════════════════════
    const inputRef = useRef<HTMLInputElement>(null);
    const dataRef = useRef<Data | null>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.9 DOMAIN HOOKS
    // Feature-specific composed hooks that encapsulate business logic
    // Domain hooks may depend on state/refs declared above
    // ═══════════════════════════════════════════════════════════════════════════
    const featureHandlers = useFeatureHandlers({ id, data, setData, refetch: wrappedRefetch });
    const otherHandlers = useOtherHandlers({ mutations, inputRef });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.10 COMPOSED HANDLERS
    // Memoized factories that combine multiple domain hooks into cohesive bundles
    // ═══════════════════════════════════════════════════════════════════════════
    const combinedHandlers = useMemo(
        () => createCombinedHandlers({ featureHandlers, otherHandlers }),
        [featureHandlers, otherHandlers]
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.11 DERIVED STATE
    // Pure computed values from props/state: useMemo
    // ═══════════════════════════════════════════════════════════════════════════
    const isValid = useMemo(() => value.length <= MAX_LENGTH, [value]);
    const sortedItems = useMemo(() => [...items].sort(), [items]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.12 EFFECTS
    // Side effects: useEffect
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        // side effect
    }, [dependency]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.13 HANDLERS
    // Event handlers: useCallback (including callback refs)
    // ═══════════════════════════════════════════════════════════════════════════
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
        if (node) node.focus();
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.14 RENDER
    // JSX output
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Box>
            <input ref={inputCallbackRef} value={value} onChange={handleChange} />
        </Box>
    );
};

// 5. CHILD COMPONENTS (small, file-specific helpers - optional)
const HelperComponent: React.FC<{ label: string }> = ({ label }) => (
    <span>{label}</span>
);
```

**Section Summary (inside component):**
| # | Section | Contents |
|---|---------|----------|
| 4.1 | ROUTING | `useNavigate`, `useParams`, `useLocation`, `useSearchParams` |
| 4.2 | THEME | `useTheme`, `useMediaQuery` |
| 4.3 | QUERIES & MUTATIONS | RTK Query hooks (`useGetXQuery`, `useXMutation`) |
| 4.4 | QUERY ADAPTERS | Wrappers transforming query results (`wrappedRefetch`, `mutations`) |
| 4.5 | CONTEXT HOOKS | App context (`useUndoRedoContext`, `useClipboard`, `useConnectionStatus`) |
| 4.6 | TRANSACTIONS | Transaction hooks (`useWallTransaction`, `useRegionTransaction`) |
| 4.7 | STATE | `useState`, `useReducer` |
| 4.8 | REFS | `useRef` |
| 4.9 | DOMAIN HOOKS | Feature hooks that may depend on state/refs (`useWallHandlers`, `useAssetManagement`) |
| 4.10 | COMPOSED HANDLERS | Memoized factories combining domain hooks (`createStructureHandlers`) |
| 4.11 | DERIVED STATE | Pure computations (`useMemo` for filtering, sorting, transforming) |
| 4.12 | EFFECTS | `useEffect` |
| 4.13 | HANDLERS | `useCallback` (including callback refs) |
| 4.14 | RENDER | `return (...)` |

**Dependency Flow:**
```
ROUTING → THEME → QUERIES → QUERY ADAPTERS → CONTEXT → TRANSACTIONS
    → STATE → REFS → DOMAIN HOOKS → COMPOSED HANDLERS → DERIVED → EFFECTS → HANDLERS → RENDER
```

**Key Distinctions:**
- **QUERY ADAPTERS** (4.4): Transform API layer for hook consumption. Depend only on QUERIES.
- **STATE/REFS** (4.7-4.8): Declared early so DOMAIN HOOKS can use them as parameters.
- **DOMAIN HOOKS** (4.9): Feature hooks that encapsulate business logic. May depend on state/refs.
- **COMPOSED HANDLERS** (4.10): Combine multiple domain hooks into handler bundles.
- **DERIVED STATE** (4.11): Pure computations from props/state. No side effects.

**Notes:**
- Skip sections that don't apply to your component (simple components may only need STATE, HANDLERS, RENDER)
- Section comments with `═══` separators are recommended for complex components with many sections
- Dependencies flow downward - never reference a later section from an earlier one
- STATE and REFS must come before DOMAIN HOOKS if hooks need them as parameters

❌ **Anti-patterns:**
- Imports after component definition
- Helper functions before component
- Mixed hook types (not grouped by section)
- Handlers defined inside render
- Constants inside component (causes re-creation)
- Query adapters mixed with derived state
- Domain hooks before state they depend on

## Handler Extraction Pattern
When components have multiple handler concerns, extract to separate files:

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

// Component usage (in COMPOSED HANDLERS section):
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
│   ├── {Feature}Page.tsx        # Main component (follows 14-section model)
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
- [ ] Inside component (14 sections): Routing → Theme → Queries → Query Adapters → Context → Transactions → State → Refs → Domain Hooks → Composed Handlers → Derived → Effects → Handlers → Render
- [ ] No imports after helper functions
- [ ] No mixed hook types (grouped by section)

**Agentic Compatibility:**
- [ ] Single responsibility per file | Clear section boundaries
- [ ] Dependencies flow downward | No circular references
- [ ] Extractable concerns isolated | Navigation is fast

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
