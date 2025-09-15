# Technical PRD: VTTTools Complete Application Migration - Blazor to React + Konva.js

## Project Context

**System**: VTTTools - VTT Builder/Creative Tool Application (similar to Figma/Canva)
**Current Frontend**: Hybrid Blazor Architecture (Server-side + WebAssembly Components)
**Existing Backend**: Complete .NET 9.0 + Aspire Microservices Architecture (Assets, Game, Library, Media, Auth Services) with dedicated authentication service
**Build**: .NET 9.0 + Aspire + TypeScript 5.9.2 + MSBuild Integration
**Target Architecture**: React 18+ SPA replacing WebApp UI, integrated with .NET Aspire microservices (including dedicated Auth service) + TypeScript + Material UI + Konva.js + HTML5 Audio

## Task Requirements

### 1. Functional Requirements

- **Primary Goal**: Replace VTTTools Blazor frontend (WebApp + WebApp.WebAssembly) with React + Material UI + Konva.js, integrating directly with existing .NET Aspire microservices (Assets, Game, Library, Media) for UI consistency and enhanced creative tool performance
- **User Stories** (58 Atomic Stories):

#### Landing Page & Navigation
  **US001**: As a visitor, I want to see a landing page that explains the VTT platform and guides me to register or login so that I understand the application's purpose and can access it
  **US002**: As an authenticated user, I want to access a dashboard/home page that provides navigation to all features and shows my recent activity so that I can efficiently navigate the application

#### Authentication System
  **US003**: As a user, I want to register a new account so that I can start using the VTT platform
  **US004**: As a user, I want to log into the application so that I can access my gaming content
  **US005**: As a user, I want to log out of the application so that I can secure my account
  **US006**: As a user, I want to reset my password so that I can regain access if I forget my credentials
  **US007**: As a user, I want to set up two-factor authentication so that I can enhance my account security
  **US008**: As a user, I want to use external login providers so that I can authenticate with existing accounts

#### Profile and Account Management
  **US009**: As a user, I want to update my profile information so that other players can identify me correctly
  **US010**: As a user, I want to change my account settings so that I can customize my application experience
  **US011**: As a user, I want to change my password so that I can maintain account security

#### Adventure Management
  **US012**: As a GM, I want to create new adventures so that I can organize new campaigns
  **US013**: As a GM, I want to edit existing adventures so that I can update campaign details
  **US014**: As a GM, I want to clone existing adventures so that I can reuse campaign structures
  **US015**: As a GM, I want to delete adventures so that I can remove unwanted campaigns
  **US016**: As a GM, I want to set adventure visibility controls so that I can manage who can access my campaigns

#### Asset Management
  **US017**: As a GM, I want to create character assets so that I can represent player characters in scenes
  **US018**: As a GM, I want to create creature assets so that I can populate encounters with monsters
  **US019**: As a GM, I want to create NPC assets so that I can represent non-player characters
  **US020**: As a GM, I want to create object assets so that I can add environmental elements to scenes
  **US021**: As a GM, I want to edit existing assets so that I can update their properties
  **US022**: As a GM, I want to delete assets so that I can remove unwanted items from my library
  **US023**: As a GM, I want to categorize and organize assets so that I can find them efficiently
  **US024**: As a GM, I want to browse my asset library so that I can select appropriate assets for scenes
  **US025**: As a GM, I want to upload asset images so that I can customize the visual representation

#### Game Session Management
  **US026**: As a user, I want to schedule game sessions so that I can coordinate with other players
  **US027**: As a user, I want to manage ongoing game sessions so that I can control the flow of gameplay
  **US028**: As a GM, I want to invite players to game sessions so that I can assemble my gaming group
  **US029**: As a player, I want to join scheduled game sessions so that I can participate in campaigns

#### Real-time Communication
  **US030**: As a player, I want to participate in real-time chat through React components so that I can communicate during game sessions

#### Scene Builder
  **US047**: As a GM, I want a multi-layer Konva.js canvas foundation so that I can have high-performance rendering for complex battle maps
  **US048**: As a GM, I want to upload and manage background images so that I can set the visual foundation for my battle maps
  **US049**: As a GM, I want to configure different grid systems so that I can match my preferred game system's mapping requirements
  **US050**: As a GM, I want to browse and select assets from my library so that I can efficiently choose elements for my scenes
  **US051**: As a GM, I want to place assets on the canvas using drag-and-drop so that I can quickly position elements in my scenes
  **US052**: As a GM, I want to manipulate placed assets with rotation, scaling, and locking so that I can precisely customize element positioning and properties
  **US053**: As a GM, I want to manage layer visibility and ordering so that I can control what elements are shown and their display priority
  **US054**: As a GM, I want zoom and pan controls so that I can navigate large battle maps efficiently
  **US055**: As a GM, I want grid snapping functionality so that I can precisely align assets with the grid system
  **US056**: As a GM, I want to save and load scene configurations so that I can preserve my work and reuse battle maps

#### Frontend Error Handling
  **US032**: As a user, I want to see clear error messages when network connections fail so that I understand what went wrong and can take appropriate action
  **US033**: As a user, I want to see specific validation errors on forms so that I can correct my input and successfully submit forms
  **US034**: As a user, I want to see helpful messages when assets fail to load so that I know which content is unavailable and can retry or choose alternatives
  **US035**: As a GM, I want to recover from scene saving/loading errors so that I don't lose my work when technical issues occur
  **US036**: As a user, I want to see user-friendly error messages for system errors so that I can understand what happened and know how to proceed

#### Content Organization
  **US037**: As a GM, I want to search and filter my adventures in the UI so that I can quickly find specific campaigns among many
  **US038**: As a GM, I want to search and filter my assets in the UI so that I can efficiently locate specific creatures, characters, or objects
  **US039**: As a GM, I want to organize content into folders or tags so that I can structure my large content library logically
  **US040**: As a GM, I want to select multiple content items for bulk operations so that I can efficiently delete, move, or organize large amounts of content

#### Help System
  **US041**: As a user, I want to access contextual help for complex features so that I can understand how to use advanced functionality
  **US042**: As a user, I want to search help documentation within the app so that I can find answers to specific questions quickly
  **US043**: As a user, I want to see tooltips and quick guidance for interface elements so that I can understand what different controls do

#### Undo/Redo Operations
  **US044**: As a GM, I want to undo and redo operations in Scene Builder so that I can experiment freely and recover from mistakes
  **US045**: As a GM, I want to undo and redo changes in content creation so that I can safely make modifications to adventures and assets
  **US046**: As a user, I want to recover accidental changes to my data so that I don't permanently lose important work due to user error

### 2. Style Guide

#### VTTTools Professional Design System

This section defines the comprehensive design system for VTTTools React application, focusing on a professional VTT builder interface optimized for content creators.

##### 2.1 Studio Professional Color Palette

**Primary Colors**:
```scss
// Primary Studio Colors
$primary-blue: #2563EB;        // Primary action color - tools, buttons
$primary-blue-light: #3B82F6;  // Hover states
$primary-blue-dark: #1D4ED8;   // Active states

// Secondary Colors  
$secondary-purple: #7C3AED;    // Secondary actions, highlights
$secondary-purple-light: #8B5CF6;
$secondary-purple-dark: #6D28D9;

// Accent Colors
$accent-teal: #0D9488;         // Success states, confirmations
$accent-orange: #EA580C;       // Warnings, important actions
$accent-rose: #E11D48;         // Errors, destructive actions
```

**Neutral Palette (Canvas-Optimized)**:
```scss
// Background Colors
$canvas-white: #FEFEFE;        // Main canvas background
$panel-gray-50: #F9FAFB;       // Tool panel backgrounds
$panel-gray-100: #F3F4F6;      // Secondary panel areas
$panel-gray-200: #E5E7EB;      // Panel borders, dividers

// Content Colors  
$content-gray-900: #111827;    // Primary text, headers
$content-gray-800: #1F2937;    // Secondary text
$content-gray-600: #4B5563;    // Supporting text, labels
$content-gray-500: #6B7280;    // Placeholder text
$content-gray-400: #9CA3AF;    // Disabled text

// Interface Colors
$border-gray-300: #D1D5DB;     // Component borders
$border-gray-200: #E5E7EB;     // Subtle borders
$shadow-gray-900: rgba(17, 24, 39, 0.1); // Drop shadows
```

**State Colors**:
```scss
// Success States
$success-green: #059669;
$success-green-light: #10B981;
$success-green-bg: #ECFDF5;

// Warning States  
$warning-amber: #D97706;
$warning-amber-light: #F59E0B;
$warning-amber-bg: #FFFBEB;

// Error States
$error-red: #DC2626;
$error-red-light: #EF4444;
$error-red-bg: #FEF2F2;

// Info States
$info-blue: #2563EB;
$info-blue-light: #3B82F6;
$info-blue-bg: #EFF6FF;
```

##### 2.2 Material UI Theme Configuration

**Complete MUI Theme Object**:
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
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
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

##### 2.3 Typography System

**Font Stack Hierarchy**:
```typescript
// Primary Font Stack (UI Text)
const primaryFont = [
  'Inter',
  '-apple-system', 
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif'
].join(',');

// Monospace Font Stack (Technical Data)
const monospaceFont = [
  '"JetBrains Mono"',
  'Consolas',
  '"Monaco"',
  '"Courier New"',
  'monospace'
].join(',');
```

**Typography Scale**:
```scss
// Headers (Professional Tool Interface)
.vtt-heading-xl {    // Page titles, modal headers
  font-size: 2.25rem; // 36px
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.vtt-heading-lg {    // Section headers, panel titles  
  font-size: 1.875rem; // 30px
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.vtt-heading-md {    // Sub-section headers
  font-size: 1.5rem; // 24px
  font-weight: 600;
  line-height: 1.4;
}

.vtt-heading-sm {    // Component headers, card titles
  font-size: 1.25rem; // 20px
  font-weight: 600;
  line-height: 1.4;
}

.vtt-heading-xs {    // List headers, group labels
  font-size: 1.125rem; // 18px
  font-weight: 600;
  line-height: 1.4;
}

// Body Text (Content and Interface)
.vtt-body-lg {       // Primary content text
  font-size: 1.125rem; // 18px
  font-weight: 400;
  line-height: 1.6;
}

.vtt-body-base {     // Standard body text
  font-size: 1rem; // 16px
  font-weight: 400;
  line-height: 1.5;
}

.vtt-body-sm {       // Secondary text, captions
  font-size: 0.875rem; // 14px
  font-weight: 400;
  line-height: 1.5;
}

.vtt-body-xs {       // Small labels, metadata
  font-size: 0.75rem; // 12px
  font-weight: 400;
  line-height: 1.4;
}

// UI Elements (Buttons, Labels, Controls)
.vtt-button-lg {     // Primary action buttons
  font-size: 1rem; // 16px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-button-base {   // Standard buttons
  font-size: 0.875rem; // 14px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-button-sm {     // Small buttons, icon buttons
  font-size: 0.75rem; // 12px
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: none;
}

.vtt-label-base {    // Form labels, property names
  font-size: 0.875rem; // 14px
  font-weight: 500;
  line-height: 1.4;
  color: #374151;
}

.vtt-label-sm {      // Small labels, helper text
  font-size: 0.75rem; // 12px
  font-weight: 500;
  line-height: 1.4;
  color: #6B7280;
}

// Technical Text (Coordinates, IDs, Code)
.vtt-mono-base {     // Coordinates, technical data
  font-family: $monospace-font;
  font-size: 0.875rem; // 14px
  font-weight: 400;
  line-height: 1.4;
}

.vtt-mono-sm {       // Small technical text
  font-family: $monospace-font;
  font-size: 0.75rem; // 12px
  font-weight: 400;
  line-height: 1.4;
}
```

##### 2.4 Canvas-Centric Layout System

