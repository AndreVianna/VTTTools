# UC026: Schedule Game Sessions

## Use Case Overview
**Use Case ID**: UC026  
**Use Case Name**: Schedule Game Sessions  
**User Story**: As a user, I want to schedule game sessions so that I can coordinate with other players  
**Primary Actor**: Game Master (GM) or Player  
**Scope**: VTTTools React Frontend - Game Session Management  
**Level**: User Task  

## Preconditions
- User is authenticated
- User has access to session scheduling features
- Adventure exists to associate with session (for GMs)

## Main Success Scenario
1. **Scheduling Access**: User navigates to session scheduling interface
2. **Session Creation**: User initiates new session creation
3. **Basic Details**: User enters session name, description, and associated adventure
4. **Date/Time Selection**: User selects session date and time with timezone handling
5. **Duration Setting**: User sets expected session duration
6. **Player Invitation**: User selects players to invite from friends/group lists
7. **Additional Settings**: User configures session settings (voice chat, recording, etc.)
8. **Schedule Confirmation**: System creates session and sends invitations
9. **Calendar Integration**: System adds session to user's calendar and provides calendar files

## Alternative Flows

### 4a. Recurring Session Setup
- 4a1. User selects recurring session option
- 4a2. User configures recurrence pattern (weekly, bi-weekly, monthly)
- 4a3. User sets recurrence end date or number of sessions
- 4a4. System creates series of sessions with proper scheduling
- 4a5. Continue from step 5

### 6a. Group Invitation
- 6a1. User selects entire gaming group instead of individual players
- 6a2. System displays group member list for confirmation
- 6a3. User can exclude specific group members if needed
- 6a4. System sends invitations to all group members
- 6a5. Continue from step 7

### 7a. Advanced Session Configuration
- 7a1. User enables advanced settings panel
- 7a2. User configures session-specific rules and preferences
- 7a3. User sets up custom scenes or asset collections for session
- 7a4. User configures player permission levels
- 7a5. Continue from step 8

### 8a. Scheduling Conflict Detection
- 8a1. System detects scheduling conflicts with invited players
- 8a2. System displays conflict warnings with affected players
- 8a3. User can adjust time, exclude conflicted players, or proceed anyway
- 8a4. System updates invitations based on user decision
- 8a5. Continue from step 9

## Postconditions
**Success**: Session scheduled, invitations sent, calendar entries created
**Failure**: Session not created, user receives guidance for resolution

## Business Rules
- Sessions must be scheduled at least 1 hour in advance
- Maximum session duration: 8 hours
- Maximum players per session: 8 participants
- Session times respect user timezone preferences
- Recurring sessions create individual session instances
- Players can be invited to sessions they don't own
- Session cancellation requires 2+ hour notice for courtesy

## Technical Requirements

### React Components Needed
- **SessionScheduler**: Main scheduling interface with calendar integration
- **SessionForm**: Form for session details and configuration
- **DateTimePicker**: Date and time selection with timezone support
- **PlayerInviter**: Interface for selecting and inviting players
- **RecurrenceConfig**: Component for setting up recurring sessions
- **ConflictResolver**: Interface for handling scheduling conflicts
- **CalendarIntegration**: Component for calendar file generation
- **SessionPreview**: Preview of scheduled session before confirmation

### API Integration Points
**EXISTING BACKEND SERVICES (Already Implemented):**
- **POST** `/api/sessions` - Create new session using Game Service
- **GET** `/api/sessions` - Retrieve user's sessions
- **GET** `/api/sessions/{id}` - Get specific session details
- **PATCH** `/api/sessions/{id}` - Update session information
- **DELETE** `/api/sessions/{id}` - Cancel/delete sessions
- **POST** `/api/sessions/{id}/join` - Join existing sessions
- **POST** `/api/sessions/{id}/leave` - Leave sessions
- **POST** `/api/sessions/{id}/start` - Start game sessions
- **POST** `/api/sessions/{id}/stop` - Stop game sessions
- **POST** `/api/sessions/{id}/scenes/{scene}/activate` - Activate scenes in sessions

**Frontend Integration Requirements:**
- Use existing Game Service endpoints with service discovery
- Integrate with WebApp ASP.NET Core Identity for authentication
- Handle authentication tokens from existing identity system
- Use existing session management contracts from Domain layer

### State Management
- Session creation state with form validation
- Player invitation state with selection management
- Calendar state with conflict detection
- Recurring session state with pattern configuration
- Timezone state with user preference handling
- Invitation response state with real-time updates

### Calendar Integration Features
- ICS file generation for external calendar applications
- Timezone conversion and display for international players
- Conflict detection with existing user calendar entries
- Reminder configuration with multiple notification options
- Integration with popular calendar services (Google, Outlook)

## Acceptance Criteria
- [ ] Session creation form validates required fields in real-time
- [ ] Date/time picker handles timezone conversions correctly
- [ ] Player invitation interface shows online status and availability hints
- [ ] Recurring session setup creates proper series with individual session management
- [ ] Conflict detection identifies overlapping sessions within 15 minutes
- [ ] Calendar file generation works with major calendar applications
- [ ] Session scheduling completes within 5 seconds of confirmation
- [ ] Invitation emails sent within 2 minutes of session creation
- [ ] Session appears in all participants' session lists immediately
- [ ] Mobile-friendly interface for on-the-go scheduling
- [ ] Session editing maintains invitation status and player responses

## Error Handling Requirements
- Past date selection with clear validation messages
- Player invitation failures with retry mechanisms
- Calendar service integration failures with fallback options
- Recurring session creation errors with partial success handling
- Network connectivity issues during scheduling process
- Maximum participant limit exceeded with clear guidance
- Timezone conversion errors with fallback to UTC

## Performance Requirements
- Session creation form loads within 1 second
- Player search and selection responds within 300ms
- Conflict detection completes within 2 seconds for complex schedules
- Calendar integration generates files within 3 seconds
- Recurring session creation processes within 10 seconds for monthly series
- Real-time invitation status updates within 5 seconds

## Security Considerations  
- Validate user permissions for session creation
- Sanitize all session details to prevent XSS attacks
- Rate limiting for session creation to prevent spam
- Privacy controls for session visibility and player information
- Secure invitation tokens to prevent unauthorized access
- Audit logging for session scheduling activities

## Notification Requirements
- Email invitations with session details and calendar attachment
- In-app notifications for invited players
- Reminder notifications 24 hours and 1 hour before session
- Push notifications for mobile users (if applicable)
- Notification preferences configurable by user
- Digest notifications for users with multiple sessions

## Integration Requirements
- Adventure association for automatic scene and asset loading
- Asset library integration for session-specific content preparation
- Chat system preparation for session communication
- Scene Builder integration for session preparation workflows
- User profile integration for player preference consideration
- Group management integration for bulk invitations

## Accessibility Requirements
- Screen reader support for all scheduling interfaces
- Keyboard navigation for date/time selection
- High contrast mode support for visual elements
- Alternative text for calendar and scheduling icons
- Focus management throughout multi-step scheduling process
- Time format preferences supporting different regional standards