# VTTTools Professional Design System & Style Guide

## Overview

This comprehensive style guide defines the design system for VTTTools React application, focusing on a professional Virtual Tabletop (VTT) builder interface optimized for content creators. The design system emphasizes a canvas-centric layout similar to professional creative tools like Figma and Canva, tailored specifically for RPG content creation.

**Design Philosophy**: Professional creative tool interface that prioritizes content creation workflow, visual clarity, and efficient tool access while maintaining accessibility and performance standards.

## 1. Studio Professional Color Palette

### 1.1 Primary Colors

```scss
// Primary Studio Colors
$primary-blue: #2563EB;        // Primary action color - tools, buttons, active states
$primary-blue-light: #3B82F6;  // Hover states, highlights  
$primary-blue-dark: #1D4ED8;   // Active pressed states, selected items

// Secondary Colors  
$secondary-purple: #7C3AED;    // Secondary actions, highlights, accent elements
$secondary-purple-light: #8B5CF6; // Secondary hover states
$secondary-purple-dark: #6D28D9;  // Secondary active states

// Accent Colors
$accent-teal: #0D9488;         // Success states, confirmations, completed actions
$accent-orange: #EA580C;       // Warnings, important actions, attention needed
$accent-rose: #E11D48;         // Errors, destructive actions, critical alerts
```

**Usage Guidelines**:
- **Primary Blue**: Main action buttons, primary navigation, tool selection, active states
- **Secondary Purple**: Secondary actions, feature highlights, creative elements
- **Accent Colors**: System feedback, status indicators, contextual highlights

### 1.2 Neutral Palette (Canvas-Optimized)

```scss
// Background Colors (Canvas-First Design)
$canvas-white: #FEFEFE;        // Main canvas background - pure but not harsh
$panel-gray-50: #F9FAFB;       // Tool panel backgrounds, sidebar areas
$panel-gray-100: #F3F4F6;      // Secondary panel areas, input backgrounds
$panel-gray-200: #E5E7EB;      // Panel borders, dividers, subtle separations

// Content Colors (High Contrast for Readability)
$content-gray-900: #111827;    // Primary text, headers, labels
$content-gray-800: #1F2937;    // Secondary text, descriptions
$content-gray-600: #4B5563;    // Supporting text, form labels
$content-gray-500: #6B7280;    // Placeholder text, metadata
$content-gray-400: #9CA3AF;    // Disabled text, inactive elements

// Interface Colors
$border-gray-300: #D1D5DB;     // Component borders, input fields
$border-gray-200: #E5E7EB;     // Subtle borders, card separations
$shadow-gray-900: rgba(17, 24, 39, 0.1); // Drop shadows, elevations
```

**Canvas Color Strategy**:
- Canvas uses near-white (`#FEFEFE`) to avoid eye strain during long creative sessions
- Tool panels use subtle grays that don't compete with user content
- High contrast text ensures readability across all interface elements

### 1.3 State Colors

```scss
// Success States
$success-green: #059669;       // Success actions, completed states
$success-green-light: #10B981; // Success hover states
$success-green-bg: #ECFDF5;    // Success background, notifications

// Warning States  
$warning-amber: #D97706;       // Warning messages, caution states
$warning-amber-light: #F59E0B; // Warning hover states
$warning-amber-bg: #FFFBEB;    // Warning background, alerts

// Error States
$error-red: #DC2626;           // Error messages, destructive actions
$error-red-light: #EF4444;     // Error hover states
$error-red-bg: #FEF2F2;        // Error background, critical alerts

// Info States
$info-blue: #2563EB;           // Information messages, help states
$info-blue-light: #3B82F6;     // Info hover states  
$info-blue-bg: #EFF6FF;        // Info background, tips
```

### 1.4 Dark Theme Variants (Future Implementation)

```scss
// Dark Theme Color Overrides
$dark-canvas-bg: #1F2937;      // Dark canvas background
$dark-panel-bg: #111827;       // Dark panel background
$dark-content-primary: #F9FAFB; // Dark mode primary text
$dark-content-secondary: #D1D5DB; // Dark mode secondary text
$dark-border: #374151;          // Dark mode borders
```