**Grid System (24-column)**:
```scss
// 24-column grid system for complex layouts
.vtt-container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 24px;
}

.vtt-grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 16px;
}

// Panel Layout Classes
.vtt-sidebar-left {      // Left navigation/assets panel
  grid-column: span 4;   // 4/24 columns
  min-width: 280px;
}

.vtt-canvas-main {       // Central canvas area
  grid-column: span 16;  // 16/24 columns  
  min-height: calc(100vh - 64px);
}

.vtt-sidebar-right {     // Right properties panel
  grid-column: span 4;   // 4/24 columns
  min-width: 280px;
}

.vtt-toolbar-top {       // Top toolbar
  grid-column: span 24;  // Full width
  height: 64px;
}
```

**Responsive Breakpoints**:
```typescript
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  vtt: 1920, // VTT-optimized large screens
};

// Panel behavior at different sizes
const panelBehavior = {
  mobile: 'stack',      // Stack panels vertically
  tablet: 'overlay',    // Overlay panels on canvas
  desktop: 'sidebar',   // Fixed sidebar panels
  ultrawide: 'sidebar', // Fixed with more canvas space
};
```

##### 2.5 Component Standards

**Navigation Components**:
```typescript
// Primary Navigation (Left Sidebar)
interface VTTSidebarProps {
  sections: NavigationSection[];
  activeSection?: string;
  collapsed?: boolean;
  onSectionChange: (section: string) => void;
}

// Asset Library Browser
interface AssetLibraryProps {
  assets: Asset[];
  categories: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  onAssetSelect: (asset: Asset) => void;
  onDragStart: (asset: Asset) => void;
}
```

**Canvas Components**:
```typescript
// Main Canvas Container
interface CanvasContainerProps {
  scene: Scene;
  tools: ToolConfig[];
  activeTool?: string;
  onSceneUpdate: (scene: Scene) => void;
  onToolChange: (tool: string) => void;
}

// Property Panel (Right Sidebar)
interface PropertyPanelProps {
  selectedAssets: Asset[];
  sceneProperties: SceneProperties;
  onAssetUpdate: (asset: Asset) => void;
  onSceneUpdate: (properties: SceneProperties) => void;
}
```

**Modal and Dialog Standards**:
```scss
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
  }
  
  .vtt-modal-content {
    padding: 24px;
  }
  
  .vtt-modal-actions {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
```

##### 2.6 Iconography System

**Icon Standards**:
```typescript
// Material Design Icons with VTT Extensions
import {
  Home,           // Dashboard
  Map,            // Adventures  
  Inventory,      // Assets
  Group,          // Sessions
  Chat,           // Communication
  Layers,         // Scene layers
  GridOn,         // Grid toggle
  ZoomIn,         // Canvas controls
  Undo,           // History
  Settings,       // Configuration
  Upload,         // File operations
  Visibility,     // Layer visibility
} from '@mui/icons-material';

// VTT-Specific Icon Sizes
const iconSizes = {
  xs: 16,    // Small buttons, list items
  sm: 20,    // Standard buttons  
  md: 24,    // Tool buttons, navigation
  lg: 32,    // Feature icons, empty states
  xl: 48,    // Major features, illustrations
};

// Icon Component Standard
interface VTTIconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'inherit' | 'disabled';
  className?: string;
}
```

**Custom VTT Icons**:
```typescript
// Scene Builder specific icons
const vttIcons = {
  // Asset types
  character: '👤',
  creature: '🐉', 
  npc: '🧙‍♂️',
  object: '📦',
  
  // Grid types
  squareGrid: '⊞',
  hexGrid: '⬡',
  isometricGrid: '◈',
  
  // Tools
  select: '↖️',
  move: '✋',
  rotate: '↻',
  scale: '⤢',
  
  // Layers
  background: '🖼️',
  assets: '🎭',
  grid: '⊞',
  ui: '🎛️',
};
```

##### 2.7 Interactive States

**Hover States**:
```scss
.vtt-interactive {
  transition: all 0.2s ease-in-out;
  
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
.vtt-button-primary:hover {
  background-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.vtt-button-secondary:hover {
  background-color: #8B5CF6;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}
```

**Focus States (Accessibility)**:
```scss
.vtt-focusable {
  &:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
    border-radius: 4px;
  }
}

// Form input focus
.vtt-input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

**Loading States**:
```scss
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
    border: 2px solid #E5E7EB;
    border-top-color: #2563EB;
    border-radius: 50%;
    animation: vtt-spin 0.8s linear infinite;
  }
}

@keyframes vtt-spin {
  to {
    transform: rotate(360deg);
  }
}
```

##### 2.8 Spacing and Elevation System

**8px Spacing System**:
```scss
$spacing-base: 8px;

// Spacing scale
$spacing-1: 4px;   // 0.5 * base
$spacing-2: 8px;   // 1 * base  
$spacing-3: 12px;  // 1.5 * base
$spacing-4: 16px;  // 2 * base
$spacing-6: 24px;  // 3 * base
$spacing-8: 32px;  // 4 * base
$spacing-10: 40px; // 5 * base
$spacing-12: 48px; // 6 * base
$spacing-16: 64px; // 8 * base
$spacing-20: 80px; // 10 * base

// Component spacing
.vtt-spacing {
  padding: $spacing-4;        // Standard padding
  margin-bottom: $spacing-4;  // Standard spacing between elements
}

.vtt-section {
  padding: $spacing-6 $spacing-4; // Section padding
  margin-bottom: $spacing-8;      // Section separation
}
```

**Elevation System**:
```scss
// Shadow elevation levels
$elevation-0: none;
$elevation-1: 0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06);
$elevation-2: 0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06);
$elevation-3: 0 10px 15px rgba(17, 24, 39, 0.1), 0 4px 6px rgba(17, 24, 39, 0.05);
$elevation-4: 0 20px 25px rgba(17, 24, 39, 0.1), 0 10px 10px rgba(17, 24, 39, 0.04);
$elevation-5: 0 25px 50px rgba(17, 24, 39, 0.25);

// Component elevation usage
.vtt-card { box-shadow: $elevation-1; }
.vtt-modal { box-shadow: $elevation-4; }
.vtt-tooltip { box-shadow: $elevation-2; }
.vtt-dropdown { box-shadow: $elevation-3; }
```

### 3. Technical Specifications

#### Frontend React 18+ SPA + TypeScript + Material UI + Konva.js + HTML5 Audio + SignalR Client (integrating with existing .NET Aspire backend)
- **Models**: 
  - User authentication and profile state management with React Context/Redux Toolkit
  - Adventure management state (CRUD operations, cloning, visibility controls)
  - Asset management state (Character/Creature/NPC/Object types with file uploads)
  - Game session management state (scheduling, player coordination)
  - Real-time chat state management with SignalR integration
  - Scene Builder state management with Konva.js canvas integration
  - Application-wide state management architecture
- **Components**: 
  - **Authentication System**: Login, register, logout, profile management, password reset, 2FA components
  - **Navigation & Layout**: MainLayout, NavBar, responsive design components with Bootstrap integration
  - **Adventure Management**: Adventure list, detail, creation, editing, cloning components
  - **Asset Management**: Asset CRUD components with file upload and categorization
  - **Game Session Management**: Session scheduling, player management, coordination components
  - **Chat System**: Real-time messaging components with SignalR integration
  - **Scene Builder**: Complete Konva.js canvas system with multi-layer architecture (Background, Grid, Assets, UI layers)
  - **Dashboard/Home**: User landing page and navigation hub components
  - **Error Handling**: Error boundary components and user feedback systems
- **Integration**:
  - .NET Aspire service discovery integration with existing backend microservices (Assets, Game, Library, Media, WebApp)
  - SignalR client for real-time collaboration and chat via existing Game service hubs
  - HTTP clients consuming existing API contracts from Domain layer (CreateAssetRequest, UploadRequest, etc.)
  - File upload integration with existing Media service and Azure Blob Storage (10MB limits)
  - Authentication system using dedicated VttTools.Auth microservice (WebApp UI replaced, auth functionality moved to Auth service)
  - HTML5 Audio API integration for basic VTT builder audio feedback

#### Existing Backend Infrastructure (No Changes Required)
#### 2.2.1 Microservice Organization and API Endpoints

**Assets Service** (`VttTools.Assets` - Source\Assets\):
- **Endpoints**: /api/assets/* (CRUD operations, categorization, metadata)
- **Required For**: UC017-UC025 (Asset Management), UC050 (Asset Library)
- **Contracts**: CreateAssetRequest, UpdateAssetRequest, Asset response types
- **Integration**: Asset creation, editing, library browsing, Scene Builder asset selection

**Library Service** (`VttTools.Library` - Source\Library\):
- **Endpoints**: /api/adventures/*, /api/scenes/* (content management, organization)
- **Required For**: UC012-UC016 (Adventure Management), UC047-UC056 (Scene Builder)
- **Contracts**: CreateAdventureRequest, CreateSceneRequest, scene management types
- **Integration**: Adventure CRUD, scene management, Scene Builder data persistence

**Game Service** (`VttTools.Game` - Source\Game\):
- **Endpoints**: /api/sessions/*, /api/chat/* (multiplayer coordination, real-time)
- **Required For**: UC026-UC030 (Sessions and Chat)
- **Contracts**: CreateGameSessionRequest, JoinGameSessionRequest, chat message types
- **Integration**: Session scheduling, real-time chat, multiplayer Scene Builder collaboration

**Media Service** (`VttTools.Media` - Source\Media\):
- **Endpoints**: /api/media/*, /api/resources/* (file processing, storage)
- **Required For**: UC025 (Upload Assets), UC048 (Background Images)
- **Contracts**: UploadRequest, resource management types
- **Integration**: Asset image uploads, background image management, thumbnail generation

**Authentication System** (VttTools.Auth Microservice):
- **Current**: Dedicated VttTools.Auth microservice with /api/auth/* endpoints
- **Required For**: UC003-UC011 (Authentication and Profile)
- **Architecture**: React SPA → auth-api service → ApplicationDbContext
- **Integration**: User authentication, registration, profile management, session management via Auth microservice
- **Location**: Source\Auth\ - ASP.NET Core Identity with rate limiting and CORS support

#### 2.2.2 Infrastructure Components
- **Aspire Orchestration**: Complete AppHost (Source\AppHost\) with service discovery and health monitoring
- **Database**: SQL Server + Redis cache + Azure Blob Storage fully configured
- **Authentication**: ASP.NET Core Identity with external providers and 2FA support
- **SignalR**: Real-time capabilities implemented in Game service, may need Scene Builder enhancement
- **API Contracts**: All request/response types defined in Domain layer for frontend consumption

#### 2.2.3 React Project Replacement Strategy
- **Project Name**: VttTools.WebClientApp
- **Location**: Source\WebClientApp\ (replaces WebApp and WebApp.WebAssembly)
- **Solution Integration**: Add to VttTools.sln in "3 WebApp" solution folder
- **Dependencies**: Reference VttTools.WebApp.Common (if needed) and VttTools.Domain for API contracts
- **Development**: React app runs as part of Aspire orchestration (`dotnet run --project Source/AppHost`)
- **Project Lifecycle**: WebApp and WebApp.WebAssembly projects will be removed after React migration completion

### 3. Implementation Guidelines

**📋 COMPLETE IMPLEMENTATION REFERENCE**: All detailed implementation standards, architectural patterns, coding guidelines, and development workflows have been consolidated into a comprehensive standalone guide.

**📖 Primary Reference**: [`/Documents/IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)

This section provides a high-level overview of the implementation approach for the VTTTools React migration. For complete details, code examples, configuration files, and comprehensive standards, refer to the standalone Implementation Guide.

#### 3.1 React Architecture Standards

