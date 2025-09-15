# UC022: Delete Assets

## Use Case Overview
**Use Case ID**: UC022  
**Use Case Name**: Delete Assets  
**User Story**: As a GM, I want to delete assets so that I can remove unwanted items from my library  
**Primary Actor**: Game Master (GM)  
**Scope**: VTTTools React Frontend - Asset Management  
**Level**: User Task  

## Preconditions
- User is authenticated as a GM
- User has access to asset library
- At least one asset exists in the user's library
- User has delete permissions for the asset

## Main Success Scenario
1. **Asset Selection**: GM navigates to asset library and selects asset(s) to delete
2. **Delete Initiation**: GM triggers delete action (context menu, delete button, or keyboard shortcut)
3. **Dependency Check**: System checks if asset is used in any scenes or adventures
4. **Confirmation Dialog**: System displays confirmation dialog with dependency warnings if applicable
5. **Delete Confirmation**: GM confirms deletion after reviewing warnings
6. **Asset Removal**: System permanently removes asset and associated files
7. **UI Update**: System updates asset library view and provides success feedback

## Alternative Flows

### 3a. Asset Has Dependencies
- 3a1. System identifies scenes/adventures using the asset
- 3a2. System displays warning about dependencies in confirmation dialog
- 3a3. GM can choose to proceed (with orphaned references) or cancel
- 3a4. If proceed, continue from step 5; if cancel, use case ends

### 3b. Asset Currently in Use
- 3b1. System detects asset is currently placed in an active scene
- 3b2. System displays stronger warning about active usage
- 3b3. GM must confirm understanding that scene elements will be affected
- 3b4. Continue from step 5

### 6a. Delete Operation Fails
- 6a1. System displays error message with specific failure reason
- 6a2. Asset remains in library with error status indicator
- 6a3. GM can retry deletion or contact support
- 6a4. Use case ends with failure state

### Multiple Asset Deletion
- 1a. GM selects multiple assets for bulk deletion
- 1b. System performs dependency check for all selected assets
- 1c. System displays consolidated confirmation with dependency summary
- 1d. GM can proceed with all, remove flagged assets from selection, or cancel
- 1e. Continue with batch deletion process

## Postconditions
**Success**: Asset(s) permanently removed from system, library updated, references cleaned up
**Failure**: Asset(s) remain unchanged, user receives appropriate error feedback

## Business Rules
- GMs can only delete assets they own or have been granted delete permissions
- System maintains asset deletion audit trail for compliance
- Deleted assets cannot be recovered without backup restoration
- Asset images are removed from storage after successful deletion
- Dependent scenes show placeholder or missing asset indicators after deletion
- Bulk operations have maximum limit of 50 assets per operation

## Technical Requirements

### React Components Needed
- **AssetDeleteButton**: Delete trigger component with appropriate styling
- **DependencyChecker**: Component that scans and displays asset usage
- **DeleteConfirmationDialog**: Modal dialog with warnings and confirmation
- **BulkDeleteInterface**: Component for handling multiple asset selection
- **DeletionProgress**: Progress indicator for bulk operations
- **AssetPlaceholder**: Component for showing missing assets in scenes

### API Integration Points
- **GET** `/api/assets/{assetId}/dependencies` - Check asset usage in scenes/adventures
- **DELETE** `/api/assets/{assetId}` - Delete single asset
- **POST** `/api/assets/bulk-delete` - Delete multiple assets
- **PUT** `/api/scenes/{sceneId}/cleanup-references` - Clean up orphaned asset references

### State Management
- Selected assets state for bulk operations
- Deletion progress tracking for user feedback
- Asset library state updates after successful deletion
- Error state management for failed operations
- Undo state management (if applicable for recent deletions)

### Dependency Detection
- Scene asset placement references
- Adventure asset library inclusions
- Template usage references
- Shared asset permissions and access

## Acceptance Criteria
- [ ] Single asset deletion completes within 5 seconds
- [ ] Bulk asset deletion shows progress for operations >3 seconds
- [ ] Dependency checking completes within 2 seconds for single assets
- [ ] Dependency checking completes within 10 seconds for bulk operations
- [ ] Confirmation dialog clearly shows number of dependencies and affected scenes
- [ ] Deleted assets are immediately removed from library view
- [ ] Asset images and files are cleaned up from storage within 1 minute
- [ ] Scenes with deleted assets show appropriate placeholder indicators
- [ ] Bulk operations support up to 50 assets with progress tracking
- [ ] Error messages provide specific guidance for resolution
- [ ] Keyboard shortcuts (Delete key) work for selected assets

## Error Handling Requirements
- Network connectivity issues during deletion
- Permission denied scenarios with clear messaging
- Storage cleanup failures with retry mechanisms
- Concurrent modification conflicts during bulk operations
- Server-side validation failures
- Asset locked by other users or processes

## Performance Requirements
- Single asset deletion UI feedback within 500ms
- Dependency checking optimized for large asset libraries
- Bulk operations process at minimum 10 assets per second
- UI remains responsive during bulk deletion operations
- Progress indicators update at minimum every 2 seconds

## Security Considerations  
- Validate asset ownership before allowing deletion
- Prevent deletion of system or shared assets without proper permissions
- Log all deletion activities with user identification
- Implement soft delete option for valuable assets (configurable)
- Rate limiting for bulk deletion operations to prevent abuse
- Confirm user identity for destructive operations involving multiple assets

## Recovery Considerations
- Clear warning that deletion is permanent
- Option to export asset before deletion (for backup)
- Integration with system backup procedures
- Documentation of asset restoration process for administrators
- Audit trail sufficient for compliance and recovery procedures