## 2. Material UI Theme Configuration

### 2.1 Complete MUI Theme Object

```typescript
import { createTheme, ThemeOptions } from '@mui/material/styles';

export const vttToolsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',
      light: '#8B5CF6',
      dark: '#6D28D9',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',        // Application background
      paper: '#FFFFFF',          // Card and modal backgrounds
    },
    text: {
      primary: '#111827',        // Primary text
      secondary: '#4B5563',      // Secondary text
      disabled: '#9CA3AF',       // Disabled text
    },
    divider: '#E5E7EB',          // Borders and dividers
  },
  typography: {
    fontFamily: [
      'Inter',                   // Primary professional font
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Typography scale optimized for creative tools
    h1: {
      fontSize: '2.25rem',       // 36px - Page titles, major headers
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',      // 30px - Section headers
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',        // 24px - Subsection headers
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',       // 20px - Component headers
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',      // 18px - List headers
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',          // 16px - Small headers
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',          // 16px - Primary body text
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',      // 14px - Secondary body text
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',      // 14px - Button text
      fontWeight: 500,
      textTransform: 'none',     // Preserve natural casing
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem',       // 12px - Small text, labels
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  spacing: 8,                    // 8px base unit spacing system
  shape: {
    borderRadius: 8,             // Default border radius
  },
  components: {
    // Button customizations for VTT interface
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',       // Clean, flat design
          '&:hover': {
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          },
        },
      },
    },
    // Paper/Card styling for panels and modals
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px rgba(17, 24, 39, 0.1), 0 4px 6px rgba(17, 24, 39, 0.05)',
        },
      },
    },
    // Form input styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#D1D5DB',
            },
            '&:hover fieldset': {
              borderColor: '#9CA3AF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: 2,
            },
          },
        },
      },
    },
    // Card styling for asset library and content
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06)',
          },
        },
      },
    },
  },
} as ThemeOptions);
```

### 2.2 Theme Usage Examples

```typescript
// Theme provider setup
import { ThemeProvider } from '@mui/material/styles';
import { vttToolsTheme } from './theme';

function App() {
  return (
    <ThemeProvider theme={vttToolsTheme}>
      <CssBaseline />
      <VTTApplication />
    </ThemeProvider>
  );
}

// Using theme in styled components
import { styled } from '@mui/material/styles';

const CanvasContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));
```

## 3. Typography System

### 3.1 Font Stack Hierarchy

```typescript
// Primary Font Stack (UI Text) - Professional and readable
const primaryFont = [
  'Inter',                     // Modern, designed for UIs
  '-apple-system',             // macOS system font
  'BlinkMacSystemFont',        // macOS system font fallback
  '"Segoe UI"',               // Windows system font
  'Roboto',                   // Android/Google font
  '"Helvetica Neue"',         // Classic fallback
  'Arial',                    // Universal fallback
  'sans-serif'                // Generic fallback
].join(',');

// Monospace Font Stack (Technical Data, Coordinates)
const monospaceFont = [
  '"JetBrains Mono"',         // Developer-friendly monospace
  'Consolas',                 // Windows monospace
  '"Monaco"',                 // macOS monospace
  '"Courier New"',            // Universal monospace
  'monospace'                 // Generic fallback
].join(',');
```

### 3.2 Typography Scale and Usage

