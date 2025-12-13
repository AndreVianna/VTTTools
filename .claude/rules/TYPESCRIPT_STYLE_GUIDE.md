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

## Structure
```
src/
├── components/{cat}/  ├── pages/  ├── hooks/  ├── services/  ├── store/  ├── types/  └── utils/
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

## Review
TS: Strict zero errors | No any | Null handled | Array access checked
React: Function components | Hooks rules | use prefix | Props suffix | handle prefix | Key props
Style: 4-space | Single quotes | Semicolons | Path aliases | No console.log
State: Redux slices | RTK Query | Immutable | Loading/error states
Performance: useMemo | useCallback | React.memo | Code splitting
IDs: Semantic on interactive | Convention | Unique
