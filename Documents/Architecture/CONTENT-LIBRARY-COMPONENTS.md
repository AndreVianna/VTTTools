# Content Library - Component Specifications

**Created**: 2025-10-23
**Version**: 1.0
**Phase**: 7 (Foundation)

---

## Overview

This document specifies all components for the Content Library feature, including shared components (reusable across hierarchy levels) and type-specific components (encounters, adventures, etc.).

## Shared Components (Reusable)

### EditableTitle

**Location**: `src/features/content-library/components/shared/EditableTitle.tsx`
**Reusability**: 100% - Used in all editor headers

**Purpose**: Click-to-edit title component with auto-save

**Props**:
```typescript
interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  variant?: 'h4' | 'h5' | 'h6';
  disabled?: boolean;
}
```

**Behavior**:
- **Default State**: Typography displaying value, cursor pointer
- **Editing State**: TextField, auto-focused, full value selected
- **Triggers**: Click on text, focus via keyboard
- **Save**: Enter key or blur
- **Cancel**: Escape key (reverts to original value)
- **Validation**: Max length, required (can't save empty)

**Accessibility**:
- `aria-label`: "Edit {item} name"
- `role`: "button" when not editing
- Keyboard: Tab to focus, Enter to edit, Escape to cancel
- Screen reader: Announces edit mode entry/exit

**Material-UI Usage**:
- Typography: `variant` prop for sizing
- TextField: `size="small"`, theme-aware
- Colors: `theme.palette.text.primary`

**Implementation Pattern**:
```tsx
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState(value);
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  if (!editValue.trim()) return; // Validation
  setIsSaving(true);
  try {
    await onSave(editValue);
    setIsEditing(false);
  } catch (error) {
    // Show error, stay in edit mode
  } finally {
    setIsSaving(false);
  }
};

return isEditing ? (
  <TextField
    value={editValue}
    onChange={(e) => setEditValue(e.target.value)}
    onBlur={handleSave}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') { setEditValue(value); setIsEditing(false); }
    }}
    disabled={isSaving}
    autoFocus
  />
) : (
  <Typography
    variant={variant}
    onClick={() => setIsEditing(true)}
    sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
  >
    {value || placeholder}
  </Typography>
);
```

---

### ContentCard

**Location**: `src/features/content-library/components/shared/ContentCard.tsx`
**Reusability**: 70% - Base structure, specialized rendering per type

**Purpose**: Generic card component for content items

**Props**:
```typescript
interface ContentCardProps {
  title: string;
  subtitle?: string;
  thumbnail?: string | ReactNode;
  badges?: ReactNode[];
  metadata?: Array<{ label: string; value: string }>;
  onClick: () => void;
  actions?: Array<{ label: string; icon: ReactNode; onClick: () => void }>;
  selected?: boolean;
}
```

**Structure**:
```
┌─────────────┐
│ [Thumbnail] │
├─────────────┤
│ Title       │
│ Subtitle    │
│ [Badge][🔖] │
│ Metadata    │
│ [Actions⋮]  │
└─────────────┘
```

**Material-UI**:
- Card component with elevation
- CardMedia for thumbnail
- CardContent for text
- CardActions for buttons
- IconButton for menu

**Hover Effects**:
- Elevation increases (2 → 4)
- Border highlight (theme.palette.primary)
- Cursor pointer

**Theme Compliance**:
- Background: `theme.palette.background.paper`
- Text: `theme.palette.text.primary/secondary`
- Borders: `theme.palette.divider`

---

### ContentListLayout

**Location**: `src/features/content-library/components/shared/ContentListLayout.tsx`
**Reusability**: 100% - Fully generic list container

**Purpose**: Consistent list layout with search, filter, sort

**Props**:
```typescript
interface ContentListLayoutProps {
  title: string;
  items: any[];
  renderItem: (item: any) => ReactNode;
  onCreateNew: () => void;
  searchPlaceholder?: string;
  filterOptions?: Array<{ label: string; value: string }>;
  sortOptions?: Array<{ label: string; value: string }>;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
}
```

**Layout**:
```
┌────────────────────────────────────────┐
│  {title}                      [+ New]  │
├────────────────────────────────────────┤
│  [🔍 Search...] [Filter ▼] [Sort ▼]   │
├────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Item 1│  │Item 2│  │Item 3│         │
│  └──────┘  └──────┘  └──────┘         │
└────────────────────────────────────────┘
```

**Features**:
- Responsive grid (1-4 columns based on viewport)
- Search filters items client-side
- Filter dropdown (type-specific options)
- Sort dropdown (name, date, etc.)
- Empty state with illustration + action
- Loading skeleton during fetch

**Grid Breakpoints**:
- xs: 1 column
- sm: 2 columns
- md: 3 columns
- lg: 4 columns

---

### PublishToggle

**Location**: `src/features/content-library/components/shared/PublishToggle.tsx`
**Reusability**: 100% - Used in all metadata menus

**Purpose**: Consistent publish/unpublish control

**Props**:
```typescript
interface PublishToggleProps {
  isPublished: boolean;
  onChange: (published: boolean) => void;
  disabled?: boolean;
}
```

**Display**:
- FormControlLabel with Checkbox
- Label: "Published" (checked) or "Draft" (unchecked)
- Helper text: "Published content is visible to others" (optional)

**Behavior**:
- Click checkbox → Immediate onChange
- No debounce (publishing is deliberate action)
- Disabled during save

---

### SaveIndicator

**Location**: `src/features/content-library/components/shared/SaveIndicator.tsx`
**Reusability**: 100% - Used in all editors

**Purpose**: Visual feedback for auto-save status

**Props**:
```typescript
interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}
```

**Display by Status**:
- **idle**: Nothing (hidden)
- **saving**: "💾 Saving..." (gray text, spinning icon)
- **saved**: "✓ Saved" (green text, fades after 2s)
- **error**: "⚠ Save failed" (red text, shows retry button)

**Position**: Inline with title or in menu

**Animation**:
- Fade in on status change
- Fade out after 2s on 'saved'
- Persist on 'error'

---

## Encounter-Specific Components

### EncounterCard

**Location**: `src/features/content-library/components/encounters/EncounterCard.tsx`
**Extends**: ContentCard

**Purpose**: Display encounter preview in list

**Additional Props**:
```typescript
interface EncounterCardProps {
  encounter: Encounter;
  onClick: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Display Elements**:
- **Thumbnail**: Placeholder (future: canvas screenshot)
- **Title**: Encounter name
- **Subtitle**: Grid type (e.g., "Square Grid")
- **Badges**:
  - Published badge (if isPublished)
  - Grid type icon
- **Metadata**:
  - Asset count: "15 assets"
  - Last modified: "2 days ago"
- **Actions** (three-dot menu):
  - Duplicate
  - Delete

**Grid Type Icons**:
- Square: ⊞
- Hex-H: ⬡
- Hex-V: ⬢
- Isometric: ◇
- No Grid: (no icon)

---

### EncounterMetadataMenu

**Location**: `src/features/content-library/components/encounters/EncounterMetadataMenu.tsx`

**Purpose**: Contents of Encounter dropdown menu

**Props**:
```typescript
interface EncounterMetadataMenuProps {
  encounter: Encounter;
  onUpdate: (updates: Partial<Encounter>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}
```

**Sections**:

**1. Adventure Selector** (Phase 8):
```tsx
<FormControl fullWidth size="small">
  <InputLabel>Adventure</InputLabel>
  <Select
    value={encounter.adventureId || 'none'}
    onChange={(e) => onUpdate({ adventureId: e.target.value === 'none' ? null : e.target.value })}
  >
    <MenuItem value="none">None (Standalone)</MenuItem>
    {adventures.map(adv => (
      <MenuItem key={adv.id} value={adv.id}>{adv.name}</MenuItem>
    ))}
  </Select>
</FormControl>
```

**2. Description Editor**:
```tsx
<TextField
  label="Description"
  multiline
  rows={4}
  value={encounter.description}
  onChange={(e) => onUpdate({ description: e.target.value })}
  placeholder="Describe your encounter..."
  fullWidth
/>
```

**3. Published Toggle**:
```tsx
<PublishToggle
  isPublished={encounter.isPublished}
  onChange={(published) => onUpdate({ isPublished: published })}
/>
```

**4. Actions**:
```tsx
<Divider />
<MenuItem onClick={onDuplicate}>
  <ListItemIcon><ContentCopyIcon /></ListItemIcon>
  Duplicate Encounter
</MenuItem>
<MenuItem onClick={onDelete}>
  <ListItemIcon><DeleteIcon /></ListItemIcon>
  Delete Encounter
</MenuItem>
```

---

### EncounterListView

**Location**: `src/features/content-library/components/encounters/EncounterListView.tsx`

**Purpose**: Encounters tab content in Content Library

**Props**: None (uses hooks)

**Hooks**:
```typescript
const { data: encounters, isLoading } = useGetEncountersQuery();
const [createEncounter] = useCreateEncounterMutation();
const [deleteEncounter] = useDeleteEncounterMutation();
const navigate = useNavigate();
```

**Features**:
- Uses ContentListLayout wrapper
- Renders EncounterCard for each encounter
- Handles create/duplicate/delete
- Search filters by name
- Filter by grid type, published status
- Sort by name, date, asset count

**Create New Flow**:
```typescript
const handleCreateNew = async () => {
  const newEncounter = await createEncounter({
    name: 'Untitled Encounter',
    description: '',
    grid: getDefaultGrid()
  }).unwrap();

  navigate(`/encounter-editor/${newEncounter.id}`);
};
```

---

## Material-UI Theme Integration

### Color Usage

**All components must use theme tokens:**

```typescript
// Backgrounds
theme.palette.background.default
theme.palette.background.paper

// Text
theme.palette.text.primary
theme.palette.text.secondary
theme.palette.text.disabled

// Actions
theme.palette.primary.main
theme.palette.secondary.main
theme.palette.error.main
theme.palette.success.main

// Borders
theme.palette.divider
```

### Spacing System

**Use theme.spacing() for all spacing:**
```typescript
sx={{
  p: 2,        // padding: 16px (theme.spacing(2))
  mt: 1,       // marginTop: 8px
  gap: 1.5     // gap: 12px
}}
```

### Typography Scale

**Use variant prop, not font-size:**
```typescript
<Typography variant="h4">Title</Typography>        // ~34px
<Typography variant="h6">Subtitle</Typography>     // ~20px
<Typography variant="body1">Content</Typography>   // ~16px
<Typography variant="body2">Meta</Typography>      // ~14px
<Typography variant="caption">Label</Typography>   // ~12px
```

---

## Accessibility Standards (WCAG 2.1 AA)

### Keyboard Navigation

**All interactive elements must support:**
- Tab: Focus next
- Shift+Tab: Focus previous
- Enter/Space: Activate
- Escape: Cancel/Close

**Focus Indicators**:
- Visible outline: `theme.palette.primary.main`
- Minimum 2px width
- Clear contrast against background

### Screen Reader Support

**Semantic HTML**:
```tsx
<main>
  <h1>Content Library</h1>
  <nav aria-label="Content types">
    <Tabs>...</Tabs>
  </nav>
  <section aria-label="Encounter list">
    <Grid>...</Grid>
  </section>
</main>
```

**ARIA Labels**:
- Buttons: `aria-label="Create new encounter"`
- Icons: `aria-hidden="true"` (if decorative)
- Forms: `aria-describedby` for help text
- Live regions: `aria-live="polite"` for save status

### Color Contrast

**Minimum Ratios**:
- Normal text: 4.5:1
- Large text (≥18px): 3:1
- UI components: 3:1

**Testing**: Use theme.palette tokens (automatically compliant)

---

## Component Testing

### Unit Test Coverage (Per Component)

**EditableTitle**:
```typescript
describe('EditableTitle', () => {
  it('displays value as typography by default');
  it('switches to input on click');
  it('saves on Enter key');
  it('saves on blur');
  it('cancels on Escape');
  it('validates max length');
  it('shows loading during save');
  it('handles save errors');
  it('is accessible via keyboard');
});
```

**ContentCard**:
```typescript
describe('ContentCard', () => {
  it('renders thumbnail, title, metadata');
  it('calls onClick when card clicked');
  it('shows actions menu');
  it('displays badges correctly');
  it('supports dark/light themes');
  it('has proper hover effects');
});
```

**EncounterCard**:
```typescript
describe('EncounterCard', () => {
  it('extends ContentCard correctly');
  it('displays grid type icon');
  it('shows asset count');
  it('shows published badge');
  it('renders actions (duplicate, delete)');
});
```

### Integration Test Coverage

**Encounter List + API**:
```typescript
describe('EncounterListView', () => {
  it('fetches and displays encounters');
  it('filters by search term');
  it('creates new encounter and navigates');
  it('duplicates encounter');
  it('deletes encounter with confirmation');
  it('handles empty state');
  it('handles loading state');
  it('handles API errors');
});
```

---

## Component Reusability Matrix

### Phase 7 → Phase 8 Reuse

| Component | Phase 7 | Phase 8 Reuse | Changes Needed |
|-----------|---------|---------------|----------------|
| EditableTitle | ✅ Build | 100% | None |
| ContentCard | ✅ Build | 70% | Different metadata |
| ContentListLayout | ✅ Build | 100% | None |
| PublishToggle | ✅ Build | 100% | None |
| SaveIndicator | ✅ Build | 100% | None |
| useAutoSave | ✅ Build | 90% | Adapt for adventure updates |
| useContentList | ✅ Build | 80% | Different API endpoint |

### Type-Specific (Phase 7)

| Component | Reusable? | Notes |
|-----------|-----------|-------|
| EncounterCard | No | Encounter-specific rendering |
| EncounterMetadataMenu | No | Encounter properties only |
| EncounterListView | Partial | Pattern reusable, content not |

### Type-Specific (Phase 8 - Future)

| Component | Build in Phase 8 | Based On |
|-----------|------------------|----------|
| AdventureCard | Yes | ContentCard pattern |
| AdventureMetadataMenu | Yes | EncounterMetadataMenu pattern |
| AdventureListView | Yes | EncounterListView pattern |

**Estimated Code Reuse**: 60-70% in Phase 8

---

## Performance Considerations

### Lazy Loading

**ContentListLayout**:
- Virtual scrolling for large lists (100+ items)
- Intersection Observer for thumbnails
- Pagination (20-50 items per page)

**Image Loading**:
- Lazy load thumbnails (not in viewport)
- Placeholder while loading
- Error fallback image

### Memoization

**Expensive Components**:
```typescript
export const EncounterCard = React.memo(EncounterCardComponent);
export const ContentCard = React.memo(ContentCardComponent);
```

**useMemo for Filtering**:
```typescript
const filteredEncounters = useMemo(() => {
  return encounters.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [encounters, searchTerm]);
```

---

## Error Handling

### Component-Level Errors

**ErrorBoundary Wrapping**:
```tsx
<ErrorBoundary fallback={<ContentListError />}>
  <EncounterListView />
</ErrorBoundary>
```

**Graceful Degradation**:
- API error → Show error message with retry
- Missing thumbnail → Show placeholder
- Invalid data → Skip item, log warning

### User Feedback

**Error States**:
- Network error: "Cannot connect. Check your internet."
- Not found: "Encounter not found. It may have been deleted."
- Validation: "Encounter name is required."
- Permission: "You don't have permission to edit this encounter."

**Success States**:
- Create: "Encounter created successfully"
- Update: "Changes saved" (via SaveIndicator)
- Delete: "Encounter deleted"
- Duplicate: "Encounter duplicated"

---

## Naming Conventions

### Component Files

**Pattern**: PascalCase
- EditableTitle.tsx
- ContentCard.tsx
- EncounterListView.tsx

**Test Files**: {Component}.test.tsx
- EditableTitle.test.tsx
- ContentCard.test.tsx

### Component Names

**Display Name**: Set for debugging
```typescript
EditableTitle.displayName = 'EditableTitle';
```

### Props Interfaces

**Pattern**: {Component}Props
```typescript
interface EditableTitleProps { ... }
interface ContentCardProps { ... }
```

---

## Implementation Checklist

### Per Component

- [ ] TypeScript interface defined
- [ ] Props documented
- [ ] Material-UI compliant (theme tokens)
- [ ] Accessible (WCAG AA)
- [ ] Keyboard navigation
- [ ] Dark/light theme support
- [ ] Unit tests (≥70% coverage)
- [ ] displayName set
- [ ] Comments removed (self-documenting code)
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### Shared Component Standards

- [ ] Reusable across hierarchy levels
- [ ] Generic typing (where applicable)
- [ ] Minimal assumptions
- [ ] Extension points (render props, slots)
- [ ] Performance optimized (memo, useMemo)

---

## Future Enhancements (Post-Phase 7)

### Thumbnail Generation
- Canvas screenshot on save
- Stored as resource
- Displayed in cards

### Bulk Operations
- Multi-select encounters
- Bulk delete
- Bulk publish/unpublish
- Bulk move to adventure

### Advanced Search
- Search by description
- Filter by adventure
- Filter by asset types
- Tag system

### Drag-and-Drop
- Reorder encounters
- Drag encounter to adventure (Phase 8)

---

## Success Criteria

**Component Quality**:
✅ All components Material-UI compliant
✅ Full dark/light theme support
✅ WCAG 2.1 AA accessible
✅ Test coverage ≥70%
✅ Zero hardcoded colors
✅ Keyboard navigation complete

**Reusability**:
✅ 60-70% code reuse in Phase 8
✅ Clear extension points
✅ Generic base components
✅ Type-safe implementations

**User Experience**:
✅ Seamless editor-as-CRUD flow
✅ Auto-save with clear indicators
✅ Fast navigation (list ↔ editor)
✅ Responsive design (mobile-friendly)