```scss
// Headers (Professional Tool Interface)
.vtt-heading-xl {              // Page titles, modal headers
  font-size: 2.25rem;          // 36px
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: $content-gray-900;
}

.vtt-heading-lg {              // Section headers, panel titles  
  font-size: 1.875rem;         // 30px
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.025em;
  color: $content-gray-900;
}

.vtt-heading-md {              // Sub-section headers
  font-size: 1.5rem;           // 24px
  font-weight: 600;
  line-height: 1.4;
  color: $content-gray-900;
}

.vtt-heading-sm {              // Component headers, card titles
  font-size: 1.25rem;          // 20px
  font-weight: 600;
  line-height: 1.4;
  color: $content-gray-900;
}

.vtt-heading-xs {              // List headers, group labels
  font-size: 1.125rem;         // 18px
  font-weight: 600;
  line-height: 1.4;
  color: $content-gray-800;
}

// Body Text (Content and Interface)
.vtt-body-lg {                 // Primary content text, descriptions
  font-size: 1.125rem;         // 18px
  font-weight: 400;
  line-height: 1.6;
  color: $content-gray-800;
}

.vtt-body-base {               // Standard body text
  font-size: 1rem;             // 16px
  font-weight: 400;
  line-height: 1.5;
  color: $content-gray-800;
}

.vtt-body-sm {                 // Secondary text, captions
  font-size: 0.875rem;         // 14px
  font-weight: 400;
  line-height: 1.5;
  color: $content-gray-600;
}

.vtt-body-xs {                 // Small labels, metadata
  font-size: 0.75rem;          // 12px
  font-weight: 400;
  line-height: 1.4;
  color: $content-gray-600;
}

// UI Elements (Buttons, Labels, Controls)
.vtt-button-lg {               // Primary action buttons
  font-size: 1rem;             // 16px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-button-base {             // Standard buttons
  font-size: 0.875rem;         // 14px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-button-sm {               // Small buttons, icon buttons
  font-size: 0.75rem;          // 12px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-label-base {              // Form labels, property names
  font-size: 0.875rem;         // 14px
  font-weight: 500;
  line-height: 1.4;
  color: $content-gray-600;
}

.vtt-label-sm {                // Small labels, helper text
  font-size: 0.75rem;          // 12px
  font-weight: 500;
  line-height: 1.4;
  color: $content-gray-500;
}

// Technical Text (Coordinates, IDs, Code)
.vtt-mono-base {               // Coordinates, technical data
  font-family: $monospace-font;
  font-size: 0.875rem;         // 14px
  font-weight: 400;
  line-height: 1.4;
  color: $content-gray-700;
}

.vtt-mono-sm {                 // Small technical text
  font-family: $monospace-font;
  font-size: 0.75rem;          // 12px
  font-weight: 400;
  line-height: 1.4;
  color: $content-gray-600;
}
```

## 4. Canvas-Centric Layout System

### 4.1 Grid System (24-column)

The VTTTools interface uses a flexible 24-column grid system optimized for complex creative tool layouts.

```scss
// Container and Grid Setup
.vtt-container {
  max-width: 1920px;           // Optimized for large creative displays
  margin: 0 auto;
  padding: 0 24px;
}

.vtt-grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 16px;
  height: 100vh;
}

// Main Layout Areas
.vtt-toolbar-top {             // Top toolbar - tools and actions
  grid-column: span 24;        // Full width
  height: 64px;
  background: $panel-gray-50;
  border-bottom: 1px solid $border-gray-200;
  z-index: 100;
}

.vtt-sidebar-left {            // Left panel - navigation and assets
  grid-column: span 4;         // 4/24 columns (~16.7%)
  min-width: 280px;
  max-width: 320px;
  background: $panel-gray-50;
  border-right: 1px solid $border-gray-200;
  overflow-y: auto;
  z-index: 50;
}

.vtt-canvas-main {             // Central canvas - primary work area
  grid-column: span 16;        // 16/24 columns (~66.7%)
  background: $canvas-white;
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 64px);
}

.vtt-sidebar-right {           // Right panel - properties and layers
  grid-column: span 4;         // 4/24 columns (~16.7%)
  min-width: 280px;
  max-width: 320px;
  background: $panel-gray-50;
  border-left: 1px solid $border-gray-200;
  overflow-y: auto;
  z-index: 50;
}
```

### 4.2 Responsive Breakpoints

