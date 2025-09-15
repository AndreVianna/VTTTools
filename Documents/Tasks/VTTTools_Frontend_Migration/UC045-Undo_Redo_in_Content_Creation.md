# UC045 - Undo/Redo in Content Creation

## Use Case Information
- **Use Case ID**: UC045
- **Use Case Name**: Undo/Redo in Content Creation
- **User Story**: As a GM, I want to undo and redo changes in content creation so that I can safely make modifications to adventures and assets
- **Actor(s)**: Game Master (GM), Players (for profile/character management)
- **System**: VTTTools React Frontend Application - Content Management Modules

## Preconditions
- User is logged into the VTTTools application
- User is actively creating or editing content (Adventure, Asset, Profile, Character)
- Content creation form is loaded and responsive
- Undo/redo system is initialized for the active form

## Postconditions
- Form changes have been successfully undone or redone
- Form state accurately reflects the operation result
- Change history is updated appropriately
- Auto-save system coordinates with undo/redo operations
- User confidence in content modification is maintained

## Main Flow
1. **User modifies form content** (text field, dropdown selection, file upload, checkbox change)
2. **System captures change** with before/after values and field identification
3. **System adds change to undo history** with timestamp and change description
4. **User triggers undo** via Ctrl+Z, undo button, or accidental change recovery
5. **System retrieves last change** from undo history
6. **System restores field to previous value** and updates form display
7. **System moves change to redo history** for potential redo operation
8. **System updates form validation** based on restored values
9. **System shows visual confirmation** of undo operation completion

## Alternative Flows
### A1: Redo Operation
4a. User triggers redo via Ctrl+Y or redo button
5a. System retrieves last change from redo history
6a. System reapplies change to form field
7a. System moves change back to undo history
8a-9a. System updates validation and provides confirmation

### A2: Multi-Field Compound Change
1a. User performs operation affecting multiple fields (template selection, bulk property change)
1b. System groups related changes into single undoable operation
2a. System stores compound change as single undo command
5a. Undo reverses all related field changes atomically

### A3: Form Validation Conflicts
6a. System detects restored value creates validation conflicts
6b. System displays validation warnings but maintains undo operation
6c. User can address validation issues or undo additional changes to resolve

### A4: Unsaved Changes Recovery
1a. User accidentally navigates away from form with unsaved changes
1b. System detects navigation attempt and prompts for action
1c. User chooses to recover unsaved changes from undo history
1d. System restores form to last known state before navigation

## Technical Implementation Notes

### Form Change Tracking Architecture
```typescript
interface FormChange {
  id: string;
  fieldName: string;
  fieldPath: string;
  previousValue: any;
  newValue: any;
  timestamp: number;
  changeType: ChangeType;
  description: string;
}

enum ChangeType {
  TextInput = 'text-input',
  Selection = 'selection',
  FileUpload = 'file-upload',
  Checkbox = 'checkbox',
  ArrayOperation = 'array-operation',
  CompoundChange = 'compound-change'
}

interface ContentUndoRedoState {
  undoHistory: FormChange[];
  redoHistory: FormChange[];
  maxHistorySize: number;
  autoSaveIntegration: boolean;
  isDirty: boolean;
}
```

### Form Integration Strategy
- **React Hook Form Integration**: Custom hooks for change tracking with popular form libraries
- **Field-Level Tracking**: Individual field change monitoring with debounced capture
- **Draft Management**: Periodic draft saves coordinated with undo system
- **Validation Coordination**: Undo operations work seamlessly with form validation

### Performance Optimization
- **Debounced Tracking**: Rapid typing doesn't create excessive undo entries
- **Selective Storage**: Only store actual value changes, not intermediate states
- **Memory Management**: Automatic cleanup of old change history

## Acceptance Criteria

### Core Undo/Redo Functionality
- [ ] Content creation undo/redo captures all form field changes (text, selections, uploads, checkboxes)
- [ ] Undo operations (Ctrl+Z) restore previous field values while maintaining form integrity
- [ ] Redo operations (Ctrl+Y) reapply undone changes with original values and validation
- [ ] Change tracking works across all content types: Adventures, Assets, Profiles, and Settings
- [ ] Compound operations (template application, bulk changes) group as single undoable units

### User Experience Requirements
- [ ] Visual indicators show undo/redo availability with descriptive tooltips ("Undo Text Change", "Redo Selection")
- [ ] Form changes are tracked with appropriate debouncing (500ms for text, immediate for selections)
- [ ] Undo/redo operations maintain cursor position and focus state where possible
- [ ] Change history preserves enough context for meaningful undo descriptions
- [ ] Users receive confirmation feedback when undo/redo operations complete

### Data Recovery Features
- [ ] Change tracking and recovery prompts prevent accidental data loss during navigation
- [ ] Data recovery prompts appear when users attempt to leave forms with unsaved changes
- [ ] Recovery system can restore form state from undo history after accidental navigation
- [ ] Auto-save functionality coordinates with undo/redo to maintain recovery points
- [ ] Draft management preserves undo/redo history across browser sessions where appropriate

### Performance Requirements
- [ ] Form change tracking doesn't impact typing responsiveness (maintains sub-50ms input latency)
- [ ] Undo/redo operations complete within 100ms for single field changes
- [ ] Change history maintains maximum 25 changes per form without memory issues
- [ ] Large form undo operations (complex adventures) complete within 300ms
- [ ] Memory usage for change tracking remains under 10MB per active form

### Integration Requirements
- [ ] Undo/redo integrates with form validation without creating invalid states
- [ ] File upload changes integrate with undo system (restore previous file or clear upload)
- [ ] Multi-step form wizards maintain undo/redo across step boundaries
- [ ] Rich text editors (if used) integrate with content creation undo system
- [ ] Form auto-save respects undo/redo state and doesn't interfere with change tracking

### Content Type Coverage
- [ ] Adventure creation forms support undo/redo for all properties (name, description, settings, visibility)
- [ ] Asset creation forms track changes for all asset types (Character, Creature, NPC, Object)
- [ ] Profile management forms support undo/redo for user information and preferences
- [ ] Settings forms allow reverting configuration changes through undo operations
- [ ] Content organization operations (folder creation, tagging) support undo/redo

## Business Value
- **Content Safety**: Users can confidently make changes knowing they can recover from mistakes
- **Workflow Efficiency**: Quick error correction keeps content creation flow uninterrupted
- **User Confidence**: Safety net encourages experimentation with content creation features
- **Data Protection**: Accidental changes don't result in permanent data loss
- **Professional Experience**: Undo/redo functionality expected in content management tools

## Dependencies
- **Form Management Library**: Integration with React Hook Form or similar form handling
- **Auto-Save System**: Coordination with automatic draft saving functionality  
- **Validation Framework**: Integration with form validation without conflicts
- **Navigation Guards**: Browser navigation prevention for unsaved changes

## Risk Factors
- **Form Complexity**: Complex nested forms may be difficult to track accurately
- **Performance Impact**: Change tracking must not degrade form responsiveness
- **Memory Usage**: Large change histories could impact browser performance
- **Validation Conflicts**: Undo operations might create temporarily invalid form states

## Definition of Done
- All acceptance criteria are met and verified
- Undo/redo functionality tested across all content creation forms
- Performance benchmarks met for large forms and extensive change histories
- Integration testing completed with auto-save and validation systems
- Navigation protection tested for unsaved change scenarios
- User testing confirms intuitive behavior and data protection
- Memory usage profiling confirms efficient change tracking