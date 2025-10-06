# VTTTools Theme Guide

**Version**: 1.0.0
**Last Updated**: 2025-10-04
**Purpose**: Guidelines for implementing dark/light mode theme support across all UI components

---

## Overview

VTTTools implements a comprehensive dark/light mode theme system using Material-UI theming. **All UI components MUST support both dark and light modes** to provide users with flexible viewing options.

---

## Theme Architecture

### Theme Provider

**Location**: `Source/WebClientApp/src/components/theme/VTTThemeProvider.tsx`

The theme is managed centrally through Redux (`uiSlice`) and applied via Material-UI's `ThemeProvider`.

### Color Palette

#### Background Colors

| Context | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Default Background** | `#F9FAFB` (light gray) | `#1F2937` (dark gray) |
| **Paper/Cards** | `#FFFFFF` (white) | `#111827` (very dark) |
| **Canvas/Editor** | `#FFFFFF` (white) | `#1F2937` (dark gray) |

#### Text Colors

| Context | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Primary Text** | `#111827` (very dark) | `#F9FAFB` (light gray) |
| **Secondary Text** | `#4B5563` (medium gray) | `#D1D5DB` (light gray) |
| **Disabled Text** | `#9CA3AF` (gray) | `#6B7280` (medium gray) |

#### Semantic Colors

All semantic colors (primary, secondary, error, warning, info, success) are the same across both themes with proper contrast ratios.

---

## Customizing Theme Colors

### Centralized Color Configuration

**Location**: `Source/WebClientApp/src/components/theme/themeColors.ts`

All theme colors are centralized in a single file for easy customization. To change the theme colors across the entire application:

1. Open `themeColors.ts`
2. Modify the color values in the appropriate section
3. Save the file - changes will be applied automatically

### Color Configuration Structure

```typescript
// Semantic Colors (shared across light and dark modes)
export const semanticColors = {
  primary: {
    main: '#2563EB',      // Change this to modify primary brand color
    light: '#3B82F6',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  // ... other semantic colors
};

// Light Mode Colors
export const lightModeColors = {
  background: {
    default: '#F9FAFB',   // Light mode page background
    paper: '#FFFFFF',     // Light mode card/paper background
  },
  text: {
    primary: '#111827',   // Light mode primary text
    secondary: '#4B5563', // Light mode secondary text
    disabled: '#9CA3AF',
  },
  divider: '#E5E7EB',
};

// Dark Mode Colors
export const darkModeColors = {
  background: {
    default: '#1F2937',   // Dark mode page background
    paper: '#111827',     // Dark mode card/paper background
  },
  text: {
    primary: '#F9FAFB',   // Dark mode primary text
    secondary: '#D1D5DB', // Dark mode secondary text
    disabled: '#6B7280',
  },
  divider: '#374151',
};
```

### Customization Examples

#### Example 1: Change Primary Brand Color

To change the primary blue to a different color (e.g., green):

```typescript
// In themeColors.ts
export const semanticColors = {
  primary: {
    main: '#059669',      // Green
    light: '#10B981',     // Light green
    dark: '#047857',      // Dark green
    contrastText: '#FFFFFF',
  },
  // ... rest unchanged
};
```

#### Example 2: Adjust Dark Mode Background

To make dark mode darker or lighter:

```typescript
// In themeColors.ts
export const darkModeColors = {
  background: {
    default: '#0F172A',   // Darker background
    paper: '#0A0E1A',     // Darker paper
  },
  // ... rest unchanged
};
```

#### Example 3: Use Alternative Theme Presets

The `themeColors.ts` file includes example alternative themes:

```typescript
// Uncomment in themeColors.ts and modify getColorPalette() to use:
export const fantasyColors = {
  primary: {
    main: '#8B4513',      // Brown for fantasy theme
    light: '#A0522D',
    dark: '#654321',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#228B22',      // Forest green
    light: '#32CD32',
    dark: '#006400',
    contrastText: '#FFFFFF',
  },
};
```

### Color Consistency Rules

When customizing colors, ensure:
1. **Contrast Ratios**: Maintain WCAG AA compliance (4.5:1 for normal text)
2. **Semantic Meaning**: Keep error=red, success=green, warning=amber/orange
3. **Brand Alignment**: Primary/secondary colors should align with brand identity
4. **Mode Independence**: Don't use mode-specific colors in semantic colors

---

## Implementation Guidelines

### ✅ REQUIRED: Use Theme Colors

**DO:**
```tsx
import { useTheme } from '@mui/material';

export const MyComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Use theme palette */}
      <Canvas backgroundColor={theme.palette.background.default} />
    </Box>
  );
};
```

**DON'T:**
```tsx
// ❌ WRONG: Hardcoded colors
<Box sx={{ bgcolor: '#1F2937' }}>
  <Canvas backgroundColor="#F9FAFB" />
</Box>
```