```typescript
const breakpoints = {
  xs: 0,      // Mobile (not primary target)
  sm: 640,    // Small tablet
  md: 768,    // Tablet
  lg: 1024,   // Small desktop
  xl: 1280,   // Standard desktop
  xxl: 1536,  // Large desktop
  vtt: 1920,  // VTT-optimized large screens
};

// Panel behavior at different screen sizes
const responsiveBehavior = {
  // Mobile: Stack layout (not primary use case)
  mobile: {
    layout: 'stack',
    sidebar: 'overlay',
    canvas: 'full-width',
  },
  // Tablet: Overlay panels on canvas
  tablet: {
    layout: 'overlay',
    sidebar: 'collapsible',
    canvas: 'main-focus',
  },
  // Desktop: Full sidebar layout (primary target)
  desktop: {
    layout: 'sidebar',
    sidebar: 'fixed',
    canvas: 'centered',
  },
  // Ultrawide: More canvas space
  ultrawide: {
    layout: 'sidebar-extended',
    sidebar: 'fixed-wide',
    canvas: 'maximized',
  },
};
```

### 4.3 Layout Component Examples

```typescript
// Main Layout Component
interface VTTLayoutProps {
  children: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  toolbarContent?: React.ReactNode;
}

const VTTLayout: React.FC<VTTLayoutProps> = ({
  children,
  showLeftSidebar = true,
  showRightSidebar = true,
  toolbarContent,
}) => {
  return (
    <div className="vtt-container">
      <div className="vtt-grid">
        {toolbarContent && (
          <div className="vtt-toolbar-top">
            {toolbarContent}
          </div>
        )}
        
        {showLeftSidebar && (
          <div className="vtt-sidebar-left">
            <NavigationPanel />
            <AssetLibrary />
          </div>
        )}
        
        <div className="vtt-canvas-main">
          {children}
        </div>
        
        {showRightSidebar && (
          <div className="vtt-sidebar-right">
            <PropertyPanel />
            <LayerPanel />
          </div>
        )}
      </div>
    </div>
  );
};
```

## 5. Component Standards

### 5.1 Navigation Components

```typescript
// Primary Navigation (Left Sidebar)
interface VTTSidebarProps {
  sections: NavigationSection[];
  activeSection?: string;
  collapsed?: boolean;
  onSectionChange: (section: string) => void;
}

interface NavigationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: number;
  items?: NavigationItem[];
}

// Asset Library Browser
interface AssetLibraryProps {
  assets: Asset[];
  categories: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  viewMode: 'grid' | 'list';
  onAssetSelect: (asset: Asset) => void;
  onDragStart: (asset: Asset) => void;
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}
```

### 5.2 Canvas Components

```typescript
// Main Canvas Container
interface CanvasContainerProps {
  scene: Scene;
  tools: ToolConfig[];
  activeTool?: string;
  zoom: number;
  pan: { x: number; y: number };
  onSceneUpdate: (scene: Scene) => void;
  onToolChange: (tool: string) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
}

// Property Panel (Right Sidebar)
interface PropertyPanelProps {
  selectedAssets: Asset[];
  sceneProperties: SceneProperties;
  onAssetUpdate: (asset: Asset) => void;
  onSceneUpdate: (properties: SceneProperties) => void;
}

// Layer Management Panel
interface LayerPanelProps {
  layers: Layer[];
  activeLayer?: string;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onLayerSelect: (layerId: string) => void;
}
```

### 5.3 Modal and Dialog Standards

```scss
// Modal styling standards
.vtt-modal {
  .MuiDialog-paper {
    border-radius: 12px;
    max-width: 800px;
    min-width: 400px;
    box-shadow: 0 20px 25px rgba(17, 24, 39, 0.1), 
                0 10px 10px rgba(17, 24, 39, 0.04);
  }
  
  .vtt-modal-header {
    padding: 24px 24px 0;
    border-bottom: 1px solid #E5E7EB;
    
    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: $content-gray-900;
    }
  }
  
  .vtt-modal-content {
    padding: 24px;
    min-height: 200px;
  }
  
  .vtt-modal-actions {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    
    .MuiButton-root {
      min-width: 100px;
    }
  }
}

// Confirmation dialog styling
.vtt-confirm-dialog {
  .vtt-modal-content {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .warning-icon {
      color: $warning-amber;
      font-size: 2rem;
    }
  }
}
```

