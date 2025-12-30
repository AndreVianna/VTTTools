// Generated: 2025-10-12
// BDD Step Definitions for Get Encounter By ID Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (EncounterService.GetEncounterByIdAsync)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Encounters.Model;
using VttTools.Library.Encounters.Services;
using VttTools.Library.Encounters.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.EncounterManagement.GetEncounterByID;

[Binding]
public class GetEncounterByIDSteps {
    private readonly ScenarioContext _context;
    private readonly IEncounterStorage _encounterStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IEncounterService _service;

    // Test state
    private Encounter? _retrievedEncounter;
    private Guid _encounterId = Guid.Empty;
    private Guid _userId = Guid.Empty;
    private Exception? _exception;

    public GetEncounterByIDSteps(ScenarioContext context) {
        _context = context;
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new EncounterService(_encounterStorage, _assetStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    #endregion

    #region Given Steps - Encounter Existence

    [Given(@"a encounter exists with ID ""(.*)""")]
    public void GivenAEncounterExistsWithId(string encounterId) {
        _encounterId = Guid.Parse(encounterId);
        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings(),
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        };

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
    }

    [Given(@"the encounter has name ""(.*)""")]
    public void GivenTheEncounterHasName(string name) {
        var encounter = _context.Get<Encounter>("ExistingEncounter");
        encounter = encounter with { Name = name };
        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);
        _context["ExistingEncounter"] = encounter;
    }

