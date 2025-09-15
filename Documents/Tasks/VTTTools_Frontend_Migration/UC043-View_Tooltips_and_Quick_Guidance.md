# UC043 - View Tooltips and Quick Guidance

## Use Case Information
- **Use Case ID**: UC043
- **Use Case Name**: View Tooltips and Quick Guidance
- **User Story**: As a user, I want to see tooltips and quick guidance for interface elements so that I can understand what different controls do
- **Actor(s)**: All authenticated users (GMs and Players)
- **System**: VTTTools React Frontend Application

## Preconditions
- User is logged into the VTTTools application
- User is interacting with interface elements that have tooltip guidance
- Tooltip system is initialized and responsive

## Postconditions
- User has received immediate guidance about interface element functionality
- User understanding of UI controls is enhanced
- User can perform actions more confidently with tooltip assistance
- Tooltip content is accessible to all users including those using assistive technology

## Main Flow
1. **User hovers over UI element** (button, icon, form field, canvas tool)
2. **System detects hover intent** with appropriate delay (800ms for desktop)
3. **System displays tooltip** with relevant guidance and description
4. **User reads tooltip content** while maintaining hover state
5. **System positions tooltip** to avoid obscuring important UI elements
6. **User moves cursor away** or clicks element
7. **System dismisses tooltip** after brief delay or immediate on interaction
8. **User applies learned information** to interact with the element effectively

## Alternative Flows
### A1: Keyboard Navigation Tooltip Access
2a. User navigates to element using keyboard (Tab key)
2b. System displays tooltip when element receives focus
2c. Tooltip remains visible while element has focus
2d. System dismisses tooltip when focus moves to next element

### A2: Quick Keyboard Shortcut Overlay
1a. User presses help key combination (Ctrl+?)
1b. System displays overlay showing all keyboard shortcuts for current context
1c. User reviews available shortcuts and their functions
1d. User presses Escape or clicks outside to dismiss overlay

### A3: Touch Device Interaction
1a. User taps UI element on touch device
1b. System shows tooltip for 3 seconds or until next interaction
1c. User can tap tooltip to dismiss immediately

### A4: Tooltip Content Too Long
3a. System detects tooltip content exceeds optimal display size
3b. System truncates content with "..." and "Show more" link
3c. User clicks "Show more" to expand full tooltip content

## Technical Implementation Notes

### Tooltip Component Architecture
```typescript
interface TooltipProps {
  content: string | ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: number;
  showOnFocus?: boolean;
  showOnClick?: boolean;
  dismissOnClick?: boolean;
  shortcut?: string;
}

interface QuickGuideOverlay {
  shortcuts: KeyboardShortcut[];
  context: string;
  categories: ShortcutCategory[];
}

interface KeyboardShortcut {
  keys: string;
  description: string;
  category: string;
  available: boolean;
}
```

### Implementation Strategy
- **Tooltip Library**: Use React-based tooltip library (React-Tooltip or custom implementation)
- **Smart Positioning**: Automatic positioning to avoid viewport edges and important UI
- **Performance**: Tooltip content lazy-loaded and cached for frequently accessed elements
- **Accessibility**: Full ARIA support with role="tooltip" and proper associations

### UI/UX Considerations
- **Timing**: 800ms delay for hover, immediate for focus
- **Positioning**: Smart positioning that doesn't obscure related UI
- **Styling**: Consistent with application design system
- **Content**: Concise, action-oriented guidance

## Acceptance Criteria

### Tooltip Functionality
- [ ] Interactive tooltips display for all UI elements with usage guidance within 800ms of hover
- [ ] Tooltips position intelligently to avoid viewport edges and important UI elements
- [ ] Tooltip content includes element description, keyboard shortcuts (if applicable), and usage tips
- [ ] Tooltips work consistently across all browsers and screen sizes
- [ ] Tooltips dismiss appropriately (mouse leave, click, escape key, focus change)

### Quick Guidance Features
- [ ] Quick help overlay (Ctrl+?) displays all keyboard shortcuts for current application context
- [ ] Keyboard shortcut overlay organizes shortcuts by category (navigation, editing, selection, etc.)
- [ ] Shortcut overlay shows availability status (enabled/disabled based on current state)
- [ ] Quick guidance appears within 200ms of activation and dismisses cleanly
- [ ] Context-sensitive shortcuts display only relevant commands for current feature

### User Experience Requirements
- [ ] Tooltips enhance workflow without interrupting user interactions
- [ ] Tooltip content is concise (under 50 words) and action-oriented
- [ ] Tooltip styling is consistent with application design system
- [ ] Tooltips work with both mouse hover and keyboard focus navigation
- [ ] Advanced tooltips show keyboard shortcuts, usage examples, and related features

### Performance Requirements
- [ ] Tooltip rendering doesn't impact application performance (maintains 60fps)
- [ ] Tooltip content loads within 100ms for static content
- [ ] Memory usage for tooltip system remains under 5MB
- [ ] Tooltip animations are smooth and don't cause UI lag
- [ ] Large tooltip overlays load within 300ms and scroll smoothly

### Accessibility Requirements
- [ ] Tooltips work with keyboard navigation and screen readers
- [ ] Tooltip content is announced by screen readers when focused
- [ ] High contrast mode displays tooltips with sufficient color contrast
- [ ] Tooltips use proper ARIA labels and role="tooltip" attributes
- [ ] Keyboard shortcuts in tooltips are announced correctly by assistive technology

### Content Requirements
- [ ] Scene Builder tooltips explain canvas tools, grid controls, and asset manipulation
- [ ] Form field tooltips provide validation rules, format requirements, and examples
- [ ] Button tooltips describe action and keyboard shortcut (if available)
- [ ] Icon tooltips include both description and context of use
- [ ] Complex feature tooltips link to contextual help for detailed information

## Business Value
- **Improved Usability**: Users can understand interface elements without external documentation
- **Reduced Learning Curve**: Immediate guidance reduces time to feature proficiency
- **Enhanced Accessibility**: All users can understand interface functionality regardless of experience level
- **Increased Feature Discovery**: Tooltips help users discover advanced functionality and shortcuts
- **Reduced Support Load**: Clear interface guidance reduces need for support assistance

## Dependencies
- **Tooltip Content Management**: System for maintaining and updating tooltip content
- **Design System Integration**: Consistent styling with application design standards
- **Accessibility Framework**: ARIA support and screen reader compatibility
- **Performance Monitoring**: Tooltip impact on application performance tracking

## Risk Factors
- **Content Overload**: Too many tooltips can overwhelm users and create UI clutter
- **Performance Impact**: Poorly implemented tooltips can degrade application performance
- **Accessibility Compliance**: Tooltip system must not interfere with assistive technology
- **Maintenance Burden**: Tooltip content must stay synchronized with UI changes

## Definition of Done
- All acceptance criteria are met and verified
- Tooltip system works across all supported browsers and input methods
- Accessibility testing passes with screen readers and keyboard navigation
- Performance benchmarks are met for tooltip rendering and interactions
- Content review ensures all tooltips provide valuable, concise guidance
- Integration testing confirms tooltips work with all application features
- User testing validates tooltip effectiveness and non-intrusive behavior