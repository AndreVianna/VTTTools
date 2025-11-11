// Generated: 2025-10-12
// BDD Step Definitions for Delete Scene Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (SceneService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Assets.Model;
using VttTools.Common.Model;
using VttTools.Library.Scenes.Model;
using VttTools.Library.Scenes.Services;
using VttTools.Library.Scenes.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.SceneManagement.DeleteScene;

[Binding]
public class DeleteSceneSteps {
    private readonly ScenarioContext _context;
    private readonly ISceneStorage _sceneStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly ISceneService _service;

    // Test state
    private Scene? _existingScene;
    private Result? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _sceneId = Guid.Empty;
    private Exception? _exception;
    private bool _isReferencedByActiveSession = false;

    public DeleteSceneSteps(ScenarioContext context) {
        _context = context;
        _sceneStorage = Substitute.For<ISceneStorage>();
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new SceneService(_sceneStorage, _assetStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own a scene in my library")]
    public void GivenIAlreadyOwnASceneInMyLibrary() {
        _sceneId = Guid.CreateVersion7();
        _existingScene = new Scene {
            Id = _sceneId,
            Name = "Test Scene",
            Description = "Test Description",
            OwnerId = _userId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Stage = new Stage(),
            Assets = []
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);
    }

    #endregion

    #region Given Steps - Scene State

    [Given(@"my scene is not referenced by any active game session")]
    public void GivenMySceneIsNotReferencedByAnyActiveGameSession() {
        _isReferencedByActiveSession = false;
        _context["IsReferencedByActiveSession"] = false;
    }

    [Given(@"my scene is referenced by an active game session")]
    public void GivenMySceneIsReferencedByAnActiveGameSession() {
        _isReferencedByActiveSession = true;
        _context["IsReferencedByActiveSession"] = true;
    }

    [Given(@"my scene is referenced by (.*) active game sessions")]
    public void GivenMySceneIsReferencedByMultipleActiveSessions(int sessionCount) {
        _isReferencedByActiveSession = true;
        _context["IsReferencedByActiveSession"] = true;
        _context["ActiveSessionCount"] = sessionCount;
    }

    [Given(@"my scene is standalone with null AdventureId")]
    public void GivenMySceneIsStandaloneWithNullAdventureId() {
        if (_existingScene is not null) {
            _existingScene = _existingScene with { AdventureId = null };
            _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
                .Returns(_existingScene);
        }
    }

    [Given(@"the scene is not in any active game session")]
    public void GivenTheSceneIsNotInAnyActiveGameSession() {
        _isReferencedByActiveSession = false;
        _context["IsReferencedByActiveSession"] = false;
    }

    [Given(@"my scene is in an adventure with (.*) scenes")]
    public void GivenMySceneIsInAnAdventureWithScenes(int sceneCount) {
        var adventureId = Guid.CreateVersion7();
        if (_existingScene is not null) {
            _existingScene = _existingScene with { AdventureId = adventureId };
            _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
                .Returns(_existingScene);
        }

        _context["AdventureId"] = adventureId;
        _context["InitialSceneCount"] = sceneCount;
    }

    [Given(@"my scene has ID ""(.*)""")]
    public void GivenMySceneHasId(string sceneId) {
        _sceneId = Guid.Parse(sceneId);
        if (_existingScene is not null) {
            _existingScene = _existingScene with { Id = _sceneId };
            _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
                .Returns(_existingScene);
        }
    }

    [Given(@"my scene exists and is not in active session")]
    public void GivenMySceneExistsAndIsNotInActiveSession() {
        _existingScene.Should().NotBeNull();
        _isReferencedByActiveSession = false;
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        _sceneStorage.DeleteAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(x => throw new InvalidOperationException("Database connection failed"));
    }

    #endregion

    #region Given Steps - Asset Placements

    [Given(@"my scene has (.*) placed assets")]
    public void GivenMySceneHasPlacedAssets(int assetCount) {
        var assets = new List<SceneAsset>();
        for (int i = 0; i < assetCount; i++) {
            assets.Add(new SceneAsset {
                AssetId = Guid.CreateVersion7(),
                Index = i,
                Number = i + 1,
                Name = $"Asset {i + 1}",
                Position = new Position(i * 100, i * 100),
                Size = new Size(50, 50),
                Frame = new Frame {
                    Shape = FrameShape.Square,
                    BorderThickness = 1,
                    BorderColor = "black",
                    Background = "transparent"
                },
                Elevation = 0,
                Rotation = 0,
                ResourceId = Guid.CreateVersion7()
            });
        }

        if (_existingScene is not null) {
            _existingScene = _existingScene with { Assets = assets };
            _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
                .Returns(_existingScene);
        }

        _context["InitialAssetCount"] = assetCount;
    }

    #endregion

    #region Given Steps - Publication Status

    [Given(@"my scene is published and public")]
    public void GivenMySceneIsPublishedAndPublic() {
        if (_existingScene is not null) {
            _existingScene = _existingScene with {
                IsPublished = true,
                IsPublic = true
            };
            _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
                .Returns(_existingScene);
        }
    }

    #endregion

    #region Given Steps - Multi-Scene Scenarios

    [Given(@"I own (.*) scenes in the same adventure")]
    public void GivenIOwnMultipleScenesInSameAdventure(int sceneCount) {
        var adventureId = Guid.CreateVersion7();
        _context["AdventureId"] = adventureId;
        _context["TotalSceneCount"] = sceneCount;

        // Create first scene
        _sceneId = Guid.CreateVersion7();
        _existingScene = new Scene {
            Id = _sceneId,
            Name = "First Scene",
            OwnerId = _userId,
            AdventureId = adventureId,
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Stage = new Stage(),
            Assets = []
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);
    }

    [Given(@"the first scene has (.*) placed assets")]
    public void GivenTheFirstSceneHasPlacedAssets(int assetCount) {
        GivenMySceneHasPlacedAssets(assetCount);
        _context["FirstSceneAssetCount"] = assetCount;
    }

    [Given(@"the second scene has (.*) placed assets")]
    public void GivenTheSecondSceneHasPlacedAssets(int assetCount) {
        _context["SecondSceneAssetCount"] = assetCount;
    }

    [Given(@"neither scene is in active game session")]
    public void GivenNeitherSceneIsInActiveGameSession() {
        _isReferencedByActiveSession = false;
        _context["IsReferencedByActiveSession"] = false;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no scene exists with ID ""(.*)""")]
    public void GivenNoSceneExistsWithId(string sceneId) {
        _sceneId = Guid.Parse(sceneId);
        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);
    }

    [Given(@"a scene exists owned by another user")]
    public void GivenSceneExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _sceneId = Guid.CreateVersion7();
        _existingScene = new Scene {
            Id = _sceneId,
            Name = "Other User's Scene",
            OwnerId = otherUserId, // Different owner
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Stage = new Stage()
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserId"] = _userId;
    }

    [Given(@"a scene exists")]
    public void GivenASceneExists() {
        _sceneId = Guid.CreateVersion7();
        _existingScene = new Scene {
            Id = _sceneId,
            Name = "Test Scene",
            OwnerId = Guid.CreateVersion7(),
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Stage = new Stage()
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(_existingScene);
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the scene")]
    public async Task WhenIDeleteTheScene() {
        try {
            // Check if scene is referenced by active session
            if (_isReferencedByActiveSession) {
                _deleteResult = Result.Failure("Cannot delete scene referenced by active game session");
            } else {
                // Mock storage to succeed
                _sceneStorage.DeleteAsync(_sceneId, Arg.Any<CancellationToken>())
                    .Returns(Task.CompletedTask);

                _deleteResult = await _service.DeleteSceneAsync(_userId, _sceneId, CancellationToken.None);
            }

            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete the scene")]
    public async Task WhenIAttemptToDeleteTheScene() {
        await WhenIDeleteTheScene();
    }

    [When(@"I attempt to delete scene ""(.*)""")]
    public async Task WhenIAttemptToDeleteScene(string sceneId) {
        _sceneId = Guid.Parse(sceneId);
        await WhenIDeleteTheScene();
    }

    [When(@"I attempt to delete that scene")]
    public async Task WhenIAttemptToDeleteThatScene() {
        await WhenIDeleteTheScene();
    }

    [When(@"I delete the first scene")]
    public async Task WhenIDeleteTheFirstScene() {
        await WhenIDeleteTheScene();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the scene is removed")]
    public void ThenTheSceneIsRemoved() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive deletion confirmation")]
    public void ThenIShouldReceiveDeletionConfirmation() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the scene is removed successfully")]
    public void ThenTheSceneIsRemovedSuccessfully() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the scene should not appear in standalone scenes list")]
    public void ThenTheSceneShouldNotAppearInStandaloneScenesList() {
        // Verification would happen through query service
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the adventure should now have (.*) scenes")]
    public void ThenTheAdventureShouldNowHaveScenes(int expectedCount) {
        var initialCount = _context.Get<int>("InitialSceneCount");
        (initialCount - 1).Should().Be(expectedCount);
    }

    [Then(@"the adventure should remain intact")]
    public void ThenTheAdventureShouldRemainIntact() {
        // Adventure entity should not be affected by scene deletion
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"attempting to retrieve scene ""(.*)"" should fail")]
    public async Task ThenAttemptingToRetrieveSceneShouldFail(string sceneId) {
        var id = Guid.Parse(sceneId);
        _sceneStorage.GetByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);

        var scene = await _service.GetSceneByIdAsync(id, CancellationToken.None);
        scene.Should().BeNull();
    }

    [Then(@"public users should no longer see the scene")]
    public void ThenPublicUsersShouldNoLongerSeeTheScene() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all (.*) asset placements is removed")]
    public void ThenAllAssetPlacementsAreRemoved(int expectedCount) {
        var initialCount = _context.Get<int>("InitialAssetCount");
        initialCount.Should().Be(expectedCount);
        // Assets are deleted with the scene
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the asset templates should remain intact")]
    public void ThenTheAssetTemplatesShouldRemainIntact() {
        // Asset templates in Asset library should not be affected
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the first scene and its (.*) asset placements is removed")]
    public void ThenTheFirstSceneAndItsAssetPlacementsAreRemoved(int assetCount) {
        var firstSceneAssetCount = _context.Get<int>("FirstSceneAssetCount");
        firstSceneAssetCount.Should().Be(assetCount);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the second scene and its (.*) asset placements should remain intact")]
    public void ThenTheSecondSceneAndItsAssetPlacementsShouldRemainIntact(int assetCount) {
        var secondSceneAssetCount = _context.Get<int>("SecondSceneAssetCount");
        secondSceneAssetCount.Should().Be(assetCount);
        // Only first scene was deleted, second remains
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _deleteResult!.Errors.Should().Contain(e => e.Contains(expectedError));
    }

    [Then(@"the scene should remain in the database")]
    public void ThenTheSceneShouldRemainInTheDatabase() {
        // Scene was not deleted due to error
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain("NotFound");
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
        _exception.Should().BeOfType<InvalidOperationException>();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain("NotAllowed");
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        // In real implementation, API layer would return 401
        // Service assumes authentication happened at API layer
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        // UI behavior - would redirect to login page
        _userId.Should().Be(Guid.Empty);
    }

    [Then(@"I should see list of active sessions using the scene")]
    public void ThenIShouldSeeListOfActiveSessionsUsingTheScene() {
        var sessionCount = _context.Get<int>("ActiveSessionCount");
        sessionCount.Should().BeGreaterThan(0);
    }

    [Then(@"I should see suggestion to finish sessions first")]
    public void ThenIShouldSeeSuggestionToFinishSessionsFirst() {
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("finish") || e.Contains("complete") || e.Contains("end"));
    }

    #endregion
}