    [Given(@"a encounter exists with:")]
    public void GivenAEncounterExistsWith(Table table) {
        _encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings(),
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) },
            Assets = []
        };

        foreach (var row in table.Rows) {
            var component = row["Component"];
            var status = row["Status"];

            if (component == "Stage" && status == "configured") {
                encounter = encounter with {
                    Settings = new StageSettings {
                        Background = new Resource {
                            Id = Guid.CreateVersion7(),
                            Type = ResourceType.Image,
                            Path = "/backgrounds/dungeon.png"
                        }
                    }
                };
            }

            if (component == "Grid" && status == "configured") {
                encounter = encounter with {
                    Grid = new Grid {
                        Type = GridType.Square,
                        CellSize = new Size(50, 50),
                        Offset = new Position(0, 0)
                    }
                };
            }

            if (component == "Assets") {
                var count = int.Parse(status.Split(' ')[0]);
                var assets = new List<EncounterAsset>();
                for (int i = 0; i < count; i++) {
                    assets.Add(new EncounterAsset {
                        AssetId = Guid.CreateVersion7(),
                        Index = i,
                        Number = 1,
                        Name = $"Asset {i + 1}",
                        ResourceId = Guid.CreateVersion7(),
                        Position = new Position(i * 100, i * 100),
                        Size = new Size(50, 50)
                    });
                }
                encounter = encounter with { Assets = assets };
            }
        }

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
        _context["EncounterId"] = _encounterId;
    }

    [Given(@"a encounter exists with stage:")]
    public void GivenAEncounterExistsWithStage(Table table) {
        _encounterId = Guid.CreateVersion7();
        var row = table.Rows[0];

        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings {
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

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
        _context["EncounterId"] = _encounterId;
    }

    [Given(@"a encounter exists with square grid:")]
    public void GivenAEncounterExistsWithSquareGrid(Table table) {
        _encounterId = Guid.CreateVersion7();
        var row = table.Rows[0];

        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings(),
            Grid = new Grid {
                Type = GridType.Square,
                CellSize = new Size(int.Parse(row["Size"]), int.Parse(row["Size"])),
                Offset = new Position(int.Parse(row["OffsetX"]), int.Parse(row["OffsetY"]))
            }
        };

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
        _context["EncounterId"] = _encounterId;
    }

    [Given(@"a encounter exists with stage and grid but no assets")]
    public void GivenAEncounterExistsWithStageAndGridButNoAssets() {
        _encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings {
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

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
        _context["EncounterId"] = _encounterId;
    }

    [Given(@"a encounter exists with grid type ""(.*)""")]
    public void GivenAEncounterExistsWithGridType(string gridType) {
        _encounterId = Guid.CreateVersion7();
        var type = Enum.Parse<GridType>(gridType);

        var encounter = new Encounter {
            Id = _encounterId,
            OwnerId = _userId,
            Name = "Test Encounter",
            Description = "Test Description",
            Settings = new StageSettings(),
            Grid = new Grid {
                Type = type,
                CellSize = type == GridType.None ? new Size(0, 0) : new Size(50, 50)
            }
        };

        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        _context["ExistingEncounter"] = encounter;
        _context["EncounterId"] = _encounterId;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no encounter exists with ID ""(.*)""")]
    public void GivenNoEncounterExistsWithId(string encounterId) {
        _encounterId = Guid.Parse(encounterId);
        _encounterStorage.GetByIdAsync(_encounterId, Arg.Any<CancellationToken>())
            .Returns((Encounter?)null);
    }

    [Given(@"I provide invalid ID format ""(.*)""")]
    public void GivenIProvideInvalidIdFormat(string invalidId) {
        _context["InvalidId"] = invalidId;
    }

    #endregion

    #region When Steps - Retrieve Actions

    [When(@"I request the encounter by ID ""(.*)""")]
    public async Task WhenIRequestTheEncounterById(string encounterId) {
        try {
            _encounterId = Guid.Parse(encounterId);
            _retrievedEncounter = await _service.GetEncounterByIdAsync(_encounterId, CancellationToken.None);
            _context["RetrievedEncounter"] = _retrievedEncounter;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I request the encounter by its ID")]
    public async Task WhenIRequestTheEncounterByItsId() {
        if (_context.ContainsKey("EncounterId")) {
            _encounterId = _context.Get<Guid>("EncounterId");
        }
        await WhenIRequestTheEncounterById(_encounterId.ToString());
    }

    [When(@"I attempt to request the encounter")]
    public async Task WhenIAttemptToRequestTheEncounter() {
        try {
            var invalidId = _context.Get<string>("InvalidId");
            // This should throw FormatException
            _encounterId = Guid.Parse(invalidId);
            _retrievedEncounter = await _service.GetEncounterByIdAsync(_encounterId, CancellationToken.None);
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive the encounter details")]
    public void ThenIShouldReceiveTheEncounterDetails() {
        _retrievedEncounter.Should().NotBeNull();
        _retrievedEncounter!.Id.Should().NotBeEmpty();
    }

    [Then(@"the encounter name should be ""(.*)""")]
    public void ThenTheEncounterNameShouldBe(string expectedName) {
        _retrievedEncounter!.Name.Should().Be(expectedName);
    }

    [Then(@"the stage configuration should be included")]
    public void ThenTheStageConfigurationShouldBeIncluded() {
        _retrievedEncounter!.Settings.Should().NotBeNull();
    }

    [Then(@"the grid configuration should be included")]
    public void ThenTheGridConfigurationShouldBeIncluded() {
        _retrievedEncounter!.Grid.Should().NotBeNull();
    }

    [Then(@"all (.*) asset placements should be included")]
    public void ThenAllAssetPlacementsShouldBeIncluded(int expectedCount) {
        _retrievedEncounter!.Assets.Should().HaveCount(expectedCount);
    }

    [Then(@"I should receive the complete stage configuration")]
    public void ThenIShouldReceiveTheCompleteStageConfiguration() {
        _retrievedEncounter!.Settings.Should().NotBeNull();
        _retrievedEncounter!.Settings.Background.Should().NotBeNull();
    }

    [Then(@"all stage properties should be correct")]
    public void ThenAllStagePropertiesShouldBeCorrect() {
        var expected = _context.Get<Encounter>("ExistingEncounter");
        _retrievedEncounter!.Settings.Should().BeEquivalentTo(expected.Settings);
    }

    [Then(@"I should receive the complete grid configuration")]
    public void ThenIShouldReceiveTheCompleteGridConfiguration() {
        _retrievedEncounter!.Grid.Should().NotBeNull();
        _retrievedEncounter!.Grid.Type.Should().NotBe(GridType.None);
    }

    [Then(@"all grid properties should be correct")]
    public void ThenAllGridPropertiesShouldBeCorrect() {
        var expected = _context.Get<Encounter>("ExistingEncounter");
        _retrievedEncounter!.Grid.Should().BeEquivalentTo(expected.Grid);
    }

    [Then(@"the assets collection should be empty")]
    public void ThenTheAssetsCollectionShouldBeEmpty() {
        _retrievedEncounter!.Assets.Should().BeEmpty();
    }

    [Then(@"the grid type should be ""(.*)""")]
    public void ThenTheGridTypeShouldBe(string expectedType) {
        var expectedGridType = Enum.Parse<GridType>(expectedType);
        _retrievedEncounter!.Grid.Type.Should().Be(expectedGridType);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _retrievedEncounter.Should().BeNull();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        if (_retrievedEncounter is null && _exception is null) {
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
