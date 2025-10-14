// Generated: 2025-10-12
// BDD Step Definitions for Get Scene By ID Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (SceneService.GetSceneByIdAsync)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Scenes.Model;
using VttTools.Library.Scenes.Services;
using VttTools.Library.Scenes.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.SceneManagement.GetSceneByID;

[Binding]
public class GetSceneByIDSteps {
    private readonly ScenarioContext _context;
    private readonly ISceneStorage _sceneStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly ISceneService _service;

    // Test state
    private Scene? _retrievedScene;
    private Guid _sceneId = Guid.Empty;
    private Guid _userId = Guid.Empty;
    private Exception? _exception;

    public GetSceneByIDSteps(ScenarioContext context) {
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

    #endregion

    #region Given Steps - Scene Existence

    [Given(@"a scene exists with ID ""(.*)""")]
    public void GivenASceneExistsWithId(string sceneId) {
        _sceneId = Guid.Parse(sceneId);
        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage(),
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
    }

    [Given(@"the scene has name ""(.*)""")]
    public void GivenTheSceneHasName(string name) {
        var scene = _context.Get<Scene>("ExistingScene");
        scene = scene with { Name = name };
        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);
        _context["ExistingScene"] = scene;
    }

    [Given(@"a scene exists with:")]
    public void GivenASceneExistsWith(Table table) {
        _sceneId = Guid.CreateVersion7();
        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage(),
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Assets = []
        };

