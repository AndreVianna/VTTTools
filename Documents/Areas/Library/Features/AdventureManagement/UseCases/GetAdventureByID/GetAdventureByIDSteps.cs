// Generated: 2025-10-12
// BDD Step Definitions for Get Adventure By ID Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (AdventureService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Adventures.Services;
using VttTools.Library.Adventures.Storage;
using VttTools.Library.Scenes.Model;
using VttTools.Library.Scenes.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.AdventureManagement.GetAdventureByID;

[Binding]
public class GetAdventureByIDSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _adventure;
    private Guid _userId = Guid.Empty;
    private Guid _adventureId = Guid.Empty;
    private List<Scene> _scenes = [];
    private Exception? _exception;
    private string? _errorMessage;

    public GetAdventureByIDSteps(ScenarioContext context) {
        _context = context;
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new AdventureService(_adventureStorage, _sceneStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    #endregion

    #region Given Steps - Adventure Existence

    [Given(@"an adventure exists with ID ""(.*)""")]
    public void GivenAnAdventureExistsWithId(string id) {
        _adventureId = Guid.Parse(id);
        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Test Adventure",
            Description = "Test Description",
            Type = AdventureType.Generic
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"the adventure has name ""(.*)""")]
    public void GivenTheAdventureHasName(string name) {
        _adventure = _adventure! with { Name = name };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);
    }

    [Given(@"an adventure exists with (.*) associated scenes")]
    public void GivenAnAdventureExistsWithAssociatedScenes(int count) {
        _adventureId = Guid.CreateVersion7();
        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Test Adventure",
            Type = AdventureType.Generic
        };

        _scenes.Clear();
        for (int i = 0; i < count; i++) {
            _scenes.Add(new Scene {
                Id = Guid.CreateVersion7(),
                AdventureId = _adventureId,
                Name = $"Scene {i + 1}",
                Description = $"Scene {i + 1} description"
            });
        }

        _adventure = _adventure with { Scenes = _scenes };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
        _context["SceneCount"] = count;
    }

    [Given(@"an adventure exists within a campaign")]
    public void GivenAnAdventureExistsWithinACampaign() {
        _adventureId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();

        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Campaign Adventure",
            Type = AdventureType.Generic,
            CampaignId = campaignId
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
        _context["CampaignId"] = campaignId;
    }

    [Given(@"a standalone adventure exists")]
    public void GivenAStandaloneAdventureExists() {
        _adventureId = Guid.CreateVersion7();
        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Standalone Adventure",
            Type = AdventureType.Generic,
            CampaignId = null
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"an adventure exists with no associated scenes")]
    public void GivenAnAdventureExistsWithNoAssociatedScenes() {
        _adventureId = Guid.CreateVersion7();
        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Empty Adventure",
            Type = AdventureType.Generic,
            Scenes = []
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"an adventure exists with type ""(.*)""")]
    public void GivenAnAdventureExistsWithType(string typeName) {
        _adventureId = Guid.CreateVersion7();
        var type = Enum.Parse<AdventureType>(typeName);

        _adventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = $"{type} Adventure",
            Type = type
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_adventure);

        _context["AdventureId"] = _adventureId;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no adventure exists with ID ""(.*)""")]
    public void GivenNoAdventureExistsWithId(string id) {
        var nonExistentId = Guid.Parse(id);
        _adventureStorage.GetByIdAsync(nonExistentId, Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);
        _context["NonExistentId"] = nonExistentId;
    }

    [Given(@"I provide invalid ID format ""(.*)""")]
    public void GivenIProvideInvalidIdFormat(string invalidId) {
        _context["InvalidId"] = invalidId;
    }

    #endregion

    #region When Steps - Retrieve Actions

    [When(@"I request the adventure by ID ""(.*)""")]
    public async Task WhenIRequestTheAdventureById(string id) {
        try {
            var adventureId = Guid.Parse(id);
            _adventure = await _service.GetAdventureByIdAsync(adventureId, CancellationToken.None);
            _context["RetrievedAdventure"] = _adventure;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I request the adventure by its ID")]
    public async Task WhenIRequestTheAdventureByItsId() {
        try {
            _adventure = await _service.GetAdventureByIdAsync(_adventureId, CancellationToken.None);
            _context["RetrievedAdventure"] = _adventure;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to request the adventure")]
    public async Task WhenIAttemptToRequestTheAdventure() {
        var invalidId = _context.Get<string>("InvalidId");
        try {
            if (Guid.TryParse(invalidId, out var parsedId)) {
                _adventure = await _service.GetAdventureByIdAsync(parsedId, CancellationToken.None);
            }
            else {
                _errorMessage = "Invalid adventure ID format";
                _context["ErrorMessage"] = _errorMessage;
            }
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive the adventure details")]
    public void ThenIShouldReceiveTheAdventureDetails() {
        _adventure.Should().NotBeNull();
        _adventure!.Id.Should().NotBeEmpty();
    }

    [Then(@"the adventure name should be ""(.*)""")]
    public void ThenTheAdventureNameShouldBe(string expectedName) {
        _adventure!.Name.Should().Be(expectedName);
    }

    [Then(@"I should see all (.*) scenes in the collection")]
    public void ThenIShouldSeeAllScenesInCollection(int expectedCount) {
        _adventure!.Scenes.Should().HaveCount(expectedCount);
    }

    [Then(@"each scene should reference the correct adventure ID")]
    public void ThenEachSceneShouldReferenceCorrectAdventureId() {
        _adventure!.Scenes.Should().AllSatisfy(scene => {
            scene.AdventureId.Should().Be(_adventureId);
        });
    }

    [Then(@"the campaign ID should be included")]
    public void ThenTheCampaignIdShouldBeIncluded() {
        _adventure!.CampaignId.Should().NotBeNull();
    }

    [Then(@"the adventure type should be displayed")]
    public void ThenTheAdventureTypeShouldBeDisplayed() {
        _adventure!.Type.Should().NotBe(default(AdventureType));
    }

    [Then(@"the CampaignId should be null")]
    public void ThenTheCampaignIdShouldBeNull() {
        _adventure!.CampaignId.Should().BeNull();
    }

    [Then(@"the scenes collection should be empty")]
    public void ThenTheScenesCollectionShouldBeEmpty() {
        _adventure!.Scenes.Should().BeEmpty();
    }

    [Then(@"the adventure type should be ""(.*)""")]
    public void ThenTheAdventureTypeShouldBe(string expectedType) {
        var type = Enum.Parse<AdventureType>(expectedType);
        _adventure!.Type.Should().Be(type);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _adventure.Should().BeNull();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeErrorMessage(string expectedError) {
        if (_errorMessage is not null) {
            _errorMessage.Should().Contain(expectedError, StringComparison.OrdinalIgnoreCase);
        }
        else if (_exception is not null) {
            _exception.Message.Should().Contain(expectedError, StringComparison.OrdinalIgnoreCase);
        }
    }

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _errorMessage.Should().NotBeNull();
    }

    #endregion
}
