# Coding Standards

Coverage: ≥95% | Zero warnings | .editorconfig enforced

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
