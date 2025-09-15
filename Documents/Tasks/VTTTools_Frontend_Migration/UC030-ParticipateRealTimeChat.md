# UC030: Participate in Real-time Chat

## Use Case Overview
**Use Case ID**: UC030  
**Use Case Name**: Participate in Real-time Chat  
**User Story**: As a player, I want to participate in real-time chat through React components so that I can communicate during game sessions  
**Primary Actor**: Player or Game Master  
**Scope**: VTTTools React Frontend - Real-time Communication  
**Level**: User Task  

## Preconditions
- User is authenticated and participating in an active game session
- Real-time communication features are enabled for the session
- User has appropriate permissions to participate in chat

## Main Success Scenario
1. **Chat Access**: User accesses chat interface during game session
2. **Message Composition**: User types message in chat input field
3. **Message Formatting**: User applies formatting (bold, italic) or adds emojis if desired
4. **Message Send**: User sends message to session participants
5. **Real-time Delivery**: Message appears immediately in all participants' chat windows
6. **Message History**: User can scroll through previous messages and conversation history
7. **Ongoing Participation**: User continues to participate in conversation throughout session

## Alternative Flows

### 2a. Private Message Mode
- 2a1. User selects private message option or whispers to specific player
- 2a2. User selects target recipient from participant list
- 2a3. User composes private message
- 2a4. Private message delivers only to selected recipient and sender
- 2a5. Private messages marked clearly in chat history

### 3a. Rich Message Features
- 3a1. User inserts emoji using emoji picker or shorthand codes
- 3a2. User applies text formatting (bold, italic, underline)
- 3a3. User mentions other participants using @username syntax
- 3a4. User attaches images or links if permissions allow
- 3a5. Continue from step 4 with formatted message

### 4a. Dice Roll Integration
- 4a1. User enters dice notation (e.g., /roll 1d20+3) in chat
- 4a2. System processes dice roll and calculates results
- 4a3. System displays roll result in chat with calculation details
- 4a4. Roll results highlighted and logged for session record
- 4a5. Continue from step 5

### 6a. Message Search and Filter
- 6a1. User opens message search/filter interface
- 6a2. User enters search terms or selects filter criteria
- 6a3. System displays filtered message history
- 6a4. User can navigate to specific messages or time periods
- 6a5. User returns to live chat with context

## Postconditions
**Success**: User successfully communicates with session participants in real-time
**Failure**: Messages fail to deliver, user unable to participate in communication

## Business Rules
- All session participants can see public messages in real-time
- Private messages only visible to sender and specified recipient
- Chat history preserved for session duration and configurable retention
- Inappropriate content can be reported and moderated
- GMs have additional moderation controls (mute, message deletion)
- Message timestamps show in user's local timezone
- Maximum message length: 2000 characters

## Technical Requirements

### React Components Needed
- **ChatInterface**: Main chat window with message display and input
- **MessageComposer**: Input field with formatting controls and emoji picker
- **MessageDisplay**: Individual message component with formatting and metadata
- **ParticipantList**: List of session participants for private messaging
- **EmojiPicker**: Emoji selection interface integrated with input
- **MessageHistory**: Scrollable history with search and filter capabilities
- **PrivateMessagePanel**: Interface for managing private conversations
- **DiceRoller**: Integrated dice rolling interface within chat

### API Integration Points
- **SignalR Hub** `/chathub` - Real-time message broadcasting and receiving
- **POST** `/api/chat/{sessionId}/message` - Send chat message
- **GET** `/api/chat/{sessionId}/history` - Retrieve message history
- **POST** `/api/chat/{sessionId}/private` - Send private message
- **GET** `/api/chat/{sessionId}/participants` - Get session participant list
- **POST** `/api/chat/{sessionId}/roll` - Process dice roll command
- **DELETE** `/api/chat/{sessionId}/message/{messageId}` - Delete message (GM only)

### State Management
- Chat message history with real-time updates
- Message composition state with draft persistence
- Private conversation state management
- Participant list with online status
- Chat settings and preferences
- Dice roll history and results

### Real-time Features
- SignalR integration for instant message delivery
- Typing indicators showing when participants are composing messages
- Real-time participant status updates (online, typing, idle)
- Message delivery confirmations
- Connection status monitoring with reconnection handling

## Acceptance Criteria
- [ ] Messages appear in all participants' chat windows within 2 seconds of sending
- [ ] Chat interface loads message history within 3 seconds of session join
- [ ] Typing indicators show within 1 second when participants start typing
- [ ] Private messages deliver only to intended recipients with clear visual distinction
- [ ] Emoji picker loads within 1 second and supports Unicode emoji standards
- [ ] Message formatting (bold, italic) renders correctly across all participants
- [ ] Dice roll commands process within 2 seconds and display formatted results
- [ ] Message history supports scrolling through 500+ messages without performance issues
- [ ] @mention notifications highlight mentioned participants immediately
- [ ] Chat remains functional during network interruptions with message queuing
- [ ] Mobile-friendly interface supports touch typing and emoji selection

## Error Handling Requirements
- Network connectivity issues with message queuing and retry mechanisms
- SignalR connection failures with automatic reconnection attempts
- Message delivery failures with error indicators and resend options
- Large message handling with character count warnings
- Inappropriate content detection with reporting mechanisms
- Connection timeout handling with graceful reconnection

## Performance Requirements
- Message delivery within 2 seconds under normal network conditions
- Chat history loads incrementally for sessions with 1000+ messages
- Emoji picker responds within 500ms of activation
- Typing indicators update within 1 second of user input
- Message search completes within 3 seconds for typical session history
- Interface remains responsive with 8 concurrent participants actively chatting

## Security Considerations  
- Message content sanitization to prevent XSS attacks
- Rate limiting for message sending to prevent spam
- Private message encryption for sensitive communications
- Audit logging for moderation and compliance purposes
- User reporting mechanisms for inappropriate behavior
- Authentication validation for all chat operations

## Privacy Requirements
- Private messages not logged in public session records
- User ability to delete their own messages within time limit
- Configurable message retention policies
- Opt-out mechanisms for message history storage
- Compliance with data protection regulations

## Accessibility Requirements
- Screen reader support for message content and navigation
- Keyboard shortcuts for common chat actions (send, emoji, private message)
- High contrast mode support for chat interface elements
- Alternative text for emojis and formatting indicators
- Focus management for chat input and message navigation
- Voice-to-text input support where available

## Integration Requirements
- Session context integration showing game state changes in chat
- Character name integration for in-character messaging
- Scene Builder integration for location-based chat channels
- Dice rolling integration with game system rules
- External communication tool bridges (Discord, etc.)
- Session recording integration including chat transcripts

## Usability Requirements
- Intuitive message composition with familiar social media patterns
- Clear visual distinction between message types (public, private, system)
- Persistent draft messages that survive accidental page refresh
- Quick access to frequently used emojis and formatting
- Contextual timestamps showing relative time (e.g., "5 minutes ago")
- Smooth scrolling with automatic scroll to new messages option
- Mention autocomplete for participant names
- Message reactions/responses for quick feedback without typing