### Exception: Intentional Fixed Colors

Hardcoded colors are acceptable ONLY when:
1. **Hero sections** with gradient backgrounds (e.g., white text on blue/purple gradient)
2. **Brand colors** that must remain consistent
3. **Tactical map backgrounds** with specific image requirements

**Document exceptions:**
```tsx
// EXCEPTION: White text on gradient hero - intentional for brand consistency
const HeroTitle = styled(Typography)({
  color: '#FFFFFF',  // Intentional: Always white on gradient background
});
```

---

## Common Patterns

### 1. Page Backgrounds

```tsx
// Use theme-aware background
<Box sx={{
  bgcolor: 'background.default',  // Automatically adapts to theme
  minHeight: '100vh'
}}>
  {/* Page content */}
</Box>
```

### 2. Paper/Cards

```tsx
// Material-UI Paper automatically uses theme.palette.background.paper
<Paper elevation={2}>
  {/* Card content */}
</Paper>
```

### 3. Canvas/Editor Backgrounds

```tsx
const theme = useTheme();

<SceneCanvas
  backgroundColor={theme.palette.background.default}  // Theme-aware
>
  <BackgroundLayer
    backgroundColor={theme.palette.background.default}  // Fallback color
  />
</SceneCanvas>
```

### 4. Styled Components

```tsx
import { styled } from '@mui/material/styles';

// ✅ Correct: Theme-aware styled component
const Container = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderColor: theme.palette.divider,
}));
```

---

## Testing Requirements

### Manual Testing Checklist

For EVERY new UI component:

- [ ] Test component in **light mode**
- [ ] Test component in **dark mode**
- [ ] Verify text contrast meets WCAG AA standards
- [ ] Check that all backgrounds adapt to theme
- [ ] Ensure interactive elements (buttons, inputs) are visible in both modes

### Theme Toggle Location

**Redux State**: `store.uiSlice.theme` (`'light'` | `'dark'`)

Future implementations will add a theme toggle UI component.

---

## Accessibility

### Contrast Ratios

All text must meet **WCAG AA** contrast ratios:
- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum

Material-UI's theme palette is pre-configured to meet these standards.

### Color Independence

Never rely on color alone to convey information:
- ✅ Use icons + color for status indicators
- ✅ Use labels + color for categories
- ❌ Don't use only red/green for success/error

---

## Common Mistakes

### ❌ Mistake 1: Hardcoded Background Colors
```tsx
// Wrong
<Box sx={{ bgcolor: '#2a2a2a' }}>
```

**Fix:**
```tsx
// Correct
<Box sx={{ bgcolor: 'background.default' }}>
```

### ❌ Mistake 2: Forgetting to Import useTheme
```tsx
// Wrong - no theme access
export const MyCanvas: React.FC = () => {
  return <Canvas backgroundColor="#1F2937" />;
};
```

**Fix:**
```tsx
// Correct
import { useTheme } from '@mui/material';

export const MyCanvas: React.FC = () => {
  const theme = useTheme();
  return <Canvas backgroundColor={theme.palette.background.default} />;
};
```

### ❌ Mistake 3: Theme-Unaware Styled Components
```tsx
// Wrong
const Card = styled(Box)({
  backgroundColor: '#FFFFFF',
});
```

**Fix:**
```tsx
// Correct
const Card = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));
```

---

## Phase-Specific Guidelines

### Phase 1-2: Landing & Authentication

- ✅ Landing page hero gradient is intentional (white text)
- ✅ Authentication forms use theme colors
- ✅ All containers use `background.default`

### Phase 3: Scene Editor

- ✅ Canvas background uses `theme.palette.background.default`
- ✅ Dark mode: `#1F2937` (dark gray for tactical maps)
- ✅ Light mode: `#F9FAFB` (light gray/white)
- ✅ Image rendering is 1:1, background fills excess space

### Phase 4-8: Future Components

All new components MUST:
1. Import and use `useTheme()` hook
2. Use theme palette colors exclusively
3. Test in both light and dark modes
4. Document any intentional color exceptions

---

## Resources

- **Color Configuration**: `src/components/theme/themeColors.ts` - Centralized color palette
- **Theme Provider**: `src/components/theme/VTTThemeProvider.tsx` - Theme implementation
- **Redux Theme State**: `src/store/slices/uiSlice.ts` - Theme mode state management
- **Material-UI Theme Docs**: https://mui.com/material-ui/customization/theming/
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

## Summary

**Golden Rule**: If you're typing a hex color (`#XXXXXX`), ask yourself:
1. Should this adapt to dark/light mode? → Use `theme.palette`
2. Is this intentionally fixed (hero, brand)? → Document the exception

When in doubt, use theme colors. Theme-aware components create a professional, accessible, and user-friendly experience across all viewing preferences.