## 6. Iconography System

### 6.1 Icon Standards and Usage

```typescript
// Material Design Icons with VTT Extensions
import {
  // Navigation
  Home,             // Dashboard
  Map,              // Adventures  
  Inventory2,       // Assets
  Group,            // Sessions
  Chat,             // Communication
  
  // Canvas Tools
  Layers,           // Scene layers
  GridOn,           // Grid toggle
  ZoomIn,           // Zoom in
  ZoomOut,          // Zoom out
  PanTool,          // Pan tool
  
  // Actions
  Undo,             // Undo action
  Redo,             // Redo action  
  Settings,         // Configuration
  Upload,           // File operations
  Download,         // Export
  
  // Interface
  Visibility,       // Layer visibility
  VisibilityOff,    // Layer hidden
  Lock,             // Locked element
  LockOpen,         // Unlocked element
  Delete,           // Delete action
  Edit,             // Edit action
} from '@mui/icons-material';

// VTT-Specific Icon Sizes
const iconSizes = {
  xs: 16,           // Small buttons, list items, inline icons
  sm: 20,           // Standard buttons, navigation items  
  md: 24,           // Tool buttons, primary navigation
  lg: 32,           // Feature icons, empty states
  xl: 48,           // Major features, splash screens
};

// Icon Component Standard
interface VTTIconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'inherit' | 'disabled' | 'action';
  className?: string;
  onClick?: () => void;
}

const VTTIcon: React.FC<VTTIconProps> = ({ 
  name, 
  size = 'md', 
  color = 'inherit', 
  className, 
  ...props 
}) => {
  const iconSize = iconSizes[size];
  
  return (
    <Icon
      className={`vtt-icon vtt-icon-${size} ${className}`}
      style={{ fontSize: iconSize }}
      color={color}
      {...props}
    >
      {name}
    </Icon>
  );
};
```

### 6.2 Custom VTT Icons and Symbols

```typescript
// Scene Builder specific icons and symbols
const vttIcons = {
  // Asset Types
  character: '👤',      // Character tokens
  creature: '🐉',       // Monster/creature tokens
  npc: '🧙‍♂️',           // NPC tokens
  object: '📦',         // Object/prop tokens
  vehicle: '🏇',        // Vehicle tokens
  
  // Grid Types
  squareGrid: '⊞',      // Square grid system
  hexGrid: '⬡',         // Hexagonal grid
  isometricGrid: '◈',   // Isometric grid
  noGrid: '○',          // No grid
  
  // Tools
  select: '↖️',          // Selection tool
  move: '✋',            // Move tool  
  rotate: '↻',          // Rotation tool
  scale: '⤢',           // Scale tool
  measure: '📏',        // Measurement tool
  
  // Layers
  background: '🖼️',     // Background layer
  assets: '🎭',         // Assets layer
  grid: '⊞',            // Grid layer
  ui: '🎛️',             // UI overlay layer
  effects: '✨',        // Effects layer
  
  // Status Indicators
  online: '🟢',         // Online status
  busy: '🟡',           // Busy status
  offline: '⚪',        // Offline status
  error: '🔴',          // Error status
};

// Icon usage in components
const LayerIcon: React.FC<{ layer: Layer }> = ({ layer }) => {
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'background': return vttIcons.background;
      case 'grid': return vttIcons.grid;
      case 'assets': return vttIcons.assets;
      case 'ui': return vttIcons.ui;
      default: return '📋';
    }
  };
  
  return (
    <span className="vtt-layer-icon">
      {getLayerIcon(layer.type)}
    </span>
  );
};
```

## 7. Interactive States and Micro-interactions

### 7.1 Hover States

