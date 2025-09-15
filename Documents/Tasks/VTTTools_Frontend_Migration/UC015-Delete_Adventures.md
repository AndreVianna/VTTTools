# Use Case UC015: Delete Adventures

## Actor
GM (Game Master)

## Goal
Remove unwanted adventures from the system to clean up campaign library and manage storage efficiently

## Preconditions
- GM is authenticated and owns the adventure or has delete permissions
- Adventure exists and is accessible
- Adventure deletion service is available

## Main Flow
1. GM navigates to adventures list and locates adventure to delete
2. GM selects delete option for the target adventure
3. System displays deletion confirmation dialog with impact information
4. System shows what will be deleted (scenes, assets, sessions, etc.)
5. GM confirms deletion intent by typing adventure name or confirming
6. System performs deletion of adventure and all associated content
7. System displays success message and updates adventures list
8. Adventure is permanently removed from GM's library

## Alternative Flows
**A1 - Adventure Has Active Sessions:**
1. System detects adventure has ongoing or scheduled game sessions
2. System displays warning about active sessions
3. System provides options to cancel sessions or postpone deletion
4. GM chooses how to handle active sessions before proceeding

**A2 - Shared Adventure:**
1. Adventure is shared with other users or has collaborators
2. System displays sharing information and impact warning
3. System requires additional confirmation for shared content
4. GM acknowledges impact on other users and confirms deletion

**A3 - Bulk Deletion:**
1. GM selects multiple adventures for batch deletion
2. System displays bulk deletion confirmation with count
3. System shows comprehensive impact of bulk operation
4. GM confirms bulk deletion and system processes all selected

## Postconditions
- Adventure is permanently deleted from the system
- All associated content (scenes, assets, sessions) is removed
- Adventure no longer appears in any user's lists or searches
- Storage space is reclaimed and quota is updated

## Acceptance Criteria
- [ ] Adventure creation forms with validation
- [ ] Adventure editing interface with all field updates
- [ ] Adventure cloning functionality with deep-clone support
- [ ] Adventure deletion with confirmation dialogs
- [ ] Adventure visibility controls (public/private, published/draft)
- [ ] Adventure list page with card/list views and filtering
- [ ] Adventure type selection and image management

## Technical Notes
**React Implementation Considerations:**
- Implement confirmation dialog with React Modal and impact preview
- Use cascading deletion logic for all associated content
- Add typed confirmation input for high-value content deletion
- Implement bulk deletion with progress tracking
- Use React Query mutations with optimistic updates and rollback
- Add proper loading states during deletion process
- Implement soft delete with recovery period before permanent deletion
- Create audit logging for deletion activities
- Add warning indicators for adventures with dependencies
- Use proper error handling for deletion failures