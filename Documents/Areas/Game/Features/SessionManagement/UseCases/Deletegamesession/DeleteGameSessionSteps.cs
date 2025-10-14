// Generated: 2025-10-12
// BDD Step Definitions for Delete Game Session Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (GameSessionService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;

namespace VttTools.Game.Tests.BDD.SessionManagement.DeleteGameSession;

/// <summary>
/// BDD step definitions for deleting game sessions.
/// Tests permanent deletion of sessions (owner authorization required).
/// </summary>
[Binding]
public class DeleteGameSessionSteps {
    private readonly ScenarioContext _context;
    private readonly IGameSessionStorage _storage;
    private readonly IGameSessionService _service;

    // Test state
    private Guid _userId = Guid.Empty;
    private Guid _sessionId = Guid.Empty;
    private GameSession? _session;
    private Result? _deleteResult;
    private bool _sessionDeleted = false;
    private Exception? _exception;

    public DeleteGameSessionSteps(ScenarioContext context) {
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

    #endregion

    #region Given Steps - Session Ownership

    [Given(@"I am the owner of a game session")]
    public void GivenIAmTheOwnerOfAGameSession() {
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

    [Given(@"a session is owned by another Game Master")]
    public void GivenASessionIsOwnedByAnotherGameMaster() {
        _sessionId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();

        _session = new GameSession {
            Id = _sessionId,
            OwnerId = otherUserId,
            Title = "Other's Session",
            Status = GameSessionStatus.Draft,
            Players = [new Participant { UserId = otherUserId, Type = PlayerType.Master }]
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

    #region Given Steps - Error Scenarios

    [Given(@"the session does not exist")]
    public void GivenTheSessionDoesNotExist() {
        _sessionId = Guid.CreateVersion7();
        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);

        _context["SessionId"] = _sessionId;
    }

    [Given(@"I previously deleted a game session")]
    public void GivenIPreviouslyDeletedAGameSession() {
        _sessionId = Guid.CreateVersion7();
        _sessionDeleted = true;

        // Session no longer exists in storage
        _storage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);

        _context["SessionId"] = _sessionId;
        _context["PreviouslyDeleted"] = true;
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the game session")]
    public async Task WhenIDeleteTheGameSession() {
        try {
            // Mock storage to succeed
            _storage.DeleteAsync(_sessionId, Arg.Any<CancellationToken>())
                .Returns(true);

            _deleteResult = await _service.DeleteGameSessionAsync(_userId, _sessionId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;

            if (_deleteResult.IsSuccessful) {
                _sessionDeleted = true;
                _context["SessionDeleted"] = true;
            }
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete the game session")]
    public async Task WhenIAttemptToDeleteTheGameSession() {
        await WhenIDeleteTheGameSession();
    }

    [When(@"I attempt to delete the same session again")]
    public async Task WhenIAttemptToDeleteTheSameSessionAgain() {
        // Attempt to delete already deleted session
        await WhenIDeleteTheGameSession();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the session should be removed from the system")]
    public async Task ThenTheSessionShouldBeRemovedFromTheSystem() {
        _deleteResult!.IsSuccessful.Should().BeTrue();

        // Verify DeleteAsync was called
        await _storage.Received(1).DeleteAsync(_sessionId, Arg.Any<CancellationToken>());
    }

    [Then(@"the session should be permanently deleted")]
    public async Task ThenTheSessionShouldBePermanentlyDeleted() {
        // Hard delete verification - storage DeleteAsync was called
        await _storage.Received().DeleteAsync(_sessionId, Arg.Any<CancellationToken>());
        _sessionDeleted.Should().BeTrue();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("authorized", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the session should remain in the system")]
    public async Task ThenTheSessionShouldRemainInTheSystem() {
        // Verify DeleteAsync was NOT called
        await _storage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