```scss
// Base interactive element
.vtt-interactive {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }
}

// Button hover states
.vtt-button-primary {
  background-color: $primary-blue;
  
  &:hover {
    background-color: $primary-blue-light;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    background-color: $primary-blue-dark;
    transform: translateY(0);
  }
}

.vtt-button-secondary {
  background-color: $secondary-purple;
  
  &:hover {
    background-color: $secondary-purple-light;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }
}

// Card hover effects
.vtt-card {
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(17, 24, 39, 0.1);
  }
}

// Tool button states
.vtt-tool-button {
  padding: 8px;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background-color: $panel-gray-100;
  }
  
  &.active {
    background-color: $primary-blue;
    color: white;
    
    &:hover {
      background-color: $primary-blue-light;
    }
  }
}
```

### 7.2 Focus States (Accessibility)

```scss
// Keyboard navigation focus states
.vtt-focusable {
  &:focus-visible {
    outline: 2px solid $primary-blue;
    outline-offset: 2px;
    border-radius: 4px;
  }
}

// Form input focus
.vtt-input {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:focus {
    border-color: $primary-blue;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    outline: none;
  }
  
  &:focus-visible {
    outline: 2px solid $primary-blue;
    outline-offset: 1px;
  }
}

// Button focus states
.vtt-button {
  &:focus-visible {
    outline: 2px solid $primary-blue;
    outline-offset: 2px;
  }
}

// Canvas element focus (for keyboard navigation)
.vtt-canvas-element {
  &:focus {
    outline: 2px solid $primary-blue;
    outline-offset: 2px;
  }
}
```

### 7.3 Loading States

```scss
// Loading spinner animation
.vtt-loading {
  position: relative;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid $border-gray-300;
    border-top-color: $primary-blue;
    border-radius: 50%;
    animation: vtt-spin 0.8s linear infinite;
  }
}

@keyframes vtt-spin {
  to {
    transform: rotate(360deg);
  }
}

// Button loading state
.vtt-button-loading {
  position: relative;
  color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: vtt-spin 0.8s linear infinite;
  }
}

// Content loading skeleton
.vtt-skeleton {
  background: linear-gradient(90deg, $panel-gray-200 25%, $panel-gray-100 50%, $panel-gray-200 75%);
  background-size: 200% 100%;
  animation: vtt-skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes vtt-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 7.4 Error and Success States

```scss
// Error state styling
.vtt-error {
  color: $error-red;
  background-color: $error-red-bg;
  border: 1px solid $error-red-light;
  border-radius: 6px;
  padding: 12px;
  
  .vtt-error-icon {
    color: $error-red;
    margin-right: 8px;
  }
}

// Success state styling  
.vtt-success {
  color: $success-green;
  background-color: $success-green-bg;
  border: 1px solid $success-green-light;
  border-radius: 6px;
  padding: 12px;
  
  .vtt-success-icon {
    color: $success-green;
    margin-right: 8px;
  }
}

// Warning state styling
.vtt-warning {
  color: $warning-amber;
  background-color: $warning-amber-bg;
  border: 1px solid $warning-amber-light;
  border-radius: 6px;
  padding: 12px;
  
  .vtt-warning-icon {
    color: $warning-amber;
    margin-right: 8px;
  }
}
```

## 8. Spacing and Elevation System

### 8.1 8px Spacing System

```scss
$spacing-base: 8px;

// Spacing scale (based on 8px grid)
$spacing-1: 4px;              // 0.5 * base - Minimal spacing
$spacing-2: 8px;              // 1 * base - Base unit
$spacing-3: 12px;             // 1.5 * base - Small spacing
$spacing-4: 16px;             // 2 * base - Standard spacing
$spacing-5: 20px;             // 2.5 * base - Medium spacing
$spacing-6: 24px;             // 3 * base - Large spacing
$spacing-8: 32px;             // 4 * base - Extra large spacing
$spacing-10: 40px;            // 5 * base - Section spacing
$spacing-12: 48px;            // 6 * base - Component spacing
$spacing-16: 64px;            // 8 * base - Layout spacing
$spacing-20: 80px;            // 10 * base - Major sections
$spacing-24: 96px;            // 12 * base - Page sections

