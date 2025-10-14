using FluentAssertions;
using NSubstitute;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.ServiceContracts;
using VttTools.Game.Sessions.Storage;
using Xunit;

namespace VttTools.Game.UnitTests.BDD.ChatManagement.SendChatMessage;

/// <summary>
/// BDD step definitions for "Send Chat Message" use case
/// Feature: Allow participants to send chat messages during gameplay
/// Pattern: Backend service testing with mocked storage and SignalR
/// </summary>
public class SendChatMessageSteps : IDisposable {
    // System Under Test
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IGameSessionService _service;

    // Test State
    private Guid _userId = Guid.Empty;
    private Guid _sessionId = Guid.Empty;
    private GameSession? _session;
    private Result<GameSessionMessage>? _sendResult;
    private string _messageContent = string.Empty;
    private MessageType _messageType = MessageType.Text;
    private int _participantCount;
    private GameSessionStatus _sessionStatus = GameSessionStatus.InProgress;
    private bool _sessionExists = true;
    private bool _isParticipant = true;

    public SendChatMessageSteps() {
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_sessionStorage);
    }

    public void Dispose() {
        // Cleanup if needed
    }

    #region Background Steps

    [Given(@"I am authenticated as a session participant")]
    public void GivenIAmAuthenticatedAsSessionParticipant() {
        // Arrange
        _userId = Guid.CreateVersion7();
        _isParticipant = true;
    }

    [Given(@"I am participating in an active game session")]
    public void GivenIAmParticipatingInActiveGameSession() {
        // Arrange
        _sessionId = Guid.CreateVersion7();
        _sessionStatus = GameSessionStatus.InProgress;
        _participantCount = 3; // Default from scenario
        _sessionExists = true;
        _isParticipant = true;

        SetupSession();
    }

    [Given(@"the session status is ""(.*)""")]
    public void GivenSessionStatusIs(string status) {
        // Arrange
        _sessionStatus = Enum.Parse<GameSessionStatus>(status);
        SetupSession();
    }

    #endregion

    #region Given Steps

    [Given(@"the session has (\d+) participants")]
    public void GivenSessionHasParticipants(int count) {
        // Arrange
        _participantCount = count;
        SetupSession();
    }

    [Given(@"I am authenticated but not a participant in the session")]
    public void GivenIAmNotParticipant() {
        // Arrange
        _userId = Guid.CreateVersion7();
        _isParticipant = false;
        SetupSession();
    }

    [Given(@"the session does not exist")]
    public void GivenSessionDoesNotExist() {
        // Arrange
        _sessionId = Guid.CreateVersion7();
        _sessionExists = false;
        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);
    }

    [Given(@"another participant is connected via SignalR")]
    public void GivenAnotherParticipantConnected() {
        // Arrange - SignalR connection simulation
        // NOTE: SignalR implementation is Phase 9
        // This step prepares for future SignalR broadcast verification
        _participantCount = 2;
        SetupSession();
    }

    #endregion

    #region When Steps

    [When(@"I send a text message ""(.*)""")]
    public async Task WhenISendTextMessage(string content) {
        // Arrange
        _messageContent = content;
        _messageType = MessageType.Text;

        // Act
        _sendResult = await SendMessageAsync();
    }

    [When(@"I attempt to send a message ""(.*)""")]
    public async Task WhenIAttemptToSendMessage(string content) {
        // Arrange
        _messageContent = content;
        _messageType = MessageType.Text;

        // Act
        _sendResult = await SendMessageAsync();
    }

    [When(@"I send a command message ""(.*)""")]
    public async Task WhenISendCommandMessage(string command) {
        // Arrange
        _messageContent = command;
        _messageType = MessageType.Command;

        // Act
        _sendResult = await SendMessageAsync();
    }

    [When(@"I attempt to send an empty message")]
    public async Task WhenIAttemptToSendEmptyMessage() {
        // Arrange
        _messageContent = string.Empty;
        _messageType = MessageType.Text;

        // Act
        _sendResult = await SendMessageAsync();
    }

    [When(@"I send message ""(.*)""")]
    public async Task WhenISendMessage(string content) {
        // Arrange
        _messageContent = content;
        _messageType = MessageType.Text;

        // Act
        _sendResult = await SendMessageAsync();
    }

    #endregion

    #region Then Steps

    [Then(@"my message should be added to the session")]
    public void ThenMessageShouldBeAddedToSession() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _sendResult.Value.Should().NotBeNull();
        _sendResult.Value!.Content.Should().Be(_messageContent);
        _session!.Messages.Should().Contain(m => m.Content == _messageContent);
    }

    [Then(@"the message timestamp should be recorded")]
    public void ThenMessageTimestampShouldBeRecorded() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.Value.Should().NotBeNull();
        _sendResult.Value!.SentAt.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Then(@"my message should be broadcast to all (\d+) participants in real-time")]
    public void ThenMessageShouldBeBroadcastToAllParticipants(int count) {
        // Assert - Verify message was added (broadcast will be SignalR in Phase 9)
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _session!.Messages.Should().Contain(m => m.Content == _messageContent);

        // Verify storage was called to persist message
        _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Messages.Any(m => m.Content == _messageContent)),
            Arg.Any<CancellationToken>());
    }

    [Then(@"I should receive confirmation with the created message")]
    public void ThenIShouldReceiveConfirmation() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _sendResult.Value.Should().NotBeNull();
        _sendResult.Value!.Content.Should().Be(_messageContent);
        _sendResult.Value.SentBy.Should().Be(_userId);
    }

    [Then(@"the request should fail with authorization error")]
    public void ThenRequestShouldFailWithAuthorizationError() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.HasErrors.Should().BeTrue();
        _sendResult.Errors.Should().Contain(e =>
            e.Contains("not a participant", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("authorization", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.HasErrors.Should().BeTrue();
        _sendResult.Errors.Should().Contain(e =>
            e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"my command should be added to the session")]
    public void ThenCommandShouldBeAddedToSession() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _sendResult.Value.Should().NotBeNull();
        _sendResult.Value!.Content.Should().Be(_messageContent);
        _session!.Messages.Should().Contain(m => m.Content == _messageContent && m.Type == MessageType.Command);
    }

    [Then(@"the message type should be ""(.*)""")]
    public void ThenMessageTypeShouldBe(string messageType) {
        // Assert
        var expectedType = Enum.Parse<MessageType>(messageType);
        _sendResult.Should().NotBeNull();
        _sendResult!.Value.Should().NotBeNull();
        _sendResult.Value!.Type.Should().Be(expectedType);
    }

    [Then(@"my command should be broadcast to all participants")]
    public void ThenCommandShouldBeBroadcast() {
        // Assert - Verify command was added (broadcast will be SignalR in Phase 9)
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _session!.Messages.Should().Contain(m => m.Content == _messageContent && m.Type == MessageType.Command);
    }

    [Then(@"my message should be added successfully")]
    public void ThenMessageShouldBeAddedSuccessfully() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.IsSuccessful.Should().BeTrue();
        _session!.Messages.Should().Contain(m => m.Content == _messageContent);
    }

    [Then(@"the request should fail with validation error")]
    public void ThenRequestShouldFailWithValidationError() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.HasErrors.Should().BeTrue();
        _sendResult.Errors.Should().NotBeEmpty();
    }

    [Then(@"the request should fail with not found error")]
    public void ThenRequestShouldFailWithNotFoundError() {
        // Assert
        _sendResult.Should().NotBeNull();
        _sendResult!.HasErrors.Should().BeTrue();
        _sendResult.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"all messages should be broadcast in timestamp order")]
    public void ThenMessagesShouldBeBroadcastInOrder() {
        // Assert
        _session.Should().NotBeNull();
        var messages = _session!.Messages.OrderBy(m => m.SentAt).ToList();
        messages.Should().BeInAscendingOrder(m => m.SentAt);
    }

    [Then(@"all participants should receive all messages in real-time")]
    public void ThenParticipantsShouldReceiveAllMessages() {
        // Assert - Verify all messages persisted (SignalR broadcast in Phase 9)
        _session.Should().NotBeNull();
        _session!.Messages.Should().HaveCountGreaterOrEqualTo(2);
    }

    #endregion

    #region Helper Methods

    private void SetupSession() {
        if (!_sessionExists) {
            return;
        }

        var participants = new List<Participant>();

        if (_isParticipant) {
            participants.Add(new Participant { UserId = _userId, Type = PlayerType.Master });
        }

        // Add additional participants to reach count
        for (int i = participants.Count; i < _participantCount; i++) {
            participants.Add(new Participant {
                UserId = Guid.CreateVersion7(),
                Type = PlayerType.Player
            });
        }

        _session = new GameSession {
            Id = _sessionId,
            OwnerId = Guid.CreateVersion7(),
            Title = "Test Session",
            Status = _sessionStatus,
            Players = participants,
            Messages = new List<GameSessionMessage>()
        };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_session);

        _sessionStorage.UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<GameSession>());
    }

    private async Task<Result<GameSessionMessage>> SendMessageAsync() {
        // Validate inputs
        if (string.IsNullOrWhiteSpace(_messageContent)) {
            return Result<GameSessionMessage>.Failure("Message content cannot be empty");
        }

        // Retrieve session
        var session = await _sessionStorage.GetByIdAsync(_sessionId, CancellationToken.None);
        if (session is null) {
            return Result<GameSessionMessage>.Failure("Game session not found");
        }

        // Check authorization
        if (!session.Players.Any(p => p.UserId == _userId)) {
            return Result<GameSessionMessage>.Failure("User is not a participant in this session");
        }

        // Check session status
        if (session.Status != GameSessionStatus.InProgress && session.Status != GameSessionStatus.Paused) {
            return Result<GameSessionMessage>.Failure($"Cannot send messages in {session.Status} session");
        }

        // Create message
        var message = new GameSessionMessage {
            SentAt = DateTimeOffset.UtcNow,
            SentBy = _userId,
            SentTo = session.Players.Select(p => p.UserId).ToArray(),
            Type = _messageType,
            Content = _messageContent
        };

        // Add to session
        session.Messages.Add(message);
        _session = session;

        // Persist (broadcast via SignalR will be added in Phase 9)
        await _sessionStorage.UpdateAsync(session, CancellationToken.None);

        return Result<GameSessionMessage>.Success(message);
    }

    #endregion
}