**Component Architecture Patterns**
- **Functional Components Only**: Use React 18+ functional components with hooks throughout the entire application - no class components
- **Component Composition**: Follow composition over inheritance patterns using children props and render props
- **Container-Presentational Pattern**: Separate container components (data/logic) from presentational components (UI rendering)
- **Custom Hooks**: Extract reusable logic into custom hooks following the `use` prefix convention
- **Error Boundaries**: Implement error boundaries for feature isolation and graceful failure handling

```typescript
// Component Structure Standard
interface ComponentProps {
  // Props interface with explicit types
  data: DataType;
  onAction: (payload: ActionPayload) => void;
  className?: string;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ 
  data, 
  onAction, 
  className = '', 
  children 
}) => {
  // Custom hooks for logic
  const { state, actions } = useFeatureState(data);
  const { loading, error } = useAsync(actions.fetchData);

  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <div className={`component-root ${className}`}>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

**File Organization Structure**
```
src/
├── components/              # Reusable React components
│   ├── ui/                 # Basic UI components (Button, Input, Modal)
│   ├── forms/              # Form components with validation
│   ├── layout/             # Layout and navigation components
│   ├── auth/               # Authentication-specific components
│   ├── canvas/             # Konva.js Scene Builder components
│   └── shared/             # Cross-feature shared components
├── pages/                  # Page-level route components
│   ├── auth/               # Authentication pages
│   ├── adventures/         # Adventure management pages
│   ├── assets/             # Asset management pages
│   ├── sessions/           # Game session pages
│   ├── chat/               # Chat system pages
│   └── scenes/             # Scene Builder pages
├── hooks/                  # Custom React hooks
├── services/               # API clients and business logic
├── store/                  # Redux Toolkit state management
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and helpers
├── constants/              # Application constants
└── styles/                 # Global styles and theme definitions
```

#### 3.2 TypeScript Standards

**Strict Configuration Requirements**
```json
// tsconfig.json - Strict Mode Settings
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "noImplicitAny": true,            // No implicit any types
    "exactOptionalPropertyTypes": true, // Strict optional properties
    "noImplicitReturns": true,        // Explicit return statements
    "noFallthroughCasesInSwitch": true, // Complete switch cases
    "noUncheckedIndexedAccess": true   // Safe array/object access
  }
}
```

**Type Definition Patterns**
```typescript
// Interface Naming Convention
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Component Prop Types with Generics
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick: (item: T) => void;
  loading?: boolean;
}

// Utility Types for State Management
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Discriminated Unions for Complex State
type AuthState = 
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: string };
```

**Module Augmentation for Libraries**
```typescript
// Material UI Theme Customization
declare module '@mui/material/styles' {
  interface TypographyVariants {
    vttHeading: React.CSSProperties;
    vttBody: React.CSSProperties;
  }
  
  interface Palette {
    vttPrimary: {
      main: string;
      canvas: string;
      panel: string;
    };
  }
}
```

#### 3.3 VTTTools Professional Design System

**Color Palette Standards**
```typescript
// Professional VTT Creator Color System
export const vttColors = {
  // Primary Studio Colors
  primary: {
    main: '#2563EB',        // Primary actions, tools
    light: '#3B82F6',       // Hover states
    dark: '#1D4ED8',        // Active states
  },
  
  // Secondary Creative Colors
  secondary: {
    main: '#7C3AED',        // Secondary actions
    light: '#8B5CF6',       // Highlights
    dark: '#6D28D9',        // Pressed states
  },
  
  // Canvas-Optimized Neutrals
  canvas: {
    white: '#FEFEFE',       // Main canvas background
    panel: '#F9FAFB',       // Tool panels
    border: '#E5E7EB',      // Component borders
  },
  
  // Content Hierarchy
  text: {
    primary: '#111827',     // Headers, important text
    secondary: '#4B5563',   // Body text, labels
    tertiary: '#9CA3AF',    // Supporting text
    disabled: '#D1D5DB',    // Disabled states
  },
  
  // State Colors
  success: '#059669',       // Confirmations, saves
  warning: '#D97706',       // Important actions
  error: '#DC2626',         // Errors, destructive actions
  info: '#0D9488',          // Informational states
} as const;
```

**Material UI Theme Configuration**
```typescript
import { createTheme, ThemeOptions } from '@mui/material/styles';

export const vttToolsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6', 
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#7C3AED',
      light: '#8B5CF6',
      dark: '#6D28D9',
    },
    background: {
      default: '#F9FAFB',    // Panel background
      paper: '#FFFFFF',       // Component background
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },
  
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'system-ui',
    ].join(','),
    
    // VTT-Specific Typography
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
    button: { 
      fontSize: '0.875rem', 
      fontWeight: 500, 
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  
  spacing: 8,
  shape: { borderRadius: 8 },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05)',
          },
        },
      },
    },
  },
} as ThemeOptions);
```

**Layout System - Canvas-Centric Grid**
```scss
// 24-Column Grid System for Complex VTT Layouts
.vtt-container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 16px;
  min-height: 100vh;
}

// VTT-Specific Layout Classes
.vtt-sidebar-left {      // Asset library, tools
  grid-column: span 4;
  min-width: 280px;
  background: #F9FAFB;
}

.vtt-canvas-main {       // Scene Builder canvas area
  grid-column: span 16;
  min-height: calc(100vh - 64px);
  background: #FEFEFE;
}

.vtt-sidebar-right {     // Properties, layers
  grid-column: span 4;
  min-width: 280px;
  background: #F9FAFB;
}

.vtt-toolbar-top {       // Main application toolbar
  grid-column: span 24;
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
}

// Responsive Behavior
@media (max-width: 1280px) {
  .vtt-sidebar-left,
  .vtt-sidebar-right {
    position: fixed;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
  
  .vtt-canvas-main {
    grid-column: span 24;
  }
}
```

**Typography Scale for VTT Applications**
```typescript
// VTT-Optimized Typography System
export const vttTypography = {
  // Professional Interface Headers
  pageTitle: {
    fontSize: '2.25rem',    // 36px - Modal headers, page titles
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  
  sectionHeader: {
    fontSize: '1.5rem',     // 24px - Panel sections, feature areas  
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  componentTitle: {
    fontSize: '1.25rem',    // 20px - Component headers, card titles
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Content Text
  bodyLarge: {
    fontSize: '1.125rem',   // 18px - Primary content
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  bodyStandard: {
    fontSize: '1rem',       // 16px - Standard interface text
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  bodySmall: {
    fontSize: '0.875rem',   // 14px - Secondary text, labels
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // UI Elements
  buttonLarge: {
    fontSize: '1rem',       // 16px - Primary action buttons
    fontWeight: 500,
    letterSpacing: '0.025em',
    textTransform: 'none' as const,
  },
  
  buttonStandard: {
    fontSize: '0.875rem',   // 14px - Standard buttons
    fontWeight: 500,
    letterSpacing: '0.025em',
    textTransform: 'none' as const,
  },
  
  label: {
    fontSize: '0.875rem',   // 14px - Form labels
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Technical Data (Coordinates, IDs)
  monospace: {
    fontFamily: [
      '"JetBrains Mono"',
      'Consolas',
      '"Monaco"',
      '"Courier New"',
      'monospace'
    ].join(','),
    fontSize: '0.875rem',   // 14px
    fontWeight: 400,
    lineHeight: 1.4,
  },
} as const;
```

#### 3.4 Konva.js Canvas Integration Standards

**Performance-Optimized Canvas Architecture**
```typescript
// Multi-layer Canvas Structure with Performance Optimization
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';

interface SceneBuilderCanvasProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
  canvasSize: { width: number; height: number };
}

const SceneBuilderCanvas: React.FC<SceneBuilderCanvasProps> = ({
  scene,
  onSceneUpdate,
  canvasSize,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const backgroundLayerRef = useRef<Konva.Layer>(null);
  const gridLayerRef = useRef<Konva.Layer>(null);
  const assetsLayerRef = useRef<Konva.Layer>(null);
  const dragLayerRef = useRef<Konva.Layer>(null);

  // Performance optimization: disable listening on static layers
  useEffect(() => {
    if (backgroundLayerRef.current) {
      backgroundLayerRef.current.listening(false);
    }
    if (gridLayerRef.current) {
      gridLayerRef.current.listening(false);
    }
  }, []);

  return (
    <Stage
      width={canvasSize.width}
      height={canvasSize.height}
      ref={stageRef}
      onWheel={handleZoom}
      onMouseDown={handleCanvasInteraction}
    >
      {/* Background Layer - Static, no event listening */}
      <Layer ref={backgroundLayerRef} listening={false}>
        <BackgroundImage imageUrl={scene.backgroundUrl} />
      </Layer>

      {/* Grid Layer - Static, performance optimized */}
      <Layer ref={gridLayerRef} listening={false}>
        <GridSystem 
          type={scene.grid.type} 
          size={scene.grid.size}
          visible={scene.grid.visible}
        />
      </Layer>

      {/* Assets Layer - Interactive elements */}
      <Layer ref={assetsLayerRef}>
        {scene.assets.map(asset => (
          <AssetShape
            key={asset.id}
            asset={asset}
            onUpdate={handleAssetUpdate}
            onDragStart={moveAssetToDragLayer}
            onDragEnd={moveAssetFromDragLayer}
            perfectDrawEnabled={false} // Performance optimization
          />
        ))}
      </Layer>

      {/* Drag Layer - Temporary layer for dragging performance */}
      <Layer ref={dragLayerRef} />
    </Stage>
  );
};
```

**Konva.js Performance Optimization Patterns**
```typescript
// Asset Shape Component with Caching and Performance Features
interface AssetShapeProps {
  asset: SceneAsset;
  onUpdate: (asset: SceneAsset) => void;
  onDragStart: (asset: SceneAsset) => void;
  onDragEnd: (asset: SceneAsset) => void;
}

const AssetShape: React.FC<AssetShapeProps> = ({
  asset,
  onUpdate,
  onDragStart,
  onDragEnd,
}) => {
  const shapeRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load and cache image
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      // Cache the shape for better performance
      setTimeout(() => {
        if (shapeRef.current) {
          shapeRef.current.cache();
          shapeRef.current.getLayer()?.batchDraw();
        }
      }, 0);
    };
    img.src = asset.imageUrl;
  }, [asset.imageUrl]);

  const handleDragStart = useCallback(() => {
    // Move to drag layer for performance during dragging
    const shape = shapeRef.current;
    if (shape && shape.getParent()) {
      const stage = shape.getStage();
      const dragLayer = stage?.findOne('.drag-layer');
      if (dragLayer) {
        shape.moveTo(dragLayer);
        dragLayer.draw();
      }
    }
    onDragStart(asset);
  }, [asset, onDragStart]);

  const handleDragEnd = useCallback((e: any) => {
    const shape = shapeRef.current;
    if (shape) {
      // Move back to assets layer
      const stage = shape.getStage();
      const assetsLayer = stage?.findOne('.assets-layer');
      if (assetsLayer) {
        shape.moveTo(assetsLayer);
        assetsLayer.draw();
      }

      // Update asset position
      const updatedAsset = {
        ...asset,
        x: e.target.x(),
        y: e.target.y(),
      };
      onUpdate(updatedAsset);
    }
    onDragEnd(asset);
  }, [asset, onUpdate, onDragEnd]);

  if (!image) return null;

  return (
    <Image
      ref={shapeRef}
      image={image}
      x={asset.x}
      y={asset.y}
      scaleX={asset.scaleX}
      scaleY={asset.scaleY}
      rotation={asset.rotation}
      draggable={!asset.locked}
      perfectDrawEnabled={false} // Performance optimization
      listening={!asset.locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransform={handleTransform}
    />
  );
};

// Custom hook for Konva performance monitoring
const useKonvaPerformance = () => {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFps);
    };
    
    measureFps();
  }, []);
  
  return fps;
};
```

**Canvas Layer Management Standards**
```typescript
// Layer Configuration for Optimal Performance
export const CANVAS_LAYERS = {
  BACKGROUND: {
    name: 'background-layer',
    listening: false,        // No event handling needed
    visible: true,
    clearBeforeDraw: true,
  },
  
  GRID: {
    name: 'grid-layer', 
    listening: false,        // Static grid, no interaction
    visible: true,
    clearBeforeDraw: false,  // Grid doesn't change often
  },
  
  ASSETS: {
    name: 'assets-layer',
    listening: true,         // Interactive assets
    visible: true,
    clearBeforeDraw: true,
  },
  
  DRAG: {
    name: 'drag-layer',
    listening: false,        // Temporary drag operations
    visible: true,
    clearBeforeDraw: true,
  },
  
  UI: {
    name: 'ui-layer',
    listening: true,         // Selection indicators, handles
    visible: true,
    clearBeforeDraw: true,
  },
} as const;

// Grid System Performance Optimization
const GridSystem: React.FC<GridProps> = ({ type, size, visible }) => {
  const gridRef = useRef<Konva.Group>(null);
  
  // Cache grid when size or type changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.cache();
      gridRef.current.getLayer()?.batchDraw();
    }
  }, [type, size]);
  
  if (!visible) return null;
  
  return (
    <Group ref={gridRef} listening={false}>
      {/* Grid rendering based on type */}
      {generateGridLines(type, size)}
    </Group>
  );
};
```

#### 3.5 State Management Architecture

**Redux Toolkit with RTK Query Standards**
```typescript
// Store Configuration with Performance Middleware
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { adventuresApi } from './api/adventuresApi';
import { assetsApi } from './api/assetsApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    // RTK Query API slices
    [authApi.reducerPath]: authApi.reducer,
    [adventuresApi.reducerPath]: adventuresApi.reducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'canvas/updateAssetImage', // Ignore File objects
        ],
      },
    })
    .concat(authApi.middleware)
    .concat(adventuresApi.middleware)
    .concat(assetsApi.middleware),
    
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**RTK Query API Standards**
```typescript
// API Slice with Authentication and Error Handling
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    if (refreshResult.data) {
      api.dispatch(authSlice.actions.tokenRefreshed(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(authSlice.actions.logout());
    }
  }
  
  return result;
};

export const adventuresApi = createApi({
  reducerPath: 'adventuresApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Adventure', 'Scene'],
  
  endpoints: (builder) => ({
    getAdventures: builder.query<Adventure[], void>({
      query: () => '/adventures',
      providesTags: ['Adventure'],
    }),
    
    createAdventure: builder.mutation<Adventure, Partial<Adventure>>({
      query: (adventure) => ({
        url: '/adventures',
        method: 'POST',
        body: adventure,
      }),
      invalidatesTags: ['Adventure'],
    }),
    
    updateAdventure: builder.mutation<Adventure, { id: string; updates: Partial<Adventure> }>({
      query: ({ id, updates }) => ({
        url: `/adventures/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Adventure'],
    }),
  }),
});

