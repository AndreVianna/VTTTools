# Use Case UC016: Set Adventure Visibility Controls

## Actor
GM (Game Master)

## Goal
Manage who can access and view adventures by controlling visibility and sharing permissions for campaign privacy and collaboration

## Preconditions
- GM is authenticated and owns the adventure
- Adventure exists and is accessible
- Visibility management service is available

## Main Flow
1. GM accesses adventure settings or visibility controls
2. System displays current visibility settings and sharing options
3. GM selects desired visibility level (private, public, shared)
4. GM configures specific sharing permissions if applicable
5. GM sets publication status (draft, published, archived)
6. GM applies visibility changes
7. System updates adventure permissions and access controls
8. Changes take effect immediately for all users

## Alternative Flows
**A1 - Granular Permissions:**
1. GM chooses advanced permission settings
2. System displays detailed permission matrix
3. GM sets specific permissions for different user roles
4. GM applies custom permission configuration

**A2 - Share with Specific Users:**
1. GM selects option to share with specific users
2. System provides user search and selection interface
3. GM finds and selects users to share with
4. GM assigns permission levels for each user
5. System sends sharing notifications to selected users

**A3 - Public Publication:**
1. GM chooses to make adventure publicly available
2. System displays public sharing guidelines and requirements
3. GM confirms understanding of public visibility implications
4. System publishes adventure to public library with appropriate metadata

## Postconditions
- Adventure visibility is updated according to GM preferences
- Access permissions are enforced across the system
- Appropriate users receive sharing notifications
- Adventure appears in correct visibility contexts (public, private, shared)

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
- Create visibility control components with clear permission options
- Implement user search and selection for sharing functionality
- Use React Hook Form for permission settings management
- Integrate with adventure permissions API endpoints
- Add real-time validation for permission conflicts
- Implement permission preview functionality
- Create notification system for sharing activities
- Use proper loading states for permission changes
- Add audit logging for visibility and permission changes
- Implement role-based permission templates for easy configuration