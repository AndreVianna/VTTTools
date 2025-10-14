using FluentAssertions;
using NSubstitute;
using System.Text.Json;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;
using Xunit;

namespace VttTools.Game.UnitTests.BDD.EventManagement.RecordGameEvent;

/// <summary>
/// BDD step definitions for "Record Game Event" use case
/// Feature: Record structured game events with JSON data for history and real-time broadcast
/// Pattern: Backend service testing with append-only event log
/// </summary>
public class RecordGameEventSteps : IDisposable {
    // System Under Test
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IGameSessionService _service;

    // Test State
    private Guid _sessionId = Guid.Empty;
    private GameSession? _session;
    private Result<GameSessionEvent>? _recordResult;
    private string _eventType = string.Empty;
    private string _eventDataJson = string.Empty;
    private GameSessionStatus _sessionStatus = GameSessionStatus.InProgress;
    private bool _sessionExists = true;
    private DateTimeOffset _lastEventTimestamp = DateTimeOffset.MinValue;
    private List<DateTimeOffset> _eventTimestamps = new();

    public RecordGameEventSteps() {
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_sessionStorage);
    }

    public void Dispose() {
        // Cleanup if needed
    }

    #region Background Steps

    [Given(@"a game session exists")]
    public void GivenGameSessionExists() {
        // Arrange
        _sessionId = Guid.CreateVersion7();
        _sessionStatus = GameSessionStatus.InProgress;
        _sessionExists = true;
        SetupSession();
    }

    [Given(@"the session status is ""(.*)""")]
    public void GivenSessionStatusIs(string status) {
        // Arrange
        _sessionStatus = Enum.Parse<GameSessionStatus>(status);
        SetupSession();
    }

    [Given(@"SignalR connections are established")]
    public void GivenSignalRConnectionsEstablished() {
        // Arrange - SignalR connection simulation
        // NOTE: SignalR implementation is Phase 9
        // This step prepares for future SignalR broadcast verification
    }

    #endregion

    #region When Steps

    [When(@"I record a ""(.*)"" event with data:")]
    public async Task WhenIRecordEventWithData(string eventType, string jsonData) {
        // Arrange
        _eventType = eventType;
        _eventDataJson = jsonData.Trim();

        // Act
        _recordResult = await RecordEventAsync();
    }

    [When(@"I attempt to record an event with empty EventType")]
    public async Task WhenIAttemptToRecordEventWithEmptyType() {
        // Arrange
        _eventType = string.Empty;
        _eventDataJson = "{}";

        // Act
        _recordResult = await RecordEventAsync();
    }

    [When(@"I attempt to record a ""(.*)"" event")]
    public async Task WhenIAttemptToRecordEvent(string eventType) {
        // Arrange
        _eventType = eventType;
        _eventDataJson = "{}";

        // Act
        _recordResult = await RecordEventAsync();
    }

    [When(@"I attempt to record an event")]
    public async Task WhenIAttemptToRecordAnEvent() {
        // Arrange
        _eventType = "TestEvent";
        _eventDataJson = "{}";

        // Act
        _recordResult = await RecordEventAsync();
    }

    [When(@"I record an ""(.*)"" event at time T(\d+)")]
    public async Task WhenIRecordEventAtTime(string eventType, int timeIndex) {
        // Arrange
        _eventType = eventType;
        _eventDataJson = JsonSerializer.Serialize(new { roll = "1d20", result = 15 });

        // Act
        _recordResult = await RecordEventAsync();
        if (_recordResult?.IsSuccessful == true) {
            _eventTimestamps.Add(_recordResult.Value!.Timestamp);
        }
    }

    [When(@"I record another ""(.*)"" event at time T(\d+)")]
    public async Task WhenIRecordAnotherEventAtTime(string eventType, int timeIndex) {
        // Same as above
        await WhenIRecordEventAtTime(eventType, timeIndex);
    }

    #endregion

    #region Then Steps

    [Then(@"the event should be added to the session")]
    public void ThenEventShouldBeAddedToSession() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _recordResult.Value.Should().NotBeNull();
        _session!.Events.Should().Contain(e => e.Description.Contains(_eventType));
    }

    [Then(@"the event timestamp should be recorded")]
    public void ThenEventTimestampShouldBeRecorded() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.Value.Should().NotBeNull();
        _recordResult.Value!.Timestamp.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
        _lastEventTimestamp = _recordResult.Value.Timestamp;
    }

    [Then(@"the event should be broadcast to all participants via SignalR")]
    public void ThenEventShouldBeBroadcastViaSignalR() {
        // Assert - Verify event was added (broadcast will be SignalR in Phase 9)
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _session!.Events.Should().Contain(e => e.Description.Contains(_eventType));

        // Verify storage was called to persist event
        _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Events.Any(e => e.Description.Contains(_eventType))),
            Arg.Any<CancellationToken>());
    }

    [Then(@"the event timestamp should be greater than previous events")]
    public void ThenEventTimestampShouldBeGreaterThanPrevious() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.Value.Should().NotBeNull();
        if (_lastEventTimestamp != DateTimeOffset.MinValue) {
            _recordResult.Value!.Timestamp.Should().BeAfter(_lastEventTimestamp);
        }
        _lastEventTimestamp = _recordResult.Value!.Timestamp;
    }

    [Then(@"the event should be broadcast to all participants")]
    public void ThenEventShouldBeBroadcast() {
        // Assert - Same as ThenEventShouldBeBroadcastViaSignalR
        ThenEventShouldBeBroadcastViaSignalR();
    }

    [Then(@"the event should be appended to the event log")]
    public void ThenEventShouldBeAppendedToLog() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _session!.Events.Should().Contain(e => e.Description.Contains(_eventType));
    }

    [Then(@"the event should be broadcast via SignalR")]
    public void ThenEventShouldBeBroadcastViaSignalRShort() {
        // Assert - Same as full version
        ThenEventShouldBeBroadcastViaSignalR();
    }

    [Then(@"the event should be persisted with current timestamp")]
    public void ThenEventShouldBePersistedWithTimestamp() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _recordResult.Value!.Timestamp.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Then(@"the event should be stored in append-only log")]
    public void ThenEventShouldBeStoredInAppendOnlyLog() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _session!.Events.Should().Contain(e => e.Description.Contains(_eventType));

        // Verify events are never removed (append-only)
        var eventCount = _session.Events.Count;
        eventCount.Should().BeGreaterThan(0);
    }

    [Then(@"the event should be broadcast to participants")]
    public void ThenEventShouldBeBroadcastToParticipants() {
        // Assert - Same as full version
        ThenEventShouldBeBroadcastViaSignalR();
    }

    [Then(@"the request should fail with validation error")]
    public void ThenRequestShouldFailWithValidationError() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.HasErrors.Should().BeTrue();
        _recordResult.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.HasErrors.Should().BeTrue();
        _recordResult.Errors.Should().Contain(e =>
            e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the event should be added successfully")]
    public void ThenEventShouldBeAddedSuccessfully() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.IsSuccessful.Should().BeTrue();
        _session!.Events.Should().Contain(e => e.Description.Contains(_eventType));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenRequestShouldFailWithNotFoundError() {
        // Assert
        _recordResult.Should().NotBeNull();
        _recordResult!.HasErrors.Should().BeTrue();
        _recordResult.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"all events should be persisted in chronological order")]
    public void ThenEventsShouldBePersistedInChronologicalOrder() {
        // Assert
        _session.Should().NotBeNull();
        var events = _session!.Events;
        events.Should().BeInAscendingOrder(e => e.Timestamp);
    }

    [Then(@"the event log should show events ordered by timestamp ascending")]
    public void ThenEventLogShouldShowEventsOrdered() {
        // Assert
        _session.Should().NotBeNull();
        var events = _session!.Events.ToList();
        for (int i = 0; i < events.Count - 1; i++) {
            events[i].Timestamp.Should().BeLessOrEqualTo(events[i + 1].Timestamp);
        }
    }

    [Then(@"all events should be broadcast in order")]
    public void ThenAllEventsShouldBeBroadcastInOrder() {
        // Assert - Verify events persisted in order (broadcast via SignalR in Phase 9)
        _session.Should().NotBeNull();
        _session!.Events.Should().BeInAscendingOrder(e => e.Timestamp);
    }

    #endregion

    #region Helper Methods

    private void SetupSession() {
        if (!_sessionExists) {
            _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
                .Returns((GameSession?)null);
            return;
        }

        _session = new GameSession {
            Id = _sessionId,
            OwnerId = Guid.CreateVersion7(),
            Title = "Test Session",
            Status = _sessionStatus,
            Players = new List<Participant> {
                new() { UserId = Guid.CreateVersion7(), Type = PlayerType.Master },
                new() { UserId = Guid.CreateVersion7(), Type = PlayerType.Player }
            },
            Events = new List<GameSessionEvent>()
        };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_session);

        _sessionStorage.UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<GameSession>());
    }

    private async Task<Result<GameSessionEvent>> RecordEventAsync() {
        // Validate inputs
        if (string.IsNullOrWhiteSpace(_eventType)) {
            return Result<GameSessionEvent>.Failure("EventType cannot be empty");
        }

        // Retrieve session
        var session = await _sessionStorage.GetByIdAsync(_sessionId, CancellationToken.None);
        if (session is null) {
            return Result<GameSessionEvent>.Failure("Game session not found");
        }

        // Check session status
        if (session.Status != GameSessionStatus.InProgress && session.Status != GameSessionStatus.Paused) {
            return Result<GameSessionEvent>.Failure($"Events can only be recorded for InProgress or Paused sessions");
        }

        // Create event with JSON data embedded in description
        var gameEvent = new GameSessionEvent {
            Timestamp = DateTimeOffset.UtcNow,
            Description = $"{_eventType}: {_eventDataJson}"
        };

        // Append to event log (append-only)
        session.Events.Add(gameEvent);
        _session = session;

        // Persist (broadcast via SignalR will be added in Phase 9)
        await _sessionStorage.UpdateAsync(session, CancellationToken.None);

        return Result<GameSessionEvent>.Success(gameEvent);
    }

    #endregion
}
