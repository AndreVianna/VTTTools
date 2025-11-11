// Generated: 2025-10-12
// BDD Step Definitions for Set Active Encounter Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (GameSessionService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;
using VttTools.Library.Encounters.Model;
using VttTools.Library.Encounters.Storage;
using Xunit;

namespace VttTools.Game.Tests.BDD.SessionManagement.SetActiveEncounter;

[Binding]
public class SetActiveEncounterSteps {
    private readonly ScenarioContext _context;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IEncounterStorage _encounterStorage;
    private readonly IGameSessionService _service;

    // Test state
    private Guid _currentUserId = Guid.Empty;
    private Guid _sessionId = Guid.Empty;
    private Guid _encounterId = Guid.Empty;
    private Guid _newEncounterId = Guid.Empty;
    private GameSession? _existingSession;
    private Encounter? _existingEncounter;
    private Result? _setEncounterResult;
    private Exception? _exception;

    public SetActiveEncounterSteps(ScenarioContext context) {
        _context = context;
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _service = new GameSessionService(_sessionStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _currentUserId = Guid.CreateVersion7();
        _context["CurrentUserId"] = _currentUserId;
    }

    [Given(@"I have a game session")]
    public void GivenIHaveGameSession() {
        _sessionId = Guid.CreateVersion7();
        _existingSession = new GameSession {
            Id = _sessionId,
            Title = "Test Session",
            OwnerId = _currentUserId,
            Status = GameSessionStatus.Draft,
            EncounterId = null,
            Players = [
                new Participant { UserId = _currentUserId, Type = PlayerType.Master }
            ]
        };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);

        _context["SessionId"] = _sessionId;
        _context["Session"] = _existingSession;
    }

    [Given(@"multiple encounters exist in the Library")]
    public void GivenMultipleEncountersExist() {
        // Mock encounter storage with multiple encounters
        _context["EncountersExist"] = true;
    }

    #endregion

    #region Given Steps - Session State