export const { 
  useGetAdventuresQuery,
  useCreateAdventureMutation,
  useUpdateAdventureMutation,
} = adventuresApi;
```

**Custom Hooks for Complex State Logic**
```typescript
// Scene Builder State Management Hook
export const useSceneBuilder = (sceneId: string) => {
  const [localScene, setLocalScene] = useState<Scene | null>(null);
  const [undoStack, setUndoStack] = useState<Scene[]>([]);
  const [redoStack, setRedoStack] = useState<Scene[]>([]);
  
  const { data: scene, isLoading } = useGetSceneQuery(sceneId);
  const [updateScene] = useUpdateSceneMutation();
  
  // Debounced auto-save
  const debouncedSave = useMemo(
    () => debounce((scene: Scene) => {
      updateScene({ id: sceneId, updates: scene });
    }, 2000),
    [sceneId, updateScene]
  );
  
  const updateSceneWithHistory = useCallback((updatedScene: Scene) => {
    if (localScene) {
      // Add current state to undo stack
      setUndoStack(prev => [...prev.slice(-19), localScene]); // Keep last 20 states
      setRedoStack([]); // Clear redo stack on new action
    }
    
    setLocalScene(updatedScene);
    debouncedSave(updatedScene);
  }, [localScene, debouncedSave]);
  
  const undo = useCallback(() => {
    if (undoStack.length > 0 && localScene) {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [localScene, ...prev.slice(0, 19)]);
      setLocalScene(previousState);
      debouncedSave(previousState);
    }
  }, [undoStack, localScene, debouncedSave]);
  
  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setRedoStack(prev => prev.slice(1));
      setUndoStack(prev => [...prev, localScene!]);
      setLocalScene(nextState);
      debouncedSave(nextState);
    }
  }, [redoStack, localScene, debouncedSave]);
  
  // Initialize local scene when data loads
  useEffect(() => {
    if (scene && !localScene) {
      setLocalScene(scene);
    }
  }, [scene, localScene]);
  
  return {
    scene: localScene,
    isLoading,
    updateScene: updateSceneWithHistory,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};

