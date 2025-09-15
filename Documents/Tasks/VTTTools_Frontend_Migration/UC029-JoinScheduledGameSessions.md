# UC029: Join Scheduled Game Sessions

## Use Case Overview
**Use Case ID**: UC029  
**Use Case Name**: Join Scheduled Game Sessions  
**User Story**: As a player, I want to join scheduled game sessions so that I can participate in campaigns  
**Primary Actor**: Player  
**Scope**: VTTTools React Frontend - Game Session Management  
**Level**: User Task  

## Preconditions
- User is authenticated as a player
- User has received and accepted an invitation to a game session
- Session is scheduled and ready for player participation

## Main Success Scenario
1. **Session Access**: Player navigates to scheduled sessions or follows invitation link
2. **Session Selection**: Player selects the session they want to join
3. **Pre-session Check**: System performs technical readiness check (browser, connections)
4. **Character Preparation**: Player selects or creates character for the session
5. **Session Join**: Player joins the session lobby or waiting area
6. **Readiness Confirmation**: Player confirms they are ready to start when prompted
7. **Session Entry**: Player enters the active game session
8. **Participation Setup**: Player's interface loads with appropriate tools and permissions

## Alternative Flows

### 2a. Session Link Access
- 2a1. Player clicks direct session link from invitation email
- 2a2. System validates invitation token and session access
- 2a3. System redirects player to session join interface
- 2a4. Continue from step 3

### 3a. Technical Issues Detected
- 3a1. System detects browser compatibility or connection issues
- 3a2. System displays specific technical requirements and troubleshooting steps
- 3a3. Player resolves technical issues or gets assistance
- 3a4. System re-runs technical check once issues are addressed
- 3a5. Continue from step 4 if successful

### 4a. Character Creation Required
- 4a1. Player needs to create new character for campaign
- 4a2. System provides character creation interface within session context
- 4a3. Player creates character following campaign requirements
- 4a4. GM approves character if approval workflow is enabled
- 4a5. Continue from step 5 once character is ready

### 5a. Session Not Yet Started
- 5a1. Player joins session lobby before GM starts the session
- 5a2. System displays waiting area with other joined players
- 5a3. Players can chat and prepare while waiting for session start
- 5a4. System notifies players when GM starts the session
- 5a5. Continue from step 7

### 7a. Late Session Join
- 7a1. Player attempts to join session already in progress
- 7a2. System checks if late joining is allowed for the session
- 7a3. GM receives notification of late join request
- 7a4. GM approves or denies late join request
- 7a5. If approved, player joins with current session state

## Postconditions
**Success**: Player successfully joined session and can participate fully
**Failure**: Player unable to join session, receives guidance for resolution

## Business Rules
- Players can only join sessions they have been invited to
- Session joining closes 15 minutes after scheduled start time (configurable)
- Players must pass technical compatibility checks before joining
- Character selection must comply with campaign requirements
- Late joining requires GM approval for sessions in progress
- Players can leave and rejoin sessions unless restricted by GM

## Technical Requirements

### React Components Needed
- **SessionJoiner**: Main interface for joining scheduled sessions
- **SessionList**: Display of player's scheduled and available sessions
- **TechnicalChecker**: Component for browser and connection testing
- **CharacterSelector**: Interface for selecting or creating characters
- **SessionLobby**: Waiting area component for pre-session interaction
- **JoinProgress**: Progress indicator for session joining process
- **PermissionValidator**: Component for checking session access permissions
- **SessionInterface**: Main game interface loaded after successful join

### API Integration Points
- **GET** `/api/sessions/player/{userId}` - Retrieve player's scheduled sessions
- **POST** `/api/sessions/{sessionId}/join` - Join specific session
- **GET** `/api/sessions/{sessionId}/technical-check` - Perform technical validation
- **GET** `/api/sessions/{sessionId}/characters` - Get available characters for session
- **PUT** `/api/sessions/{sessionId}/ready` - Mark player as ready to start
- **GET** `/api/sessions/{sessionId}/status` - Check current session status
- **POST** `/api/sessions/{sessionId}/late-join` - Request late join approval

### State Management
- Session join state with progress tracking
- Technical validation state with results
- Character selection state with campaign requirements
- Lobby state with player interactions
- Session connection state with real-time updates
- Permission state with role-based access

### Real-time Integration
- SignalR connection for session state updates
- Real-time lobby chat for pre-session communication
- Instant notifications for session start and player status changes
- Live technical status monitoring

## Acceptance Criteria
- [ ] Session list loads within 2 seconds showing all player's scheduled sessions
- [ ] Technical compatibility check completes within 5 seconds
- [ ] Direct invitation links validate and redirect appropriately within 3 seconds
- [ ] Character selection interface shows campaign-appropriate options
- [ ] Session lobby displays other joined players with real-time updates
- [ ] Join process completes within 10 seconds under normal conditions
- [ ] Late join requests notify GM immediately and process responses within 5 seconds
- [ ] Player interface loads with appropriate permissions and tools after successful join
- [ ] Session connection remains stable with automatic reconnection on brief interruptions
- [ ] Player can leave and rejoin session without losing progress or state
- [ ] Mobile-friendly interface supports tablet participation

## Error Handling Requirements
- Invalid invitation tokens with clear error messaging and support contact
- Session not found or cancelled with alternative session suggestions
- Technical compatibility failures with specific resolution instructions
- Character validation errors with campaign requirement explanations
- Network connectivity issues during join process with retry mechanisms
- Session capacity exceeded with waitlist option if available

## Performance Requirements
- Session list loads and displays within 2 seconds
- Join process completes within 10 seconds for standard sessions
- Technical checks run efficiently without blocking UI interaction
- Real-time updates respond within 3 seconds during lobby phase
- Session interface loads completely within 15 seconds of successful join
- Connection stability maintained with < 5% packet loss tolerance

## Security Considerations  
- Validate session invitation tokens and expiration times
- Verify player permissions before allowing session access
- Secure session data transmission during join process
- Prevent unauthorized session joining through direct links
- Audit logging for all session join activities
- Rate limiting for join attempts to prevent abuse

## Technical Compatibility
- Browser compatibility check for required features (WebGL, WebSocket, etc.)
- Network connectivity and latency testing
- Audio/video capability detection if required
- Mobile device compatibility validation
- Screen resolution and viewport requirement checking

## User Experience Requirements
- Clear progress indicators throughout join process
- Helpful error messages with specific resolution steps
- Smooth transition from lobby to active session
- Intuitive character selection with campaign context
- Responsive interface that works across device types
- Accessible design supporting assistive technologies

## Accessibility Requirements
- Screen reader support for all join process interfaces
- Keyboard navigation for session selection and joining
- High contrast mode support for session status indicators
- Alternative text for session and player status icons
- Focus management throughout multi-step join process
- Voice commands support where applicable

## Integration Requirements
- Calendar integration showing session schedule and reminders
- Character sheet integration for seamless character access
- Chat system preparation for session communication
- Asset library integration for player-accessible content
- Profile integration for player preferences and settings
- External tool integration (Discord, etc.) if configured