// Component spacing patterns
.vtt-spacing {
  padding: $spacing-4;          // Standard component padding
  margin-bottom: $spacing-4;    // Standard element spacing
}

.vtt-section {
  padding: $spacing-6 $spacing-4; // Section internal padding
  margin-bottom: $spacing-8;      // Section separation
}

.vtt-panel {
  padding: $spacing-6;            // Panel padding
  gap: $spacing-4;               // Internal element spacing
}

.vtt-toolbar {
  padding: $spacing-3 $spacing-4; // Toolbar padding
  gap: $spacing-2;               // Tool spacing
}

// Form element spacing
.vtt-form-group {
  margin-bottom: $spacing-5;     // Form field separation
}

.vtt-form-label {
  margin-bottom: $spacing-2;     // Label to input spacing
}

.vtt-form-help {
  margin-top: $spacing-2;        // Help text spacing
}
```

### 8.2 Elevation System

```scss
// Shadow elevation levels
$elevation-0: none;
$elevation-1: 0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06);
$elevation-2: 0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06);
$elevation-3: 0 10px 15px rgba(17, 24, 39, 0.1), 0 4px 6px rgba(17, 24, 39, 0.05);
$elevation-4: 0 20px 25px rgba(17, 24, 39, 0.1), 0 10px 10px rgba(17, 24, 39, 0.04);
$elevation-5: 0 25px 50px rgba(17, 24, 39, 0.25);

// Component elevation usage
.vtt-card { 
  box-shadow: $elevation-1; 
  
  &:hover {
    box-shadow: $elevation-2;
  }
}

.vtt-modal { 
  box-shadow: $elevation-4; 
}

.vtt-tooltip { 
  box-shadow: $elevation-2; 
}

.vtt-dropdown { 
  box-shadow: $elevation-3; 
}

.vtt-floating-panel {
  box-shadow: $elevation-3;
}

.vtt-toolbar {
  box-shadow: $elevation-1;
}

// Z-index layering system
$z-index-base: 1;
$z-index-dropdown: 1000;
$z-index-sticky: 1010;
$z-index-fixed: 1020;
$z-index-modal-backdrop: 1030;
$z-index-modal: 1040;
$z-index-popover: 1050;
$z-index-tooltip: 1060;
```

## 9. Implementation Examples

### 9.1 Theme Provider Setup

```typescript
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { vttToolsTheme } from './theme';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = React.useMemo(
    () => createTheme({
      ...vttToolsTheme,
      palette: {
        ...vttToolsTheme.palette,
        mode,
      },
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
```

### 9.2 Styled Component Examples

```typescript
// src/components/styled/StyledComponents.tsx
import { styled } from '@mui/material/styles';
import { Paper, Button, Card } from '@mui/material';

// Canvas container with proper styling
export const CanvasContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#FEFEFE',
  height: 'calc(100vh - 64px)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Tool panel styling
export const ToolPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
}));