// Authentication State Management Hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(state => state.auth);
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(authApi.endpoints.login.initiate(credentials));
      if ('data' in result) {
        dispatch(authSlice.actions.loginSuccess(result.data));
      }
      return result;
    } catch (error) {
      dispatch(authSlice.actions.loginFailure(error as string));
      throw error;
    }
  }, [dispatch]);
  
  const logout = useCallback(() => {
    dispatch(authSlice.actions.logout());
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);
  
  return {
    user,
    token, 
    isAuthenticated,
    login,
    logout,
  };
};
```

#### 3.6 Performance Optimization Standards

**Code Splitting and Lazy Loading**
```typescript
// Route-based Code Splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load major features
const AdventuresModule = lazy(() => import('../pages/adventures/AdventuresModule'));
const AssetsModule = lazy(() => import('../pages/assets/AssetsModule'));
const SessionsModule = lazy(() => import('../pages/sessions/SessionsModule'));
const SceneBuilderModule = lazy(() => import('../pages/scenes/SceneBuilderModule'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/adventures/*" 
        element={
          <Suspense fallback={<ModuleLoadingSpinner />}>
            <AdventuresModule />
          </Suspense>
        } 
      />
      <Route 
        path="/assets/*" 
        element={
          <Suspense fallback={<ModuleLoadingSpinner />}>
            <AssetsModule />
          </Suspense>
        } 
      />
      <Route 
        path="/sessions/*" 
        element={
          <Suspense fallback={<ModuleLoadingSpinner />}>
            <SessionsModule />
          </Suspense>
        } 
      />
      <Route 
        path="/scenes/*" 
        element={
          <Suspense fallback={<ModuleLoadingSpinner />}>
            <SceneBuilderModule />
          </Suspense>
        } 
      />
    </Routes>
  );
};
```

**React Performance Optimization Hooks**
```typescript
// Performance-optimized Component Patterns
const ExpensiveComponent: React.FC<Props> = ({ data, onUpdate }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);
  
  // Memoize callback functions
  const handleUpdate = useCallback((id: string, updates: any) => {
    onUpdate(id, updates);
  }, [onUpdate]);
  
  // Memoize child components
  const MemoizedChild = useMemo(() => React.memo(ChildComponent), []);
  
  return (
    <div>
      {processedData.map(item => (
        <MemoizedChild
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
};

// High-performance List Component with Virtualization
import { FixedSizeList as List } from 'react-window';

interface VirtualizedAssetListProps {
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
}

const VirtualizedAssetList: React.FC<VirtualizedAssetListProps> = ({
  assets,
  onAssetSelect,
}) => {
  const ItemRenderer = useCallback(({ index, style }: any) => {
    const asset = assets[index];
    return (
      <div style={style}>
        <AssetCard asset={asset} onSelect={onAssetSelect} />
      </div>
    );
  }, [assets, onAssetSelect]);
  
  return (
    <List
      height={600}
      itemCount={assets.length}
      itemSize={120}
      overscanCount={5}
    >
      {ItemRenderer}
    </List>
  );
};
```

**Bundle Optimization Configuration**
```typescript
// Vite Configuration for Performance
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          canvas: ['konva', 'react-konva'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          api: ['axios', '@microsoft/signalr'],
        },
      },
    },
    
    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Development optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'konva', 'react-konva'],
  },
});
```

#### 3.7 Testing Standards

**Unit Testing with Jest and React Testing Library**
```typescript
// Component Testing Standards
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdventureCard from './AdventureCard';

// Test wrapper with all providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      adventures: adventuresSlice.reducer,
    },
    preloadedState: {
      adventures: mockAdventuresState,
    },
  });

  return render(
    <Provider store={store}>
      <ThemeProvider theme={vttToolsTheme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('AdventureCard', () => {
  const mockAdventure: Adventure = {
    id: '1',
    title: 'Test Adventure',
    description: 'Test description',
    imageUrl: '/test-image.jpg',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders adventure information correctly', () => {
    renderWithProviders(
      <AdventureCard
        adventure={mockAdventure}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Adventure')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
  });

  it('calls onEdit when edit button is clicked', async () => {
    renderWithProviders(
      <AdventureCard
        adventure={mockAdventure}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockAdventure);
    });
  });

  it('handles loading state correctly', () => {
    renderWithProviders(
      <AdventureCard
        adventure={mockAdventure}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading
      />
    );

    expect(screen.getByTestId('adventure-card-skeleton')).toBeInTheDocument();
  });
});
```

**Integration Testing with MSW**
```typescript
// API Integration Testing with Mock Service Worker
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import AdventuresList from './AdventuresList';

// Mock API handlers
const handlers = [
  rest.get('/api/adventures', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', title: 'Adventure 1', description: 'Description 1' },
        { id: '2', title: 'Adventure 2', description: 'Description 2' },
      ])
    );
  }),
  
  rest.post('/api/adventures', (req, res, ctx) => {
    return res(
      ctx.json({ id: '3', title: 'New Adventure', description: 'New Description' })
    );
  }),
  
  rest.delete('/api/adventures/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AdventuresList Integration', () => {
  it('loads and displays adventures from API', async () => {
    render(
      <Provider store={store}>
        <AdventuresList />
      </Provider>
    );

    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByText('Adventure 1')).toBeInTheDocument();
      expect(screen.getByText('Adventure 2')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override handler to return error
    server.use(
      rest.get('/api/adventures', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(
      <Provider store={store}>
        <AdventuresList />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading adventures/i)).toBeInTheDocument();
    });
  });
});
```

**E2E Testing with Playwright**
```typescript
// End-to-End Scene Builder Testing
import { test, expect } from '@playwright/test';

test.describe('Scene Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to scene builder
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await page.click('[data-testid="scene-builder-nav"]');
  });

  test('should create new scene with background image', async ({ page }) => {
    // Click new scene button
    await page.click('[data-testid="new-scene-button"]');
    
    // Upload background image
    const fileInput = page.locator('[data-testid="background-upload"]');
    await fileInput.setInputFiles('./test-assets/battle-map.jpg');
    
    // Wait for image to load
    await expect(page.locator('[data-testid="canvas-background"]')).toBeVisible();
    
    // Verify canvas dimensions adjusted to image
    const canvas = page.locator('[data-testid="scene-canvas"]');
    const { width, height } = await canvas.boundingBox() || { width: 0, height: 0 };
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('should add and manipulate assets on canvas', async ({ page }) => {
    // Open asset library
    await page.click('[data-testid="asset-library-button"]');
    
    // Select an asset
    await page.click('[data-testid="asset-item-character-1"]');
    
    // Drag asset to canvas
    const asset = page.locator('[data-testid="asset-item-character-1"]');
    const canvas = page.locator('[data-testid="scene-canvas"]');
    await asset.dragTo(canvas);
    
    // Verify asset appears on canvas
    await expect(page.locator('[data-testid="canvas-asset-character-1"]')).toBeVisible();
    
    // Test asset rotation
    await page.click('[data-testid="canvas-asset-character-1"]');
    await page.click('[data-testid="rotation-handle"]');
    await page.mouse.move(400, 300);
    await page.mouse.up();
    
    // Verify asset rotated
    const transform = await page.getAttribute('[data-testid="canvas-asset-character-1"]', 'transform');
    expect(transform).toContain('rotate');
  });

  test('should save and load scene state', async ({ page }) => {
    // Create scene with assets
    await page.click('[data-testid="new-scene-button"]');
    // ... add background and assets ...
    
    // Save scene
    await page.click('[data-testid="save-scene-button"]');
    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible();
    
    // Navigate away and back
    await page.click('[data-testid="dashboard-nav"]');
    await page.click('[data-testid="scene-builder-nav"]');
    
    // Verify scene state restored
    await expect(page.locator('[data-testid="canvas-background"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-asset-character-1"]')).toBeVisible();
  });

  test('should handle canvas performance with many assets', async ({ page }) => {
    // Add multiple assets to test performance
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="asset-library-button"]');
      await page.click(`[data-testid="asset-item-${i % 5}"]`);
      await page.mouse.click(200 + (i % 5) * 50, 200 + Math.floor(i / 5) * 50);
    }
    
    // Test canvas responsiveness
    const startTime = Date.now();
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(400, 400);
    await page.mouse.up();
    const endTime = Date.now();
    
    // Verify interaction completed within performance threshold
    expect(endTime - startTime).toBeLessThan(500); // 500ms threshold
    
    // Check frame rate indicator
    const fpsIndicator = page.locator('[data-testid="fps-counter"]');
    const fps = parseInt(await fpsIndicator.textContent() || '0');
    expect(fps).toBeGreaterThan(30); // Minimum 30 FPS
  });
});
```

#### 3.8 Error Handling and Logging Standards

**Error Boundary Implementation**
```typescript
// Global Error Boundary with User-Friendly Recovery
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to error reporting service
    console.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userId: getCurrentUserId(),
      timestamp: new Date().toISOString(),
    });
    
    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      reportError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

// User-friendly Error Fallback Component
interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  const handleReportIssue = () => {
    // Open issue reporting modal or external link
    window.open('/support/report-issue', '_blank');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
    >
      <Typography variant="h4" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={600}>
        We're sorry, but something unexpected happened. This error has been reported 
        to our team. You can try refreshing the page or return to the dashboard.
      </Typography>
      
      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" onClick={handleReload}>
          Refresh Page
        </Button>
        <Button variant="outlined" onClick={() => window.location.href = '/dashboard'}>
          Return to Dashboard
        </Button>
        <Button variant="text" onClick={handleReportIssue}>
          Report Issue
        </Button>
      </Box>

      {process.env.NODE_ENV === 'development' && error && (
        <Box mt={3} maxWidth={800} width="100%">
          <Typography variant="h6">Error Details (Development Mode)</Typography>
          <pre style={{ background: '#f5f5f5', padding: 16, overflow: 'auto' }}>
            {error.stack}
          </pre>
        </Box>
      )}
    </Box>
  );
};
```

**API Error Handling Standards**
```typescript
// Standardized API Error Response Handling
interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, any>;
}

interface ApiErrorResponse {
  success: false;
  errors: ApiError[];
  timestamp: string;
  path: string;
}

// Error handling utility functions
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.errors) {
    return error.response.data.errors[0]?.message || 'An error occurred';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return !error?.response && error?.request;
};

// React Hook for Error Handling
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<string[]>([]);
  
  const addError = useCallback((error: string) => {
    setErrors(prev => [...prev, error]);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  }, []);
  
  const removeError = useCallback((error: string) => {
    setErrors(prev => prev.filter(e => e !== error));
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  const handleApiError = useCallback((error: any) => {
    const errorMessage = handleApiError(error);
    addError(errorMessage);
    
    // Log detailed error for debugging
    console.error('API Error:', {
      message: errorMessage,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
    });
  }, [addError]);
  
  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleApiError,
  };
};

// Error Display Component
const ErrorDisplay: React.FC<{ errors: string[]; onDismiss: (error: string) => void }> = ({
  errors,
  onDismiss,
}) => {
  return (
    <Snackbar
      open={errors.length > 0}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <div>
        {errors.map((error, index) => (
          <Alert
            key={index}
            severity="error"
            onClose={() => onDismiss(error)}
            sx={{ mb: 1 }}
          >
            {error}
          </Alert>
        ))}
      </div>
    </Snackbar>
  );
};
```

#### 3.9 SignalR Real-time Integration Standards

**SignalR Connection Management**
```typescript
// SignalR Service with Automatic Reconnection
import { 
  HubConnection, 
  HubConnectionBuilder, 
  LogLevel,
  HubConnectionState 
} from '@microsoft/signalr';

class SignalRService {
  private connections: Map<string, HubConnection> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  async createConnection(
    hubName: string, 
    hubUrl: string, 
    accessToken: string
  ): Promise<HubConnection> {
    if (this.connections.has(hubName)) {
      return this.connections.get(hubName)!;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 10, 30 seconds, then every 30 seconds
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Connection event handlers
    connection.onclose((error) => {
      console.log(`SignalR connection '${hubName}' closed:`, error);
      this.handleConnectionClosed(hubName, connection);
    });

    connection.onreconnecting((error) => {
      console.log(`SignalR connection '${hubName}' reconnecting:`, error);
      this.handleReconnecting(hubName);
    });

    connection.onreconnected(() => {
      console.log(`SignalR connection '${hubName}' reconnected`);
      this.handleReconnected(hubName);
      this.reconnectAttempts.set(hubName, 0);
    });

    try {
      await connection.start();
      this.connections.set(hubName, connection);
      console.log(`SignalR connection '${hubName}' established`);
      return connection;
    } catch (error) {
      console.error(`Failed to start SignalR connection '${hubName}':`, error);
      throw error;
    }
  }

  private handleConnectionClosed(hubName: string, connection: HubConnection) {
    const attempts = this.reconnectAttempts.get(hubName) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for '${hubName}'`);
      this.connections.delete(hubName);
      // Notify user of connection failure
      this.notifyConnectionFailure(hubName);
      return;
    }

    this.reconnectAttempts.set(hubName, attempts + 1);
  }

  private handleReconnecting(hubName: string) {
    // Update UI to show reconnecting state
    this.notifyReconnecting(hubName);
  }

  private handleReconnected(hubName: string) {
    // Update UI to show connected state
    this.notifyReconnected(hubName);
  }

  private notifyConnectionFailure(hubName: string) {
    // Dispatch event or update global state
    window.dispatchEvent(new CustomEvent('signalr-connection-failed', {
      detail: { hubName }
    }));
  }

  private notifyReconnecting(hubName: string) {
    window.dispatchEvent(new CustomEvent('signalr-reconnecting', {
      detail: { hubName }
    }));
  }

  private notifyReconnected(hubName: string) {
    window.dispatchEvent(new CustomEvent('signalr-reconnected', {
      detail: { hubName }
    }));
  }

  getConnection(hubName: string): HubConnection | undefined {
    return this.connections.get(hubName);
  }

  async closeConnection(hubName: string): Promise<void> {
    const connection = this.connections.get(hubName);
    if (connection && connection.state === HubConnectionState.Connected) {
      await connection.stop();
      this.connections.delete(hubName);
    }
  }

  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.keys())
      .map(hubName => this.closeConnection(hubName));
    await Promise.all(closePromises);
  }
}

// Singleton instance
export const signalRService = new SignalRService();
```

**Chat System Implementation**
```typescript
// Chat Hook with SignalR Integration
export const useChat = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { addError } = useErrorHandler();

  useEffect(() => {
    let connection: HubConnection;

    const initializeChat = async () => {
      try {
        connection = await signalRService.createConnection(
          'chat',
          '/hubs/chat',
          user?.token || ''
        );

        // Join session chat room
        await connection.invoke('JoinSession', sessionId);
        
        // Set up message handlers
        connection.on('ReceiveMessage', (message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
        });

        connection.on('UserTyping', (username: string) => {
          setTypingUsers(prev => 
            prev.includes(username) ? prev : [...prev, username]
          );
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== username));
          }, 3000);
        });

        connection.on('UserStoppedTyping', (username: string) => {
          setTypingUsers(prev => prev.filter(u => u !== username));
        });

        setConnectionState('connected');
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        addError('Failed to connect to chat');
        setConnectionState('disconnected');
      }
    };

    // Handle SignalR events
    const handleReconnecting = () => setConnectionState('connecting');
    const handleReconnected = () => setConnectionState('connected');
    const handleConnectionFailed = () => {
      setConnectionState('disconnected');
      addError('Chat connection lost. Please refresh to reconnect.');
    };

    window.addEventListener('signalr-reconnecting', handleReconnecting);
    window.addEventListener('signalr-reconnected', handleReconnected);
    window.addEventListener('signalr-connection-failed', handleConnectionFailed);

    initializeChat();

    return () => {
      window.removeEventListener('signalr-reconnecting', handleReconnecting);
      window.removeEventListener('signalr-reconnected', handleReconnected);
      window.removeEventListener('signalr-connection-failed', handleConnectionFailed);
      
      if (connection) {
        connection.invoke('LeaveSession', sessionId).catch(console.error);
      }
    };
  }, [sessionId, user?.token, addError]);

  const sendMessage = useCallback(async (content: string) => {
    const connection = signalRService.getConnection('chat');
    if (connection && connectionState === 'connected') {
      try {
        await connection.invoke('SendMessage', sessionId, content);
      } catch (error) {
        console.error('Failed to send message:', error);
        addError('Failed to send message');
      }
    }
  }, [sessionId, connectionState, addError]);

  const sendTyping = useCallback(async () => {
    const connection = signalRService.getConnection('chat');
    if (connection && connectionState === 'connected') {
      try {
        await connection.invoke('NotifyTyping', sessionId);
      } catch (error) {
        console.error('Failed to send typing notification:', error);
      }
    }
  }, [sessionId, connectionState]);

  const stopTyping = useCallback(async () => {
    const connection = signalRService.getConnection('chat');
    if (connection && connectionState === 'connected') {
      try {
        await connection.invoke('StopTyping', sessionId);
      } catch (error) {
        console.error('Failed to send stop typing notification:', error);
      }
    }
  }, [sessionId, connectionState]);

  return {
    messages,
    connectionState,
    typingUsers,
    sendMessage,
    sendTyping,
    stopTyping,
  };
};
```

#### 3.10 Audio System Integration

**Basic HTML5 Audio Manager**
```typescript
// Lightweight Audio System for VTT Features
class VTTAudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private ambientAudio: HTMLAudioElement | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.7,
    sfxVolume: 0.5,
    ambientVolume: 0.3,
    notificationVolume: 0.6,
    muted: false,
  };

  // Load and cache audio files
  async loadSound(id: string, url: string, category: 'sfx' | 'notification' = 'sfx'): Promise<void> {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      
      // Set initial volume based on category
      const volume = this.getCategoryVolume(category);
      audio.volume = volume;
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
      });
      
      this.sounds.set(id, audio);
    } catch (error) {
      console.warn(`Failed to load audio: ${id}`, error);
    }
  }

  // Play sound effects (non-looping)
  playSound(id: string, volume?: number): void {
    if (this.settings.muted) return;
    
    const audio = this.sounds.get(id);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume ?? this.getCategoryVolume('sfx');
      audio.play().catch(error => {
        console.warn(`Failed to play sound: ${id}`, error);
      });
    }
  }

  // Play ambient background audio (looping)
  playAmbient(url: string, fadeIn: boolean = true): void {
    if (this.settings.muted) return;
    
    this.stopAmbient();
    
    this.ambientAudio = new Audio(url);
    this.ambientAudio.loop = true;
    this.ambientAudio.volume = fadeIn ? 0 : this.getCategoryVolume('ambient');
    
    this.ambientAudio.play().catch(error => {
      console.warn('Failed to play ambient audio:', error);
    });
    
    if (fadeIn) {
      this.fadeIn(this.ambientAudio, this.getCategoryVolume('ambient'), 2000);
    }
  }

  // Stop ambient audio with optional fade out
  stopAmbient(fadeOut: boolean = true): void {
    if (this.ambientAudio) {
      if (fadeOut) {
        this.fadeOut(this.ambientAudio, 1000).then(() => {
          this.ambientAudio?.pause();
          this.ambientAudio = null;
        });
      } else {
        this.ambientAudio.pause();
        this.ambientAudio = null;
      }
    }
  }

  // Notification sounds with specific handling
  playNotification(type: 'message' | 'turn' | 'alert' | 'success' | 'error'): void {
    if (this.settings.muted) return;
    
    // Use different sounds for different notification types
    const soundId = `notification-${type}`;
    this.playSound(soundId, this.getCategoryVolume('notification'));
  }

  // UI feedback sounds for Scene Builder interactions
  playUIFeedback(action: 'place' | 'select' | 'move' | 'rotate' | 'scale' | 'delete'): void {
    if (this.settings.muted) return;
    
    const soundId = `ui-${action}`;
    this.playSound(soundId, this.getCategoryVolume('sfx') * 0.3); // Quieter for UI
  }

  // Volume and settings management
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setCategoryVolume(category: keyof Omit<AudioSettings, 'masterVolume' | 'muted'>, volume: number): void {
    this.settings[category] = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMuted(muted: boolean): void {
    this.settings.muted = muted;
    if (muted) {
      this.stopAmbient(false);
    }
  }

  private getCategoryVolume(category: 'sfx' | 'ambient' | 'notification'): number {
    if (this.settings.muted) return 0;
    
    const categoryVolume = category === 'sfx' ? this.settings.sfxVolume
      : category === 'ambient' ? this.settings.ambientVolume
      : this.settings.notificationVolume;
    
    return categoryVolume * this.settings.masterVolume;
  }

  private updateAllVolumes(): void {
    // Update cached sounds
    this.sounds.forEach((audio, id) => {
      const category = id.startsWith('notification-') ? 'notification' : 'sfx';
      audio.volume = this.getCategoryVolume(category as any);
    });
    
    // Update ambient audio
    if (this.ambientAudio) {
      this.ambientAudio.volume = this.getCategoryVolume('ambient');
    }
  }

  private async fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = 50;
      const stepVolume = targetVolume / steps;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        audio.volume = stepVolume * currentStep;
        
        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  }

  private async fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const initialVolume = audio.volume;
      const steps = 50;
      const stepVolume = initialVolume / steps;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        audio.volume = initialVolume - (stepVolume * currentStep);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          audio.volume = 0;
          resolve();
        }
      }, stepDuration);
    });
  }

  // Get current settings for UI display
  getSettings(): AudioSettings {
    return { ...this.settings };
  }
}

// Audio settings interface
interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  notificationVolume: number;
  muted: boolean;
}

// Singleton audio manager
export const vttAudioManager = new VTTAudioManager();

// React hook for audio management
export const useAudio = () => {
  const [settings, setSettings] = useState<AudioSettings>(vttAudioManager.getSettings());

  useEffect(() => {
    // Initialize default sounds
    const initializeSounds = async () => {
      await vttAudioManager.loadSound('ui-place', '/audio/ui-place.wav', 'sfx');
      await vttAudioManager.loadSound('ui-select', '/audio/ui-select.wav', 'sfx');
      await vttAudioManager.loadSound('ui-move', '/audio/ui-move.wav', 'sfx');
      await vttAudioManager.loadSound('ui-delete', '/audio/ui-delete.wav', 'sfx');
      await vttAudioManager.loadSound('notification-message', '/audio/notification-message.wav', 'notification');
      await vttAudioManager.loadSound('notification-turn', '/audio/notification-turn.wav', 'notification');
      await vttAudioManager.loadSound('notification-success', '/audio/notification-success.wav', 'notification');
      await vttAudioManager.loadSound('notification-error', '/audio/notification-error.wav', 'notification');
    };

    initializeSounds().catch(console.warn);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    Object.entries(newSettings).forEach(([key, value]) => {
      if (key === 'masterVolume') {
        vttAudioManager.setMasterVolume(value);
      } else if (key === 'muted') {
        vttAudioManager.setMuted(value);
      } else if (key !== 'masterVolume' && key !== 'muted') {
        vttAudioManager.setCategoryVolume(key as any, value);
      }
    });
    
    setSettings(vttAudioManager.getSettings());
  }, []);

  return {
    settings,
    updateSettings,
    playSound: vttAudioManager.playSound.bind(vttAudioManager),
    playAmbient: vttAudioManager.playAmbient.bind(vttAudioManager),
    stopAmbient: vttAudioManager.stopAmbient.bind(vttAudioManager),
    playNotification: vttAudioManager.playNotification.bind(vttAudioManager),
    playUIFeedback: vttAudioManager.playUIFeedback.bind(vttAudioManager),
  };
};
```

#### 3.11 Development Workflow Standards

**Code Quality Automation**
```json
// package.json scripts for development workflow
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "analyze": "vite-bundle-analyzer",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

**Pre-commit Hooks with Husky and lint-staged**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run --reporter=verbose"
    ],
    "*.{js,jsx,json,css,md}": [
      "prettier --write"
    ]
  }
}
```

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npx lint-staged
```

**ESLint Configuration for React + TypeScript**
```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsx-a11y/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": ["./tsconfig.json"],
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y"
  ],
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

This comprehensive Implementation Guidelines section consolidates all scattered implementation details from across the document while adding modern React development standards based on 2025 best practices. It provides complete architectural guidance, coding standards, performance optimization patterns, and development workflow standards specifically tailored for the VTTTools React migration project.

#### Dependencies
- **Core Frontend**: React 18+, TypeScript 5.9+, Konva.js, react-konva for Scene Builder
- **State Management**: Redux Toolkit with RTK Query for server state management
- **HTTP Client**: Axios with .NET Aspire service discovery integration
- **Real-time**: @microsoft/signalr client for chat and collaboration features
- **Audio**: HTML5 Audio API for basic sounds, optional Web Audio API for Scene Builder spatial effects
- **Routing**: React Router v6 for complete application navigation
- **Forms**: React Hook Form with validation for all user input forms
- **UI Components**: Maintain Bootstrap 5 integration with React Bootstrap or headless UI
- **Build Tools**: Vite for development and production builds with hot reload
- **Testing**: Jest, React Testing Library, Playwright, MSW (Mock Service Worker)
- **File Upload**: React Dropzone integration with existing backend patterns

### 4. Acceptance Criteria

#### 4.1 User Story-Specific Acceptance Criteria

**US001 - Landing Page (Visitor):**
- [ ] Landing page loads completely within 2 seconds on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Landing page displays all key elements (hero section, feature overview, CTA buttons) within 1 second
- [ ] Clear call-to-action buttons for Register and Login with hover states and 44px minimum click targets
- [ ] Landing page renders without layout shifts (CLS score < 0.1) and maintains consistent visual hierarchy
- [ ] Error state displays when platform services unavailable with retry mechanism and status information

**US002 - Dashboard (Authenticated User):**
- [ ] Dashboard renders user content within 1.5 seconds of successful authentication
- [ ] Navigation displays all features (Adventures, Assets, Sessions, Scene Builder) with current user permissions
- [ ] Recent activity shows last 20 items with timestamps and links to continue work
- [ ] Dashboard handles up to 50 recent activities without performance degradation
- [ ] Profile summary displays current user info with edit access and loading states

**US003 - Account Registration:**
- [ ] Registration form validates email format in real-time with 200ms debounce
- [ ] Password requirements display clearly with real-time validation feedback
- [ ] Email confirmation sent within 10 seconds with retry option if delivery fails
- [ ] Account activation completes within 5 seconds of valid confirmation link click
- [ ] Registration errors display specific messages (email exists, weak password, network failure)

**US004 - User Login:**
- [ ] Login form validates credentials within 3 seconds of submission
- [ ] Invalid credentials show error message within 3 seconds with clear next steps
- [ ] Remember me checkbox persists session for 30 days with secure token storage
- [ ] Form validation displays field-specific errors within 200ms of field blur
- [ ] Network failures show retry button with 30-second timeout and offline detection

**US005 - User Logout:**
- [ ] Logout clears all authentication tokens and redirects within 2 seconds
- [ ] Logout works both from UI button and session timeout scenarios
- [ ] Confirmation prompt prevents accidental logout during active work sessions
- [ ] Post-logout state prevents access to protected routes and shows login prompt

**US006 - Password Reset:**
- [ ] Password reset request form with email validation
- [ ] Password reset email generation and delivery
- [ ] Password reset confirmation form with new password validation

**US007 - Two-Factor Authentication:**
- [ ] 2FA setup interface with QR code generation
- [ ] 2FA verification during login process
- [ ] Recovery codes management interface

**US008 - External Login Providers:**
- [ ] External login provider integration (OAuth)
- [ ] Account linking functionality for external providers
- [ ] Proper error handling for external authentication failures

**US009-US011 - Profile Management:**
- [ ] Profile information update forms with validation
- [ ] Account settings interface for preferences
- [ ] Password change functionality with current password verification

**US012-US016 - Adventure Management:**
- [ ] Adventure creation forms with validation
- [ ] Adventure editing interface with all field updates
- [ ] Adventure cloning functionality with deep-clone support
- [ ] Adventure deletion with confirmation dialogs
- [ ] Adventure visibility controls (public/private, published/draft)
- [ ] Adventure list page with card/list views and filtering
- [ ] Adventure type selection and image management

**US017-US025 - Asset Management:**
- [ ] Asset creation forms for each type (Character, Creature, NPC, Object)
- [ ] Asset editing interface with property updates
- [ ] Asset deletion with confirmation and dependency checking
- [ ] Asset categorization and organization interface
- [ ] Asset library browsing with search and filtering
- [ ] Asset image upload with 10MB limit validation
- [ ] File upload integration with drag-drop support

**US026-US029 - Game Session Management:**
- [ ] Session creation and scheduling interface with calendar integration
- [ ] Session management dashboard for ongoing sessions
- [ ] Player invitation system with email notifications
- [ ] Session joining interface for players
- [ ] Session coordination and meeting functionality

**US030 - Real-time Chat:**
- [ ] Real-time messaging interface with message history
- [ ] Chat integration with game sessions
- [ ] Message formatting and emoji support

**US047 - Canvas Foundation:**
- [ ] Konva.js Stage component renders within React application architecture
- [ ] Multi-layer canvas system with distinct layers: Background, Grid, Assets, UI overlay
- [ ] Layer rendering order maintained (Background → Grid → Assets → UI)
- [ ] Canvas initialization with configurable dimensions and responsive sizing
- [ ] Basic canvas event handling for mouse and touch interactions
- [ ] Canvas performance monitoring and frame rate optimization

**US048 - Background Management:**
- [ ] Background image upload with drag-drop support and file validation
- [ ] Image display on Background layer with proper scaling and positioning
- [ ] Dynamic canvas sizing based on background image dimensions
- [ ] Background image removal and replacement functionality
- [ ] Image format support (PNG, JPEG, WebP) with size limit validation
- [ ] Loading states and error handling for background image operations

**US049 - Grid System Configuration:**
- [ ] Grid configuration panel with system type selection
- [ ] Square grid system with configurable cell size and line styling
- [ ] Hexagonal grid system with horizontal and vertical orientation options
- [ ] Isometric grid system with proper perspective and alignment
- [ ] Grid visibility toggle with opacity controls
- [ ] Grid color customization and line thickness options
- [ ] Grid snapping points calculation for each grid type

**US050 - Asset Library Integration:**
- [ ] Asset browser modal integrated within Scene Builder interface
- [ ] Asset category filtering and search functionality
- [ ] Asset preview with image thumbnails and metadata display
- [ ] Asset selection interface with multi-select capabilities
- [ ] Integration with existing asset management API endpoints
- [ ] Asset loading states and error handling within Scene Builder context

**US051 - Basic Asset Placement:**
- [ ] Drag-and-drop asset placement from library onto canvas
- [ ] Asset positioning with pixel-perfect placement accuracy
- [ ] Asset selection visualization with selection indicators
- [ ] Basic asset movement after initial placement
- [ ] Asset layer management (rendering on Assets layer)
- [ ] Asset collision detection for placement validation

**US052 - Advanced Asset Manipulation:**
- [ ] Asset rotation controls with angle input and visual rotation handles
- [ ] Asset scaling controls with proportional and free scaling options
- [ ] Asset locking functionality to prevent accidental modifications
- [ ] Context menu for asset operations (rotate, scale, lock, delete, properties)
- [ ] Multi-asset selection for bulk operations
- [ ] Asset property panel for detailed configuration
- [ ] Undo/redo support for all asset manipulation operations

**US053 - Layer Management:**
- [ ] Layer visibility controls for Background, Grid, Assets, and UI layers
- [ ] Layer opacity controls with real-time preview
- [ ] Asset layer ordering (bring to front, send to back, layer up/down)
- [ ] Layer management panel with drag-drop reordering
- [ ] Layer lock functionality to prevent modifications
- [ ] Layer-specific selection and manipulation tools

**US054 - Zoom and Pan Controls:**
- [ ] Zoom controls with 0.1x to 4.0x magnification range
- [ ] Mouse wheel zoom with cursor-centered zooming
- [ ] Pan functionality with mouse drag and touch gestures
- [ ] Zoom fit controls (fit to window, actual size, fit to content)
- [ ] Zoom level indicator with percentage display
- [ ] Keyboard shortcuts for zoom and pan operations
- [ ] Smooth zoom and pan animations with performance optimization

**US055 - Grid Snapping:**
- [ ] Grid snapping toggle with visual feedback
- [ ] Asset snapping to grid intersection points
- [ ] Snapping sensitivity configuration
- [ ] Visual snap indicators during asset movement
- [ ] Edge snapping for asset alignment to grid lines
- [ ] Center-point snapping for precise asset positioning
- [ ] Snap-to-grid validation for different grid types

**US056 - Scene State Persistence:**
- [ ] Scene save functionality with all layer and asset data
- [ ] Scene load functionality with complete state restoration
- [ ] Auto-save functionality with configurable intervals
- [ ] Scene versioning and revision history
- [ ] Save progress indicators and success/error feedback
- [ ] Scene data validation and corruption recovery
- [ ] Export functionality for scene sharing and backup

**US032-US036 - Frontend Error Handling:**
- [ ] Network error detection with clear user messaging and retry options
- [ ] Form validation error display with field-specific guidance
- [ ] Asset loading failure handling with fallback options and retry mechanisms
- [ ] Scene operation error recovery with automatic save state restoration
- [ ] System error display with user-friendly explanations and next steps
- [ ] Error boundary components preventing application crashes
- [ ] Consistent error messaging patterns across all features

**US037-US040 - Content Organization:**
- [ ] Adventure search with text filtering and sorting options
- [ ] Asset library search with category and type filtering
- [ ] Folder/tag organization system for content categorization
- [ ] Multi-select interface for bulk content operations
- [ ] Drag-and-drop content organization with visual feedback
- [ ] Search results highlighting and quick preview
- [ ] Bulk delete, move, and categorization operations

**US041-US043 - Help System:**
- [ ] Contextual help panels for complex features with relevant documentation
- [ ] In-app help search functionality with instant results
- [ ] Interactive tooltips for UI elements with usage guidance
- [ ] Help system integration that doesn't require external documentation
- [ ] Quick help overlay for keyboard shortcuts and controls
- [ ] Feature-specific guidance accessible from relevant contexts

**US044-US046 - Undo/Redo Operations:**
- [ ] Scene Builder undo/redo stack for all canvas operations
- [ ] Content creation undo/redo for forms and data entry
- [ ] Change tracking and recovery for accidental data modifications
- [ ] Visual indicators showing undo/redo availability and history
- [ ] Keyboard shortcuts for undo/redo operations
- [ ] Auto-save functionality working with undo/redo system
- [ ] Data recovery prompts for unsaved changes

#### 4.2 Global System-Wide Acceptance Criteria

**Performance Requirements:**
- [ ] Initial application load time under 3 seconds
- [ ] Scene Builder canvas maintains 60fps during complex operations
- [ ] Bundle size optimization with code splitting and lazy loading
- [ ] Memory usage optimization for extended application sessions
- [ ] Basic audio system integration without performance impact

**User Experience Standards:**
- [ ] Consistent design for desktop environment
- [ ] Consistent Bootstrap 5 design system throughout application
- [ ] Loading states and error feedback for all user operations
- [ ] Consistent component behavior and interaction patterns

**Navigation & Layout Requirements:**
- [ ] MainLayout component renders within 800ms and maintains layout during navigation transitions
- [ ] Navigation displays appropriate menu items based on user authentication state within 300ms of state change
- [ ] Error boundary components catch JavaScript errors and display user-friendly recovery options
- [ ] Global error handling prevents application crashes and provides specific error reporting
- [ ] Loading states appear for any operation exceeding 500ms with specific loading context

**Security & Authentication Standards:**
- [ ] Session tokens refresh automatically 10 minutes before expiration without user interruption
- [ ] Authentication tokens stored securely using httpOnly cookies or secure localStorage patterns
- [ ] Application passes OWASP top 10 security checklist with automated security scanning
- [ ] Protected routes redirect to login within 200ms when user lacks required permissions

**Quality & Development Standards:**
- [ ] Audio system loads and plays sounds within 1 second without blocking UI interactions
  - [ ] Background ambient sounds loop seamlessly with fade in/out transitions (2 second fade)
  - [ ] Notification sounds play within 200ms of user actions with < 100ms audio latency
  - [ ] UI feedback sounds for Scene Builder provide immediate response (< 50ms) to user interactions
  - [ ] Audio settings save user preferences immediately and persist across sessions
  - [ ] Audio failures show specific error messages (audio blocked, file not found, codec unsupported)
- [ ] Scene Builder maintains minimum 50fps performance with up to 100 assets using Konva.js optimization
- [ ] Development environment includes hot reload (< 2s), React DevTools, and TypeScript error reporting
- [ ] Components use defined patterns with consistent prop interfaces and comprehensive error boundaries
- [ ] Code passes automated quality checks (ESLint, Prettier, TypeScript strict mode) in CI pipeline
- [ ] Error handling provides user context, recovery options, and logs technical details for debugging

#### 4.3 Integration Acceptance Criteria

**Backend API Integration:**
- [ ] API calls complete within 10 seconds with 3 retry attempts using exponential backoff (1s, 2s, 4s)
- [ ] Authentication tokens refresh automatically before expiration with seamless user experience
- [ ] Network errors display specific messages (offline, timeout, server error) with appropriate recovery actions
- [ ] API responses validate against expected schemas with graceful handling of format changes
- [ ] Authentication integration with existing ASP.NET Core Identity system
- [ ] Error handling and retry logic for all API communications
- [ ] Proper request/response handling for all service endpoints
- [ ] Service discovery configuration working correctly

**Real-time Integration:**
- [ ] SignalR client connection and management
- [ ] Real-time SignalR integration for chat and collaboration features
- [ ] Connection resilience and reconnection handling
- [ ] Message queuing during connection interruptions

**File Management Integration:**
- [ ] File upload workflows maintaining existing patterns and limits
- [ ] Azure Blob Storage integration for asset management
- [ ] Image processing and optimization integration
- [ ] File validation and security scanning

**Cross-Feature Integration:**
- [ ] Integration between Scene Builder and asset management
- [ ] Integration between adventures and scene management
- [ ] Integration between chat system and game sessions
- [ ] Consistent state management across all features

### 5. Testing Strategy

#### Unit Tests
**Framework**: Jest + React Testing Library
**Coverage Target**: 75% code coverage focusing on critical business logic paths
**Focus Areas**:
- Core React component rendering and user interaction logic
- Authentication flows and user state management
- Adventure and asset management CRUD operations
- Form validation and error handling
- Game session management and scheduling logic
- Chat system SignalR integration
- Scene Builder canvas operations and Konva.js integration
- State management (Redux) critical paths
- API client error scenarios and retry logic
- Content search, filtering, and organization functionality
- Undo/redo operations and change tracking systems

**Testing Requirements**:
- All critical user workflows must have test coverage
- Error boundary components must be tested with various failure scenarios
- Async operations must include loading states and error handling tests
- Form components must validate user input edge cases
- Canvas operations must verify performance under normal usage

#### Integration Tests
**Framework**: Jest + Mock Service Worker (MSW) + SignalR Testing Utils
**Focus Areas**:
- Authentication flows with JWT token refresh handling
- Adventure and asset management API integration including file uploads
- SignalR real-time messaging and connection resilience
- Scene Builder API integration with backend services
- File upload workflows with validation and error recovery
- Cross-feature integration between related components

**Integration Requirements**:
- API error responses must be properly handled and user-friendly
- SignalR disconnection and reconnection scenarios must be tested
- File upload failure and retry mechanisms must work correctly
- State synchronization between different parts of the application

#### End-to-End Tests
**Framework**: Playwright
**Browser Coverage**: Chrome, Firefox, Safari, Edge (desktop focus)
**Test Scenarios**:
- Complete user journey: Registration → Login → Adventure Creation → Scene Building
- Authentication flows including password reset and profile management
- Adventure management: Create, edit, clone, and organize adventures
- Asset management: Upload, organize, and use assets in Scene Builder
- Game session coordination: Schedule and conduct sessions with chat
- Scene Builder workflow: Background setup → Grid configuration → Asset placement
- Error handling and recovery workflows
- Content organization: Search, filter, and bulk operations
- Help system usage and contextual assistance
- Undo/Redo operations across different features

**E2E Requirements**:
- Critical user workflows must complete successfully across all supported browsers
- Performance requirements must be validated under realistic usage conditions
- Error recovery mechanisms must guide users to successful task completion
- Real-time collaboration features must work with multiple concurrent users

#### Visual Regression Tests
**Framework**: Percy or Chromatic integration with Playwright
**Focus Areas**:
- Component visual consistency across browsers
- Scene Builder canvas rendering accuracy
- Bootstrap design system consistency
- Responsive design behavior (desktop focused)
- Error message and loading state appearances

#### Security Tests
**Framework**: OWASP ZAP integration + Jest security utilities
**Focus Areas**:
- Authentication token handling and storage security
- File upload validation and sanitization
- XSS prevention in user-generated content
- CSRF protection for state-changing operations
- API endpoint authorization validation

#### Load Tests
**Framework**: Artillery or k6 for API load testing
**Focus Areas**:
- Scene Builder performance with multiple concurrent users
- SignalR hub performance under realistic user loads
- File upload performance under concurrent usage
- API response times under expected user volumes
- Database query performance with realistic data volumes

#### Performance Testing
**Tools**: Lighthouse CI, React DevTools Profiler, Web Vitals, Konva.js Performance Monitor
**Measurement Conditions**:
- Standard desktop hardware (8GB RAM, mid-range CPU)
- Simulated 3G Fast network connection for baseline
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Scene complexity: Up to 50 assets per scene for testing

**Performance Metrics & Requirements**:
- **Initial Load**: < 3 seconds to interactive (Lighthouse metric)
- **Scene Builder Canvas**: Maintain > 50fps during normal operations
- **Bundle Size**: < 2MB initial bundle, < 500KB per lazy-loaded route
- **Memory Usage**: < 150MB for complex scenes with 50+ assets
- **Real-time Latency**: < 100ms for SignalR message delivery
- **API Response**: < 2 seconds for CRUD operations, < 5 seconds for file uploads

**Performance Monitoring**:
- Lighthouse CI integration for automated performance regression detection
- Real User Monitoring (RUM) for production performance tracking
- Canvas performance monitoring using Konva.js performance APIs
- Memory leak detection using Chrome DevTools automation
- Network performance monitoring with baseline comparisons against current Blazor app

### 6. Quality Standards

#### Code Quality Requirements
**ESLint Configuration**:
- React Hooks rules enforcement
- TypeScript recommended rules
- Accessibility rules (eslint-plugin-jsx-a11y)
- Import/export organization rules
- Custom rules for project-specific patterns

**Prettier Configuration**:
- Consistent code formatting across team
- Integration with ESLint for conflict resolution
- Pre-commit hook enforcement
- IDE integration requirements

**TypeScript Standards**:
- Strict mode enforcement (`"strict": true`)
- No implicit any types allowed
- Explicit return types for all functions
- Proper interface definitions for all API responses
- Generic type usage for reusable components

#### Development Workflow Quality Gates
**Pre-commit Hooks** (using Husky + lint-staged):
- ESLint fixes and validation
- Prettier code formatting
- TypeScript type checking
- Unit test execution for changed files
- Commit message format validation

**Pull Request Requirements**:
- All quality checks must pass in CI pipeline
- Code coverage must not decrease below 75% threshold
- Performance regression tests must pass
- At least one code review approval required
- Integration tests must pass for affected features

**CI/CD Quality Gates**:
- ESLint errors block deployment
- TypeScript compilation errors block deployment
- Unit test failures block deployment
- Integration test failures block deployment
- Performance regression beyond 10% blocks deployment
- Security vulnerability scan must pass
- Bundle size increase > 20% requires approval

#### Code Review Process
**Review Checklist**:
- Code follows established React patterns and hooks best practices
- TypeScript types are properly defined and used
- Error handling is implemented for all user-facing operations
- Performance implications have been considered
- Accessibility requirements are met
- Tests cover new functionality and edge cases
- Documentation is updated for public APIs

**Review Standards**:
- Security review required for authentication and file upload changes
- Performance review required for Scene Builder and canvas-related changes
- Architecture review required for new patterns or significant refactoring
- All reviewers must verify changes work in their local development environment

#### Documentation Standards
**Component Documentation**:
- JSDoc comments for all public component props and methods
- Storybook stories for reusable UI components
- Usage examples for complex components
- Performance considerations for canvas and real-time components

**API Documentation**:
- OpenAPI/Swagger documentation maintenance
- TypeScript interface documentation
- Error response documentation
- Authentication and authorization requirements

#### Error Handling Standards
**Error Boundary Requirements**:
- Global error boundary for application-level crashes
- Feature-specific error boundaries for isolated failures
- Error reporting integration for production issue tracking
- User-friendly error messages with actionable next steps

**Error Message Standards**:
- Clear, non-technical language for end users
- Specific guidance for user resolution when possible
- Technical error details logged for developer debugging
- Consistent error message formatting and tone
- Offline/network error handling with retry mechanisms

## Other Constraints

**Technical Constraints**:
- Must integrate with existing .NET 9 Aspire architecture without backend modifications
- Must maintain compatibility with existing API contracts and authentication system
- Must support existing file upload limits (10MB) and Azure Blob Storage integration
- Must maintain existing database schema and data structures
- Docker CLI only (no Docker Desktop integration per project constraints)
- Must maintain existing SignalR hub implementations

**Performance Constraints**:
- Initial application load time must be optimized for production use
- Scene Builder canvas performance must meet or exceed current implementation
- Real-time collaboration must maintain low latency for good user experience
- Memory usage must be optimized for extended gaming sessions (4+ hours)
- Bundle size must be optimized with code splitting and lazy loading

**Feature Constraints**:
- Must implement complete feature parity with existing Blazor application
- Must enhance Scene Builder capabilities with Konva.js performance improvements
- Must maintain existing user workflows and interaction patterns
- Must preserve existing data integrity and user content
- Must implement basic audio system without impacting performance
- Must support existing asset types and management workflows

**Audio System Requirements**:
- **Basic Audio Features**: HTML5 Audio API for simple, efficient audio playback
  - Background ambient sounds for scenes (forest ambience, dungeon sounds, etc.)
  - Notification sounds for user actions (message received, turn notifications, dice rolls)
  - UI feedback sounds for interactions (button clicks, asset placement, grid changes)
  - Simple volume controls for different audio categories (ambient, effects, notifications)
- **Advanced Audio Features** (Optional): Web Audio API only where justified
  - Basic spatial audio for Scene Builder to enhance immersion (asset-based positional audio)
  - Real-time audio effects for specific VTT features if performance allows
- **Audio Constraints**:
  - Lightweight implementation that doesn't impact performance
  - User-controlled audio settings with mute/volume options
  - Graceful degradation if audio features are not supported
  - No complex audio processing that could affect Scene Builder or real-time collaboration

**Browser Compatibility**:
- Modern evergreen browsers with ES2020+ support
- WebGL support required for Konva.js acceleration in Scene Builder
- HTML5 Audio API support for basic audio features
- SignalR WebSocket support for real-time collaboration
- File API support for drag-drop uploads and asset management
- IndexedDB support for client-side caching and offline capabilities

**Development Constraints**:
- Must use React 18+ with TypeScript for type safety and modern development experience
- Must maintain existing code style and architectural patterns where applicable
- Must implement comprehensive testing strategy with high coverage requirements
- Must support hot reload and efficient development workflows
- Must be deployable within existing infrastructure and CI/CD pipelines

## Implementation Notes

**Migration Strategy**:
- Create new VttTools.WebClientApp project as complete React application
- Implement phased migration approach over 4-6 months
- Maintain existing Blazor application during transition for fallback
- Use feature flags for gradual rollout and user testing
- Plan comprehensive data migration and user transition strategy

**Project Architecture**:
```
VttTools.WebClientApp/
├── public/                  # Static assets and index.html
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ui/            # Basic UI components
│   │   ├── forms/         # Form components with validation
│   │   ├── layout/        # Layout and navigation components
│   │   ├── auth/          # Authentication components
│   │   └── canvas/        # Konva.js Scene Builder components
│   ├── pages/             # Page-level components
│   │   ├── auth/          # Authentication pages
│   │   ├── adventures/    # Adventure management
│   │   ├── assets/        # Asset management
│   │   ├── sessions/      # Game session management
│   │   ├── chat/          # Chat system
│   │   └── scenes/        # Scene Builder
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API clients and business logic
│   ├── store/             # Redux Toolkit state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and helpers
│   ├── constants/         # Application constants
│   └── styles/            # Global styles and themes
├── tests/                 # Test files and utilities
└── docs/                  # Component documentation
```

**Technology Integration Patterns**:

**Authentication Integration**:
```typescript
// JWT token management with ASP.NET Core Identity
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// React Context for authentication state
const AuthContext = createContext<AuthState | undefined>(undefined);

// Custom hook for authentication
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**SignalR Integration**:
```typescript
// SignalR connection management
class SignalRService {
  private connection: HubConnection;

  async connect(accessToken: string) {
    this.connection = new HubConnectionBuilder()
      .withUrl('/chathub', { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();
    
    await this.connection.start();
  }

  onReceiveMessage(callback: (user: string, message: string) => void) {
    this.connection.on('ReceiveMessage', callback);
  }
}
```

**Konva.js Scene Builder Architecture**:
```typescript
// Multi-layer canvas structure with Konva.js
interface SceneBuilderProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

const SceneBuilderCanvas: React.FC<SceneBuilderProps> = ({ scene, onSceneUpdate }) => {
  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <BackgroundLayer imageUrl={scene.backgroundUrl} />
      <GridLayer grid={scene.grid} />
      <AssetsLayer assets={scene.assets} onAssetsChange={handleAssetsChange} />
      <UILayer controls={sceneControls} />
    </Stage>
  );
};
```

**API Integration with Service Discovery**:
```typescript
// HTTP client with Aspire service discovery
class ApiClient {
  private httpClient: AxiosInstance;

  constructor(baseUrl: string, tokenProvider: () => string | null) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
    });

    // Add auth header
    this.httpClient.interceptors.request.use((config) => {
      const token = tokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
}

// Service-specific clients
const adventureService = new AdventureApiClient(
  process.env.REACT_APP_ADVENTURE_SERVICE_URL
);
const assetService = new AssetApiClient(
  process.env.REACT_APP_ASSET_SERVICE_URL
);
```

**State Management Architecture**:
```typescript
// Redux Toolkit store structure
interface RootState {
  auth: AuthState;
  adventures: AdventuresState;
  assets: AssetsState;
  sessions: SessionsState;
  chat: ChatState;
  sceneBuilder: SceneBuilderState;
  ui: UIState;
}

// Example slice for adventure management
const adventuresSlice = createSlice({
  name: 'adventures',
  initialState,
  reducers: {
    setAdventures: (state, action) => {
      state.adventures = action.payload;
    },
    addAdventure: (state, action) => {
      state.adventures.push(action.payload);
    },
    updateAdventure: (state, action) => {
      const index = state.adventures.findIndex(a => a.id === action.payload.id);
      if (index !== -1) state.adventures[index] = action.payload;
    },
  },
});
```

**Basic Audio System Integration**:
```typescript
// Simple HTML5 Audio management for VTT needs
class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private ambientAudio: HTMLAudioElement | null = null;

  loadSound(id: string, url: string) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(id, audio);
  }

  playSound(id: string, volume: number = 0.5) {
    const audio = this.sounds.get(id);
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(console.warn);
    }
  }

  playAmbient(url: string, volume: number = 0.3, loop: boolean = true) {
    this.stopAmbient();
    this.ambientAudio = new Audio(url);
    this.ambientAudio.volume = volume;
    this.ambientAudio.loop = loop;
    this.ambientAudio.play().catch(console.warn);
  }

  stopAmbient() {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
      this.ambientAudio = null;
    }
  }
}

// Optional: Advanced spatial audio for Scene Builder using Web Audio API
class SpatialAudioManager {
  private audioContext: AudioContext | null = null;
  private panners: Map<string, PannerNode> = new Map();

  async initialize() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  createSpatialSound(id: string, x: number, y: number, z: number = 0) {
    if (!this.audioContext) return null;
    
    const panner = this.audioContext.createPanner();
    panner.positionX.value = x;
    panner.positionY.value = y;
    panner.positionZ.value = z;
    this.panners.set(id, panner);
    return panner;
  }
}
```

**Development Workflow**:
- Set up Vite build system with React and TypeScript templates
- Implement hot reload for efficient development experience
- Create Storybook for component development and documentation
- Set up ESLint and Prettier for code quality and consistency
- Implement automated testing pipeline with Jest and Playwright
- Plan deployment strategy with existing infrastructure integration
- Create component library documentation for design system consistency

**Risk Mitigation Strategies**:
- **Scope Management**: Break migration into clear phases with deliverable milestones
- **Performance Monitoring**: Continuous performance testing during development
- **Feature Parity Validation**: Comprehensive acceptance testing against existing features
- **User Training**: Documentation and training materials for UI changes
- **Rollback Planning**: Maintain ability to revert to existing Blazor application if needed
- **Gradual Rollout**: Feature flags and A/B testing for user transition management