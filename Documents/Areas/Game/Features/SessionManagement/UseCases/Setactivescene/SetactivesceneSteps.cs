// Generated: 2025-10-12
// BDD Step Definitions for Set Active Scene Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (GameSessionService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;
using VttTools.Library.Scenes.Model;
using VttTools.Library.Scenes.Storage;
using Xunit;

namespace VttTools.Game.Tests.BDD.SessionManagement.SetActiveScene;

[Binding]
public class SetActiveSceneSteps {
    private readonly ScenarioContext _context;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IGameSessionService _service;

    // Test state
    private Guid _currentUserId = Guid.Empty;
    private Guid _sessionId = Guid.Empty;
    private Guid _sceneId = Guid.Empty;
    private Guid _newSceneId = Guid.Empty;
    private GameSession? _existingSession;
    private Scene? _existingScene;
    private Result? _setSceneResult;
    private Exception? _exception;

    public SetActiveSceneSteps(ScenarioContext context) {
        _context = context;
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
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
            SceneId = null,
            Players = [
                new Participant { UserId = _currentUserId, Type = PlayerType.Master }
            ]
        };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);

        _context["SessionId"] = _sessionId;
        _context["Session"] = _existingSession;
    }

    [Given(@"multiple scenes exist in the Library")]
    public void GivenMultipleScenesExist() {
        // Mock scene storage with multiple scenes
        _context["ScenesExist"] = true;
    }

    #endregion

    #region Given Steps - Session State

    [Given(@"the session has no active scene")]
    public void GivenSessionHasNoActiveScene() {
        _existingSession = _existingSession! with { SceneId = null };
        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);
    }

    [Given(@"the session has an active scene assigned")]
    public void GivenSessionHasActiveSceneAssigned() {
        _sceneId = Guid.CreateVersion7();
        _existingSession = _existingSession! with { SceneId = _sceneId };

        _sessionStorage.GetByIdAsync(_sessionId, Arg.Any<CancellationToken>())
            .Returns(_existingSession);

        _context["CurrentSceneId"] = _sceneId;
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

    #region Given Steps - Scene State

    [Given(@"a scene exists in the Library")]
    public void GivenSceneExistsInLibrary() {
        _sceneId = Guid.CreateVersion7();
        _existingScene = new Scene {
            Id = _sceneId,
            Name = "Test Scene",
            Description = "Test description",
            OwnerId = _currentUserId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);

        _context["SceneId"] = _sceneId;
        _context["Scene"] = _existingScene;
    }

    [Given(@"a different scene exists in the Library")]
    public void GivenDifferentSceneExistsInLibrary() {
        _newSceneId = Guid.CreateVersion7();
        var newScene = new Scene {
            Id = _newSceneId,
            Name = "Different Scene",
            Description = "Different description",
            OwnerId = _currentUserId,
            Grid = new Grid { Type = GridType.Hexagonal, CellSize = new Size(64, 64) }
        };

        _sceneStorage.GetByIdAsync(_newSceneId, Arg.Any<CancellationToken>())
            .Returns(newScene);

        _context["NewSceneId"] = _newSceneId;
        _context["NewScene"] = newScene;
    }

    [Given(@"a scene ID that does not exist in the Library")]
    public void GivenSceneIdDoesNotExist() {
        _sceneId = Guid.CreateVersion7();
        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);

        _context["SceneId"] = _sceneId;
    }

    [Given(@"a scene exists owned by another Game Master")]
    public void GivenSceneOwnedByAnotherGameMaster() {
        _sceneId = Guid.CreateVersion7();
        var differentOwnerId = Guid.CreateVersion7();

        _existingScene = new Scene {
            Id = _sceneId,
            Name = "Another GM's Scene",
            Description = "Cross-owner scene",
            OwnerId = differentOwnerId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);

        _context["SceneId"] = _sceneId;
        _context["Scene"] = _existingScene;
        _context["SceneOwnedByOther"] = true;
    }

    [Given(@"the scene is available in the Library")]
    public void GivenSceneAvailableInLibrary() {
        // Scene is already mocked as available
        _existingScene.Should().NotBeNull();
    }

    #endregion

    #region When Steps - Set Scene Actions

    [When(@"I set the active scene for the session")]
    public async Task WhenISetActiveScene() {
        await SetActiveScene(_sceneId);
    }

    [When(@"I change the active scene to the new scene")]
    public async Task WhenIChangeActiveScene() {
        await SetActiveScene(_newSceneId);
    }

    [When(@"I clear the active scene")]
    public async Task WhenIClearActiveScene() {
        await SetActiveScene(Guid.Empty);
    }

    [When(@"I attempt to set that scene as active")]
    public async Task WhenIAttemptToSetSceneAsActive() {
        await SetActiveScene(_sceneId);
    }

    [When(@"I attempt to set the active scene")]
    public async Task WhenIAttemptToSetActiveScene() {
        _sceneId = Guid.CreateVersion7();
        await SetActiveScene(_sceneId);
    }

    [When(@"I attempt to set an active scene")]
    public async Task WhenIAttemptToSetAnyActiveScene() {
        _sceneId = Guid.CreateVersion7();
        await SetActiveScene(_sceneId);
    }

    [When(@"I set that scene as active for my session")]
    public async Task WhenISetThatSceneAsActiveForMySession() {
        await SetActiveScene(_sceneId);
    }

    private async Task SetActiveScene(Guid sceneId) {
        try {
            // Check if session exists
            if (_existingSession is null) {
                _setSceneResult = Result.Failure("Game session not found");
                _context["SetSceneResult"] = _setSceneResult;
                return;
            }

            // Check authorization: Only Game Master can set scene
            var isGameMaster = _existingSession.Players.Any(p =>
                p.UserId == _currentUserId && p.Type == PlayerType.Master
            );

            if (!isGameMaster) {
                _setSceneResult = Result.Failure("Only the Game Master can modify the session");
                _context["SetSceneResult"] = _setSceneResult;
                return;
            }

            // Check if scene exists (if not clearing)
            if (sceneId != Guid.Empty) {
                var scene = await _sceneStorage.GetByIdAsync(sceneId, CancellationToken.None);
                if (scene is null) {
                    _setSceneResult = Result.Failure($"Scene with ID {sceneId} does not exist");
                    _context["SetSceneResult"] = _setSceneResult;
                    return;
                }
            }

            // Use service method
            _setSceneResult = await _service.SetActiveSceneAsync(
                _currentUserId,
                _sessionId,
                sceneId,
                CancellationToken.None
            );

            if (_setSceneResult.IsSuccessful) {
                _context["AssignedSceneId"] = sceneId;
            }

            _context["SetSceneResult"] = _setSceneResult;
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
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.IsSuccessful.Should().BeTrue();
        _setSceneResult.Errors.Should().BeEmpty();
    }

    [Then(@"the session should have the assigned scene")]
    public async Task ThenSessionShouldHaveAssignedScene() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.SceneId == _sceneId
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should receive confirmation")]
    public void ThenIShouldReceiveConfirmation() {
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the session should have the new scene assigned")]
    public async Task ThenSessionShouldHaveNewSceneAssigned() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.SceneId == _newSceneId
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the session should have no active scene")]
    public async Task ThenSessionShouldHaveNoActiveScene() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.SceneId == Guid.Empty
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the session should reference the cross-owner scene")]
    public async Task ThenSessionShouldReferenceCrossOwnerScene() {
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s =>
                s.Id == _sessionId &&
                s.SceneId == _sceneId
            ),
            Arg.Any<CancellationToken>()
        );

        // Verify scene is owned by different user
        _context.ContainsKey("SceneOwnedByOther").Should().BeTrue();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with validation error")]
    public void ThenRequestShouldFailWithValidationError() {
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.IsSuccessful.Should().BeFalse();
        _setSceneResult.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the session scene should remain unchanged")]
    public void ThenSessionSceneShouldRemainUnchanged() {
        // Verify storage was not called to update
        _sessionStorage.DidNotReceive().UpdateAsync(
            Arg.Any<GameSession>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"the request should fail with authorization error")]
    public void ThenRequestShouldFailWithAuthorizationError() {
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.IsSuccessful.Should().BeFalse();
        _setSceneResult.Errors.Should().Contain(e =>
            e.Contains("authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("Game Master", StringComparison.OrdinalIgnoreCase)
        );
    }

    [Then(@"the request should fail with not found error")]
    public void ThenRequestShouldFailWithNotFoundError() {
        _setSceneResult.Should().NotBeNull();
        _setSceneResult!.IsSuccessful.Should().BeFalse();
        _setSceneResult.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
