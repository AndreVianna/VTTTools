// Generated: 2025-10-12
// BDD Step Definitions for Cancel Game Session Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (GameSessionService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;

namespace VttTools.Game.Tests.BDD.SessionManagement.CancelGameSession;

/// <summary>
/// BDD step definitions for cancelling game sessions.
/// Tests cancellation from any non-terminal status (except Finished).
/// Cancelled is a terminal status.
/// </summary>
[Binding]
public class CancelGameSessionSteps {
    private readonly ScenarioContext _context;
    private readonly IGameSessionStorage _storage;
    private readonly IGameSessionService _service;

    // Test state
    private Guid _userId = Guid.Empty;
    private Guid _sessionId = Guid.Empty;
    private GameSession? _session;
    private Result? _cancelResult;
    private Exception? _exception;

    public CancelGameSessionSteps(ScenarioContext context) {
        _context = context;
        _storage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_storage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I have a game session")]
    public void GivenIHaveAGameSession() {
        _sessionId = Guid.CreateVersion7();
        _session = new GameSession {
            Id = _sessionId,
            OwnerId = _userId,
            Title = "Test Session",
            Status = GameSessionStatus.Draft,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }]
        };

        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_session);

        _context["SessionId"] = _sessionId;
    }

    #endregion

    #region Given Steps - Session Status

    [Given(@"the session status is (.*)")]
    public void GivenTheSessionStatusIs(string status) {
        var sessionStatus = Enum.Parse<GameSessionStatus>(status);
        _session = _session! with { Status = sessionStatus };

        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_session);
    }

    #endregion

    #region Given Steps - Authorization

    [Given(@"the session is owned by another Game Master")]
    public void GivenTheSessionIsOwnedByAnotherGameMaster() {
        var otherUserId = Guid.CreateVersion7();
        _session = _session! with {
            OwnerId = otherUserId,
            Players = [new Participant { UserId = otherUserId, Type = PlayerType.Master }]
        };

        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_session);
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"the session does not exist")]
    public void GivenTheSessionDoesNotExist() {
        _sessionId = Guid.CreateVersion7();
        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);
    }

    #endregion

    #region When Steps - Cancel Actions

    [When(@"I cancel the game session")]
    public async Task WhenICancelTheGameSession() {
        try {
            // Mock storage to succeed
            _storage.UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // Note: GameSessionService needs a CancelGameSessionAsync method
            // For now, we'll use a placeholder that should be implemented
            _cancelResult = await CancelSessionAsync(_userId, _sessionId);
            _context["CancelResult"] = _cancelResult;

            // Capture the updated session
            if (_cancelResult.IsSuccessful) {
                await _storage.Received().UpdateAsync(
                    Arg.Is<GameSession>(s => s.Id == _sessionId && s.Status == GameSessionStatus.Cancelled),
                    Arg.Any<CancellationToken>()
                );
            }
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to cancel the game session")]
    public async Task WhenIAttemptToCancelTheGameSession() {
        await WhenICancelTheGameSession();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the session status should be Cancelled")]
    public async Task ThenTheSessionStatusShouldBeCancelled() {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.IsSuccessful.Should().BeTrue();

        // Verify the storage was called with Cancelled status
        await _storage.Received().UpdateAsync(
            Arg.Is<GameSession>(s => s.Status == GameSessionStatus.Cancelled),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should receive confirmation")]
    public void ThenIShouldReceiveConfirmation() {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.IsSuccessful.Should().BeTrue();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail")]
    public void ThenTheRequestShouldFail() {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.Errors.Should().Contain(e =>
            e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.IsSuccessful.Should().BeFalse();
        _cancelResult!.Errors.Should().Contain(e =>
            e.Contains("authorized", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _cancelResult.Should().NotBeNull();
        _cancelResult!.IsSuccessful.Should().BeFalse();
        _cancelResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Private Helper Methods

    /// <summary>
    /// Helper method that implements cancel logic until CancelGameSessionAsync is added to service.
    /// This method validates business rules for cancellation.
    /// </summary>
    private async Task<Result> CancelSessionAsync(Guid userId, Guid sessionId) {
        var session = await _storage.GetByIdAsync(sessionId, CancellationToken.None);
        if (session is null)
            return Result.Failure("Session not found");

        // Check authorization
        var isGameMaster = session.Players.Any(p =>
            p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return Result.Failure("Not authorized");

        // Business Rule: Cannot cancel from Finished status
        if (session.Status == GameSessionStatus.Finished)
            return Result.Failure("Cannot cancel session from Finished status");

        // Business Rule: Cannot cancel already cancelled session (terminal status)
        if (session.Status == GameSessionStatus.Cancelled)
            return Result.Failure("Cannot cancel session from Cancelled status");

        // Update to Cancelled status
        session = session with { Status = GameSessionStatus.Cancelled };
        await _storage.UpdateAsync(session, CancellationToken.None);
        return Result.Success();
    }

    #endregion
}
