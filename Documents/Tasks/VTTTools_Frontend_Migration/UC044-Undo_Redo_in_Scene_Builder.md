# UC044 - Undo/Redo in Scene Builder

## Use Case Information
- **Use Case ID**: UC044
- **Use Case Name**: Undo/Redo in Scene Builder
- **User Story**: As a GM, I want to undo and redo operations in Scene Builder so that I can experiment freely and recover from mistakes
- **Actor(s)**: Game Master (GM)
- **System**: VTTTools React Frontend Application - Scene Builder Module

## Preconditions
- GM is logged into the VTTTools application
- GM has Scene Builder open with an active scene
- Scene Builder canvas is initialized and responsive
- Undo/redo system is active and tracking operations

## Postconditions
- Scene Builder operation has been successfully undone or redone
- Canvas state reflects the operation change accurately
- Undo/redo stack is updated appropriately
- Visual indicators show current undo/redo availability
- Auto-save system acknowledges the state change

## Main Flow
1. **GM performs canvas operation** (asset placement, rotation, layer change, grid modification)
2. **System captures operation** in command pattern format with before/after states
3. **System adds command to undo stack** and clears redo stack if applicable
4. **GM triggers undo** via Ctrl+Z, toolbar button, or context menu
5. **System retrieves last command** from undo stack
6. **System reverses operation** by applying stored before-state to canvas
7. **System moves command to redo stack** for potential redo operation
8. **System updates canvas display** to reflect undone state
9. **System updates UI indicators** showing undo/redo availability

## Alternative Flows
### A1: Redo Operation
4a. GM triggers redo via Ctrl+Y, Ctrl+Shift+Z, or toolbar button
5a. System retrieves last command from redo stack
6a. System reapplies operation using stored after-state
7a. System moves command back to undo stack
8a-9a. System updates canvas and UI as in main flow

### A2: Multiple Undo Operations
4a. GM performs multiple undo operations in sequence
5a. System processes each undo in reverse chronological order
6a. Each operation's before-state is applied to canvas
7a. All undone commands move to redo stack maintaining order

### A3: Undo Stack Limit Reached
2a. System detects undo stack has reached maximum size (50 operations)
2b. System removes oldest command from bottom of stack
2c. System adds new command to top of stack

### A4: Complex Operation Grouping
1a. GM performs compound operation (multi-asset selection and move)
2a. System groups related operations into single undoable command
2b. Undo/redo treats grouped operations as atomic unit

## Technical Implementation Notes

### Command Pattern Architecture
```typescript
interface UndoableCommand {
  id: string;
  type: CommandType;
  description: string;
  timestamp: number;
  execute(): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

enum CommandType {
  AssetPlace = 'asset-place',
  AssetMove = 'asset-move',
  AssetRotate = 'asset-rotate',
  AssetScale = 'asset-scale',
  AssetDelete = 'asset-delete',
  LayerChange = 'layer-change',
  GridModify = 'grid-modify',
  BackgroundChange = 'background-change'
}

interface UndoRedoState {
  undoStack: UndoableCommand[];
  redoStack: UndoableCommand[];
  maxStackSize: number;
  isUndoing: boolean;
  isRedoing: boolean;
}
```

### Konva.js Integration
- **State Capture**: Serialize Konva.js object states for before/after snapshots
- **Selective Updates**: Update only affected canvas objects rather than full scene refresh
- **Performance Optimization**: Use Konva.js object caching for large undo operations
- **Layer Management**: Handle layer-specific undo/redo operations efficiently

### Stack Management
- **Memory Efficiency**: Implement command compression for similar consecutive operations
- **Stack Limits**: Maintain 50-operation limit with oldest-first removal
- **Grouping Logic**: Smart grouping of related operations (drag operations, multi-select actions)

## Acceptance Criteria

### Core Undo/Redo Functionality
- [ ] Scene Builder undo/redo stack captures all canvas operations (asset placement, movement, rotation, scaling, deletion)
- [ ] Undo operations (Ctrl+Z) reverse the last action and restore exact previous state
- [ ] Redo operations (Ctrl+Y, Ctrl+Shift+Z) reapply undone actions maintaining original behavior
- [ ] Undo/redo works for all Scene Builder operations: grid changes, background updates, layer modifications
- [ ] Command grouping treats related operations (multi-asset moves, compound transforms) as single undoable units

### User Interface Requirements
- [ ] Visual indicators show undo/redo availability in toolbar (enabled/disabled buttons)
- [ ] Undo/redo buttons display operation descriptions on hover ("Undo Asset Move", "Redo Grid Change")
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y) work consistently across all canvas interaction states
- [ ] Undo/redo operations complete within 200ms for responsive user experience
- [ ] Context menu includes undo/redo options with current operation descriptions

### Performance Requirements
- [ ] Undo/redo stack maintains maximum 50 operations without memory issues
- [ ] Large undo operations (complex scenes with 50+ assets) complete within 500ms
- [ ] Stack memory usage remains under 25MB for maximum capacity
- [ ] Undo/redo operations maintain 60fps canvas rendering during state transitions
- [ ] Command storage is efficient and doesn't impact Scene Builder performance

### Integration Requirements
- [ ] Auto-save functionality coordinates with undo/redo system to preserve recovery points
- [ ] Undo/redo system integrates seamlessly with real-time collaboration without conflicts
- [ ] Canvas state changes from undo/redo operations broadcast to collaborating users
- [ ] Scene save operations include current undo/redo stack state for session continuity
- [ ] Undo/redo works correctly with all asset types and manipulation operations

### State Management Requirements
- [ ] Undo stack clears appropriately when new operations invalidate redo history
- [ ] Complex operations (multi-asset selection) group correctly for atomic undo/redo
- [ ] Canvas zoom and pan operations don't interfere with undo/redo stack
- [ ] Layer visibility changes integrate with undo/redo system
- [ ] Grid configuration changes are undoable and maintain grid state consistency

### Error Handling Requirements
- [ ] Undo/redo operations handle corrupted command states gracefully
- [ ] System recovers from undo/redo failures without losing canvas state
- [ ] Invalid commands are removed from stack without affecting valid operations
- [ ] Error messages provide clear feedback when undo/redo operations fail
- [ ] Canvas state remains consistent if individual command execution fails

## Business Value
- **Creative Freedom**: GMs can experiment with scene layouts without fear of permanent mistakes
- **Workflow Efficiency**: Quick error recovery keeps creative flow uninterrupted
- **Professional Quality**: Undo/redo functionality expected in professional creative tools
- **User Confidence**: Safety net encourages exploration of advanced Scene Builder features
- **Error Recovery**: Reduces support burden from accidental scene modifications

## Dependencies
- **Command Pattern Library**: Robust implementation of command/memento patterns
- **Canvas State Management**: Efficient Konva.js state serialization and restoration
- **Auto-Save Integration**: Coordination with automatic scene saving functionality
- **Collaboration System**: Integration with real-time collaborative editing

## Risk Factors
- **Memory Usage**: Large undo stacks could impact browser performance
- **State Complexity**: Complex canvas states may be difficult to serialize/restore accurately
- **Performance Impact**: Undo/redo operations must not degrade canvas performance
- **Synchronization**: Real-time collaboration adds complexity to undo/redo coordination

## Definition of Done
- All acceptance criteria are met and verified
- Undo/redo functionality tested with complex scenes and all operation types
- Performance benchmarks met for large scenes and extensive undo stacks
- Integration testing completed with auto-save and collaboration features
- Error handling covers all identified failure scenarios
- User testing confirms intuitive behavior and responsiveness
- Memory usage profiling confirms efficient stack management