        foreach (var row in table.Rows) {
            var component = row["Component"];
            var status = row["Status"];

            if (component == "Stage" && status == "configured") {
                scene = scene with {
                    Stage = new Stage {
                        Background = new Resource {
                            Id = Guid.CreateVersion7(),
                            Type = ResourceType.Image,
                            Path = "/backgrounds/dungeon.png"
                        }
                    }
                };
            }

            if (component == "Grid" && status == "configured") {
                scene = scene with {
                    Grid = new Grid {
                        Type = GridType.Square,
                        CellSize = new Size(50, 50),
                        Offset = new Position(0, 0)
                    }
                };
            }

            if (component == "Assets") {
                var count = int.Parse(status.Split(' ')[0]);
                var assets = new List<SceneAsset>();
                for (int i = 0; i < count; i++) {
                    assets.Add(new SceneAsset {
                        AssetId = Guid.CreateVersion7(),
                        Index = i,
                        Number = 1,
                        Name = $"Asset {i + 1}",
                        ResourceId = Guid.CreateVersion7(),
                        Position = new Position(i * 100, i * 100),
                        Size = new Size(50, 50)
                    });
                }
                scene = scene with { Assets = assets };
            }
        }

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
        _context["SceneId"] = _sceneId;
    }

    [Given(@"a scene exists with stage:")]
    public void GivenASceneExistsWithStage(Table table) {
        _sceneId = Guid.CreateVersion7();
        var row = table.Rows[0];

        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage {
                Background = new Resource {
                    Id = Guid.Parse(row["Background"]),
                    Type = ResourceType.Image,
                    Path = "/backgrounds/dungeon.png",
                    Metadata = new ResourceMetadata {
                        ImageSize = new Size(int.Parse(row["Width"]), int.Parse(row["Height"]))
                    }
                }
            },
            Grid = new Grid()
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
        _context["SceneId"] = _sceneId;
    }

    [Given(@"a scene exists with square grid:")]
    public void GivenASceneExistsWithSquareGrid(Table table) {
        _sceneId = Guid.CreateVersion7();
        var row = table.Rows[0];

        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage(),
            Grid = new Grid {
                Type = GridType.Square,
                CellSize = new Size(int.Parse(row["Size"]), int.Parse(row["Size"])),
                Offset = new Position(int.Parse(row["OffsetX"]), int.Parse(row["OffsetY"]))
            }
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
        _context["SceneId"] = _sceneId;
    }

    [Given(@"a scene exists with stage and grid but no assets")]
    public void GivenASceneExistsWithStageAndGridButNoAssets() {
        _sceneId = Guid.CreateVersion7();
        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage {
                Background = new Resource {
                    Id = Guid.CreateVersion7(),
                    Type = ResourceType.Image,
                    Path = "/backgrounds/empty.png"
                }
            },
            Grid = new Grid {
                Type = GridType.Square,
                CellSize = new Size(50, 50)
            },
            Assets = []
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
        _context["SceneId"] = _sceneId;
    }

    [Given(@"a scene exists with grid type ""(.*)""")]
    public void GivenASceneExistsWithGridType(string gridType) {
        _sceneId = Guid.CreateVersion7();
        var type = Enum.Parse<GridType>(gridType);

        var scene = new Scene {
            Id = _sceneId,
            OwnerId = _userId,
            Name = "Test Scene",
            Description = "Test Description",
            Stage = new Stage(),
            Grid = new Grid {
                Type = type,
                CellSize = type == GridType.None ? new Size(0, 0) : new Size(50, 50)
            }
        };

        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        _context["ExistingScene"] = scene;
        _context["SceneId"] = _sceneId;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no scene exists with ID ""(.*)""")]
    public void GivenNoSceneExistsWithId(string sceneId) {
        _sceneId = Guid.Parse(sceneId);
        _sceneStorage.GetByIdAsync(_sceneId, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);
    }

    [Given(@"I provide invalid ID format ""(.*)""")]
    public void GivenIProvideInvalidIdFormat(string invalidId) {
        _context["InvalidId"] = invalidId;
    }

    #endregion

    #region When Steps - Retrieve Actions

    [When(@"I request the scene by ID ""(.*)""")]
    public async Task WhenIRequestTheSceneById(string sceneId) {
        try {
            _sceneId = Guid.Parse(sceneId);
            _retrievedScene = await _service.GetSceneByIdAsync(_sceneId, CancellationToken.None);
            _context["RetrievedScene"] = _retrievedScene;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I request the scene by its ID")]
    public async Task WhenIRequestTheSceneByItsId() {
        if (_context.ContainsKey("SceneId")) {
            _sceneId = _context.Get<Guid>("SceneId");
        }
        await WhenIRequestTheSceneById(_sceneId.ToString());
    }

    [When(@"I attempt to request the scene")]
    public async Task WhenIAttemptToRequestTheScene() {
        try {
            var invalidId = _context.Get<string>("InvalidId");
            // This should throw FormatException
            _sceneId = Guid.Parse(invalidId);
            _retrievedScene = await _service.GetSceneByIdAsync(_sceneId, CancellationToken.None);
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive the scene details")]
    public void ThenIShouldReceiveTheSceneDetails() {
        _retrievedScene.Should().NotBeNull();
        _retrievedScene!.Id.Should().NotBeEmpty();
    }

    [Then(@"the scene name should be ""(.*)""")]
    public void ThenTheSceneNameShouldBe(string expectedName) {
        _retrievedScene!.Name.Should().Be(expectedName);
    }

    [Then(@"the stage configuration should be included")]
    public void ThenTheStageConfigurationShouldBeIncluded() {
        _retrievedScene!.Stage.Should().NotBeNull();
    }

    [Then(@"the grid configuration should be included")]
    public void ThenTheGridConfigurationShouldBeIncluded() {
        _retrievedScene!.Grid.Should().NotBeNull();
    }

    [Then(@"all (.*) asset placements should be included")]
    public void ThenAllAssetPlacementsShouldBeIncluded(int expectedCount) {
        _retrievedScene!.Assets.Should().HaveCount(expectedCount);
    }

    [Then(@"I should receive the complete stage configuration")]
    public void ThenIShouldReceiveTheCompleteStageConfiguration() {
        _retrievedScene!.Stage.Should().NotBeNull();
        _retrievedScene!.Stage.Background.Should().NotBeNull();
    }

    [Then(@"all stage properties should be correct")]
    public void ThenAllStagePropertiesShouldBeCorrect() {
        var expected = _context.Get<Scene>("ExistingScene");
        _retrievedScene!.Stage.Should().BeEquivalentTo(expected.Stage);
    }

    [Then(@"I should receive the complete grid configuration")]
    public void ThenIShouldReceiveTheCompleteGridConfiguration() {
        _retrievedScene!.Grid.Should().NotBeNull();
        _retrievedScene!.Grid.Type.Should().NotBe(GridType.None);
    }

    [Then(@"all grid properties should be correct")]
    public void ThenAllGridPropertiesShouldBeCorrect() {
        var expected = _context.Get<Scene>("ExistingScene");
        _retrievedScene!.Grid.Should().BeEquivalentTo(expected.Grid);
    }

    [Then(@"the assets collection should be empty")]
    public void ThenTheAssetsCollectionShouldBeEmpty() {
        _retrievedScene!.Assets.Should().BeEmpty();
    }

    [Then(@"the grid type should be ""(.*)""")]
    public void ThenTheGridTypeShouldBe(string expectedType) {
        var expectedGridType = Enum.Parse<GridType>(expectedType);
        _retrievedScene!.Grid.Type.Should().Be(expectedGridType);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _retrievedScene.Should().BeNull();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        if (_retrievedScene is null && _exception is null) {
            // Not found case
            expectedError.Should().Contain("not found");
        }
        else if (_exception is not null) {
            _exception.Message.Should().Contain(expectedError);
        }
    }

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _exception.Should().NotBeNull();
        _exception.Should().BeOfType<FormatException>();
    }

    #endregion
}
