# Coding Standards

Coverage: ≥95% | Zero warnings | .editorconfig enforced

## Git Safety (CRITICAL)
- **NEVER run `git checkout`, `git reset`, or `git restore` on files without first running `git diff <files>` to see ALL uncommitted changes**
- **Assume other work exists** - never assume you're the only one who modified a file
- **Surgical reverts only** - use Edit tool to revert specific changes, not blow away entire files
- **When in doubt, ASK** before any destructive git command

## Test Failures (CRITICAL)
- **NEVER modify production code to make tests pass** - fix the tests or test setup, not the source
- If tests fail due to test infrastructure limitations (e.g., In-Memory DB vs PostgreSQL), fix the test approach
- Tests should validate production code, not the other way around

## Principles
- **Consistency**: Existing patterns | Modern features (primary ctors, collection exprs, pattern matching)
- **Performance**: Async I/O | CancellationToken | DB-level filtering
- **Security**: Validate inputs | Parameterized queries | Verify permissions
- **Maintainability**: SRP | Abstractions | Methods ≤20 lines | Max 3 nesting

## Quality Gates
C#: Zero warnings | TS: Zero errors (strict) | All: No secrets | No commented code | No magic numbers

## Theme (CRITICAL)
All UI MUST support dark+light modes. Colors: `src/components/theme/themeColors.ts`
```typescript
sx={{ bgcolor: 'background.default' }}  // ✓
sx={{ bgcolor: '#1F2937' }}              // ✗ breaks theme
const AuthCard = styled(Paper)(({ theme }) => ({ backgroundColor: theme.palette.background.paper }));
```
Exceptions (document): Hero gradients | Brand identity | Map backgrounds

## Comments
Write self-documenting code. Comment ONLY: Complex algorithms | Non-obvious optimizations | Workarounds | Regex
DELETE: Obvious | Redundant | Commented-out | TODO without issue

## Review
Tests pass | Style guide | No warnings | Errors handled | Security addressed | Theme: dark+light, palette.*, WCAG AA