// Professional button styling
export const VTTButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 20px',
  fontWeight: 500,
  textTransform: 'none',
  letterSpacing: '0.025em',
  boxShadow: 'none',
  
  '&:hover': {
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
    transform: 'translateY(-1px)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// Asset card styling
export const AssetCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(17, 24, 39, 0.1)',
  },
}));
```

### 9.3 CSS Variable Implementation

```scss
// src/styles/variables.scss
:root {
  // Color Variables
  --vtt-primary-blue: #2563EB;
  --vtt-primary-blue-light: #3B82F6;
  --vtt-primary-blue-dark: #1D4ED8;
  
  --vtt-secondary-purple: #7C3AED;
  --vtt-secondary-purple-light: #8B5CF6;
  --vtt-secondary-purple-dark: #6D28D9;
  
  --vtt-canvas-white: #FEFEFE;
  --vtt-panel-gray-50: #F9FAFB;
  --vtt-panel-gray-100: #F3F4F6;
  --vtt-panel-gray-200: #E5E7EB;
  
  --vtt-content-gray-900: #111827;
  --vtt-content-gray-800: #1F2937;
  --vtt-content-gray-600: #4B5563;
  --vtt-content-gray-500: #6B7280;
  --vtt-content-gray-400: #9CA3AF;
  
  // Spacing Variables
  --vtt-spacing-1: 4px;
  --vtt-spacing-2: 8px;
  --vtt-spacing-3: 12px;
  --vtt-spacing-4: 16px;
  --vtt-spacing-5: 20px;
  --vtt-spacing-6: 24px;
  --vtt-spacing-8: 32px;
  --vtt-spacing-10: 40px;
  --vtt-spacing-12: 48px;
  --vtt-spacing-16: 64px;
  
  // Typography Variables
  --vtt-font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --vtt-font-family-mono: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace;
  
  // Border Radius Variables
  --vtt-border-radius-sm: 6px;
  --vtt-border-radius-base: 8px;
  --vtt-border-radius-lg: 12px;
  
  // Shadow Variables
  --vtt-shadow-sm: 0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06);
  --vtt-shadow-base: 0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06);
  --vtt-shadow-lg: 0 10px 15px rgba(17, 24, 39, 0.1), 0 4px 6px rgba(17, 24, 39, 0.05);
}

// Dark theme overrides
[data-theme='dark'] {
  --vtt-canvas-white: #1F2937;
  --vtt-panel-gray-50: #111827;
  --vtt-panel-gray-100: #1F2937;
  --vtt-panel-gray-200: #374151;
  
  --vtt-content-gray-900: #F9FAFB;
  --vtt-content-gray-800: #F3F4F6;
  --vtt-content-gray-600: #D1D5DB;
  --vtt-content-gray-500: #9CA3AF;
  --vtt-content-gray-400: #6B7280;
}
```

## 10. Usage Guidelines and Best Practices

### 10.1 Color Usage Guidelines

- **Primary Blue**: Use for main action buttons, active tool states, and primary navigation elements
- **Secondary Purple**: Reserve for secondary actions, feature highlights, and creative accent elements  
- **Canvas White**: Main canvas background should always use `#FEFEFE` to reduce eye strain
- **Panel Grays**: Use consistently across tool panels to maintain visual hierarchy
- **State Colors**: Apply consistently for success, warning, error, and info feedback

### 10.2 Typography Best Practices

- **Headers**: Use weight 600-700 for all headers, reserve 700 for major page titles only
- **Body Text**: Maintain 1.5+ line-height for readability during long creative sessions
- **Button Text**: Always use weight 500 with subtle letter-spacing for professional appearance
- **Monospace**: Use only for technical data like coordinates, IDs, and code snippets

### 10.3 Layout Guidelines

- **Canvas-First**: Always prioritize canvas space, keep panels minimal but functional
- **24-Column Grid**: Use consistent grid system for predictable layouts across components
- **Responsive Behavior**: Design primarily for desktop (1280px+), gracefully degrade for smaller screens
- **Panel Width**: Maintain 280-320px width range for sidebars to ensure usability

### 10.4 Component Standards

- **Interactive Elements**: All clickable elements should have hover states and focus indicators
- **Loading States**: Provide loading feedback for any operation taking >500ms  
- **Error Handling**: Use consistent error styling and provide actionable error messages
- **Accessibility**: Ensure all interactive elements meet WCAG 2.1 AA standards

### 10.5 Performance Considerations

- **CSS Custom Properties**: Use for theme switching and runtime color adjustments
- **Styled Components**: Prefer styled-components over inline styles for better performance
- **Icon Optimization**: Use Material UI icons for consistency, custom icons for VTT-specific needs
- **Animation Performance**: Keep animations under 300ms, use transform/opacity for smooth performance

---

This style guide serves as the foundation for consistent, professional, and accessible design across the VTTTools React application. All components should follow these standards to ensure a cohesive user experience optimized for creative workflows.