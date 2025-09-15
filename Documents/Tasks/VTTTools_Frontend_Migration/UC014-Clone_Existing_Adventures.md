# Use Case UC014: Clone Existing Adventures

## Actor
GM (Game Master)

## Goal
Create a copy of an existing adventure to reuse campaign structures and configurations for new campaigns or variations

## Preconditions
- GM is authenticated and has access to the adventure to clone
- Adventure cloning service is available
- GM has permissions to create new adventures

## Main Flow
1. GM navigates to adventures list and selects adventure to clone
2. System displays adventure details with clone option
3. GM clicks clone button to initiate cloning process
4. System displays clone configuration dialog with options
5. GM specifies clone settings (name, deep copy options, what to include)
6. GM confirms cloning parameters and submits request
7. System creates deep copy of adventure with all associated data
8. System generates new adventure with cloned content
9. GM is redirected to the new cloned adventure for customization

## Alternative Flows
**A1 - Selective Cloning:**
1. GM chooses specific elements to clone (scenes, assets, settings)
2. System displays checkboxes for cloneable components
3. GM selects desired components for the clone
4. System creates partial clone with selected elements only

**A2 - Name Conflict:**
1. Cloned adventure name already exists for GM
2. System automatically suggests alternative name
3. GM can accept suggestion or provide custom name
4. System proceeds with unique name for cloned adventure

**A3 - Large Adventure Cloning:**
1. Adventure contains extensive content requiring longer processing
2. System displays progress indicator for cloning operation
3. GM can continue working while cloning completes in background
4. System notifies GM when cloning is finished

## Postconditions
- New adventure is created as complete copy of original
- GM owns the cloned adventure with full permissions
- Cloned adventure is independent of original
- All associated content is properly duplicated

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
- Implement clone dialog with React Modal and configuration options
- Use React Hook Form for clone settings and naming
- Create deep cloning logic for all adventure components
- Implement progress tracking for large adventure cloning
- Use React Query mutations for cloning API calls
- Add proper loading states and progress indicators
- Handle large data cloning with background processing
- Implement selective cloning with checkbox interfaces
- Add error handling for cloning failures and recovery
- Use React Router for navigation to cloned adventures