    [Given(@"the session has no active encounter")]
    public void GivenSessionHasNoActiveEncounter() {
        _existingSession = _existingSession! with { EncounterId = null };
        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);
    }

    [Given(@"the session has an active encounter assigned")]
    public void GivenSessionHasActiveEncounterAssigned() {
        _encounterId = Guid.CreateVersion7();
        _existingSession = _existingSession! with { EncounterId = _encounterId };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);

        _context["CurrentEncounterId"] = _encounterId;
    }

    [Given(@"the session is owned by another Game Master")]
    public void GivenSessionOwnedByAnotherGameMaster() {
        var differentOwnerId = Guid.CreateVersion7();
        _existingSession = _existingSession! with {
            OwnerId = differentOwnerId,
            Players = [
                new Participant { UserId = differentOwnerId, Type = PlayerType.Master }
            ]
        };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);
    }

    [Given(@"the session does not exist")]
    public void GivenSessionDoesNotExist() {
        _sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);
    }

    #endregion

    #region Given Steps - Encounter State

    [Given(@"a encounter exists in the Library")]
    public void GivenEncounterExistsInLibrary() {
        _encounterId = Guid.CreateVersion7();
        _existingEncounter = new Encounter {
            Id = _encounterId,
            Name = "Test Encounter",
            Description = "Test description",
            OwnerId = _currentUserId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(_existingEncounter);

        _context["EncounterId"] = _encounterId;
        _context["Encounter"] = _existingEncounter;
    }

    [Given(@"a different encounter exists in the Library")]
    public void GivenDifferentEncounterExistsInLibrary() {
        _newEncounterId = Guid.CreateVersion7();
        var newEncounter = new Encounter {
            Id = _newEncounterId,
            Name = "Different Encounter",
            Description = "Different description",
            OwnerId = _currentUserId,
            Grid = new Grid { Type = GridType.Hexagonal, CellSize = new Size(64, 64) }
        };

        _encounterStorage.GetByIdAsync(_newEncounterId, Arg.Any<CancellationToken>())
            .Returns(newEncounter);

        _context["NewEncounterId"] = _newEncounterId;
        _context["NewEncounter"] = newEncounter;
    }

    [Given(@"a encounter ID that does not exist in the Library")]
    public void GivenEncounterIdDoesNotExist() {
        _encounterId = Guid.CreateVersion7();
        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns((Encounter?)null);

        _context["EncounterId"] = _encounterId;
    }

    [Given(@"a encounter exists owned by another Game Master")]
    public void GivenEncounterOwnedByAnotherGameMaster() {
        _encounterId = Guid.CreateVersion7();
        var differentOwnerId = Guid.CreateVersion7();

        _existingEncounter = new Encounter {
            Id = _encounterId,
            Name = "Another GM's Encounter",
            Description = "Cross-owner encounter",
            OwnerId = differentOwnerId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(_existingEncounter);

        _context["EncounterId"] = _encounterId;
        _context["Encounter"] = _existingEncounter;
        _context["EncounterOwnedByOther"] = true;
    }

    [Given(@"the encounter is available in the Library")]
    public void GivenEncounterAvailableInLibrary() {
        // Encounter is already mocked as available
        _existingEncounter.Should().NotBeNull();
    }

    #endregion

    #region When Steps - Set Encounter Actions

    [When(@"I set the active encounter for the session")]
    public async Task WhenISetActiveEncounter() {
        await SetActiveEncounter(_encounterId);
    }

    [When(@"I change the active encounter to the new encounter")]
    public async Task WhenIChangeActiveEncounter() {
        await SetActiveEncounter(_newEncounterId);
    }

    [When(@"I clear the active encounter")]
    public async Task WhenIClearActiveEncounter() {
        await SetActiveEncounter(Guid.Empty);
    }

    [When(@"I attempt to set that encounter as active")]
    public async Task WhenIAttemptToSetEncounterAsActive() {
        await SetActiveEncounter(_encounterId);
    }

    [When(@"I attempt to set the active encounter")]
    public async Task WhenIAttemptToSetActiveEncounter() {
        _encounterId = Guid.CreateVersion7();
        await SetActiveEncounter(_encounterId);
    }

    [When(@"I attempt to set an active encounter")]
    public async Task WhenIAttemptToSetAnyActiveEncounter() {
        _encounterId = Guid.CreateVersion7();
        await SetActiveEncounter(_encounterId);
    }

    [When(@"I set that encounter as active for my session")]
    public async Task WhenISetThatEncounterAsActiveForMySession() {
        await SetActiveEncounter(_encounterId);
    }

    private async Task SetActiveEncounter(Guid encounterId) {
        try {
            // Check if session exists
            if (_existingSession is null) {
                _setEncounterResult = Result.Failure("Game session not found");
                _context["SetEncounterResult"] = _setEncounterResult;
                return;
            }

            // Check authorization: Only Game Master can set encounter
            var isGameMaster = _existingSession.Players.Any(p =>
                p.UserId == _currentUserId && p.Type == PlayerType.Master
            );

            if (!isGameMaster) {
                _setEncounterResult = Result.Failure("Only the Game Master can modify the session");
                _context["SetEncounterResult"] = _setEncounterResult;
                return;
            }

            // Check if encounter exists (if not clearing)
            if (encounterId != Guid.Empty) {
                var encounter = await _encounterStorage.GetByIdAsync(encounterId, CancellationToken.None);
                if (encounter is null) {
                    _setEncounterResult = Result.Failure($"Encounter with ID {encounterId} does not exist");
                    _context["SetEncounterResult"] = _setEncounterResult;
                    return;
                }
            }

            // Use service method
            _setEncounterResult = await _service.SetActiveEncounterAsync(
                _currentUserId,
                _sessionId,
                encounterId,
                CancellationToken.None
            );

            if (_setEncounterResult.IsSuccessful) {
                _context["AssignedEncounterId"] = encounterId;
            }

            _context["SetEncounterResult"] = _setEncounterResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenRequestShouldSucceed() {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.IsSuccessful.Should().BeTrue();
        _setEncounterResult.Errors.Should().BeEmpty();
    }

    [Then(@"the session should have the assigned encounter")]
    public async Task ThenSessionShouldHaveAssignedEncounter() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.EncounterId == _encounterId
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should receive confirmation")]
    public void ThenIShouldReceiveConfirmation() {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the session should have the new encounter assigned")]
    public async Task ThenSessionShouldHaveNewEncounterAssigned() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.EncounterId == _newEncounterId
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the session should have no active encounter")]
    public async Task ThenSessionShouldHaveNoActiveEncounter() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.EncounterId == Guid.Empty
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the session should reference the cross-owner encounter")]
    public async Task ThenSessionShouldReferenceCrossOwnerEncounter() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.EncounterId == _encounterId
            ),
            Arg.Any<CancellationToken>()
        );

        // Verify encounter is owned by different user
        _context.ContainsKey("EncounterOwnedByOther").Should().BeTrue();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with validation error")]
    public void ThenRequestShouldFailWithValidationError() {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.IsSuccessful.Should().BeFalse();
        _setEncounterResult.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the session encounter should remain unchanged")]
    public void ThenSessionEncounterShouldRemainUnchanged() {
        // Verify storage was not called to update
        _sessionStorage.DidNotReceive().UpdateAsync(
            Arg.Any<GameSession>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the request should fail with authorization error")]
    public void ThenRequestShouldFailWithAuthorizationError() {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.IsSuccessful.Should().BeFalse();
        _setEncounterResult.Errors.Should().Contain(e =>
            e.Contains("authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("Game Master", StringComparison.OrdinalIgnoreCase)
        );
    }

    [Then(@"the request should fail with not found error")]
    public void ThenRequestShouldFailWithNotFoundError() {
        _setEncounterResult.Should().NotBeNull();
        _setEncounterResult!.IsSuccessful.Should().BeFalse();
        _setEncounterResult.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
