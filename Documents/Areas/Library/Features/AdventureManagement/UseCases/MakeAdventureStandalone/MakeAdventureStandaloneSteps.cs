// Generated: 2025-10-12
// BDD Step Definitions for Make Adventure Standalone Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (AdventureService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Adventures.ServiceContracts;
using VttTools.Library.Adventures.Services;
using VttTools.Library.Adventures.Storage;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Campaigns.Storage;
using VttTools.Library.Scenes.Model;
using VttTools.Library.Scenes.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.AdventureManagement.MakeAdventureStandalone;

[Binding]
public class MakeAdventureStandaloneSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _existingAdventure;
    private UpdatedAdventureData? _updateData;
    private Result<Adventure>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _adventureId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private List<Scene> _scenes = [];
    private Exception? _exception;

    public MakeAdventureStandaloneSteps(ScenarioContext context) {
        _context = context;
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _service = new AdventureService(_adventureStorage, _sceneStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own an adventure within a campaign")]
    public void GivenIAlreadyOwnAnAdventureWithinACampaign() {
        _adventureId = Guid.CreateVersion7();
        _campaignId = Guid.CreateVersion7();

        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Campaign Adventure",
            Description = "Test Description",
            Type = AdventureType.Generic,
            CampaignId = _campaignId
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        var campaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign"
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);

        _context["AdventureId"] = _adventureId;
        _context["CampaignId"] = _campaignId;
    }

    #endregion

    #region Given Steps - Adventure State

    [Given(@"my adventure has CampaignId ""(.*)""")]
    public void GivenMyAdventureHasCampaignId(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        _existingAdventure = _existingAdventure! with { CampaignId = _campaignId };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure has null CampaignId")]
    public void GivenMyAdventureHasNullCampaignId() {
        _existingAdventure = _existingAdventure! with { CampaignId = null };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure is in a campaign")]
    public void GivenMyAdventureIsInACampaign() {
        _campaignId = Guid.CreateVersion7();
        _existingAdventure = _existingAdventure! with { CampaignId = _campaignId };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"the adventure has (.*) scenes")]
    public void GivenTheAdventureHasScenes(int count) {
        _scenes.Clear();
        for (int i = 0; i < count; i++) {
            _scenes.Add(new Scene {
                Id = Guid.CreateVersion7(),
                AdventureId = _adventureId,
                Name = $"Scene {i + 1}"
            });
        }

        _existingAdventure = _existingAdventure! with { Scenes = _scenes };
        _sceneStorage.GetByParentIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_scenes.ToArray());

        _context["SceneCount"] = count;
    }

    [Given(@"my adventure in a campaign has:")]
    public void GivenMyAdventureInACampaignHas(Table table) {
        var row = table.Rows[0];
        var type = Enum.Parse<AdventureType>(row["Type"]);

        _existingAdventure = _existingAdventure! with {
            Name = row["Name"],
            Type = type,
            Description = row["Description"],
            IsPublished = bool.Parse(row["IsPublished"]),
            IsPublic = bool.Parse(row["IsPublic"])
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["OriginalProperties"] = _existingAdventure;
    }

    #endregion

    #region Given Steps - Campaign Context

    [Given(@"a campaign has (.*) adventures")]
    public void GivenACampaignHasAdventures(int totalAdventures) {
        _campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign"
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);

        _context["TotalAdventures"] = totalAdventures;
        _context["CampaignId"] = _campaignId;
    }

    [Given(@"I own one of those adventures")]
    public void GivenIAlreadyOwnOneOfThoseAdventures() {
        _adventureId = Guid.CreateVersion7();
        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "My Adventure",
            Type = AdventureType.Generic,
            CampaignId = _campaignId
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"I have (.*) standalone adventures")]
    public void GivenIHaveStandaloneAdventures(int count) {
        _context["StandaloneAdventureCount"] = count;
    }

    [Given(@"I have (.*) adventure in a campaign")]
    public void GivenIHaveAdventureInACampaign(int count) {
        GivenIAlreadyOwnAnAdventureWithinACampaign();
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

    [Given(@"an adventure exists in a campaign owned by another user")]
    public void GivenAdventureExistsInCampaignOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        var otherAdventure = new Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = otherUserId,
            Name = "Other User's Adventure",
            Type = AdventureType.Generic,
            CampaignId = Guid.CreateVersion7()
        };

        _adventureStorage.GetByIdAsync(otherAdventure.Id, Arg.Any<CancellationToken>())
            .Returns(otherAdventure);

        _context["OtherAdventureId"] = otherAdventure.Id;
    }

    [Given(@"the database is unavailable")]
    public void GivenDatabaseIsUnavailable() {
        _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new Exception("Database unavailable")));
    }

    #endregion

    #region When Steps - Make Standalone Actions

    [When(@"I make the adventure standalone")]
    public async Task WhenIMakeTheAdventureStandalone() {
        try {
            _updateData = new UpdatedAdventureData {
                CampaignId = new Optional<Guid?>(null)
            };

            // Mock storage to succeed
            _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            _updateResult = await _service.UpdateAdventureAsync(_userId, _adventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to make the adventure standalone")]
    public async Task WhenIAttemptToMakeTheAdventureStandalone() {
        await WhenIMakeTheAdventureStandalone();
    }

    [When(@"I attempt to make adventure ""(.*)"" standalone")]
    public async Task WhenIAttemptToMakeAdventureStandalone(string id) {
        var adventureId = Guid.Parse(id);
        try {
            _updateData = new UpdatedAdventureData {
                CampaignId = new Optional<Guid?>(null)
            };

            _updateResult = await _service.UpdateAdventureAsync(_userId, adventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to make that adventure standalone")]
    public async Task WhenIAttemptToMakeThatAdventureStandalone() {
        var otherAdventureId = _context.Get<Guid>("OtherAdventureId");
        try {
            _updateData = new UpdatedAdventureData {
                CampaignId = new Optional<Guid?>(null)
            };

            _updateResult = await _service.UpdateAdventureAsync(_userId, otherAdventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I make my adventure standalone")]
    public async Task WhenIMakeMyAdventureStandalone() {
        await WhenIMakeTheAdventureStandalone();
    }

    [When(@"I make the campaign adventure standalone")]
    public async Task WhenIMakeTheCampaignAdventureStandalone() {
        await WhenIMakeTheAdventureStandalone();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the adventure is updated successfully")]
    public void ThenTheAdventureIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the adventure CampaignId should be null")]
    public void ThenTheAdventureCampaignIdShouldBeNull() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"the adventure should become standalone")]
    public void ThenTheAdventureShouldBecomeStandalone() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"all (.*) scenes should remain with the adventure")]
    public void ThenAllScenesShouldRemainWithAdventure(int expectedCount) {
        var sceneCount = _context.Get<int>("SceneCount");
        sceneCount.Should().Be(expectedCount);
    }

    [Then(@"the CampaignId should be null")]
    public void ThenCampaignIdShouldBeNull() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"the adventure type should remain unchanged")]
    public void ThenAdventureTypeShouldRemainUnchanged() {
        _updateResult!.Value!.Type.Should().Be(_existingAdventure!.Type);
    }

    [Then(@"the adventure is removed from campaign")]
    public void ThenAdventureIsRemovedFromCampaign() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"the campaign should now have (.*) adventures")]
    public void ThenCampaignShouldNowHaveAdventures(int expectedCount) {
        var totalAdventures = _context.Get<int>("TotalAdventures");
        (totalAdventures - 1).Should().Be(expectedCount);
    }

    [Then(@"all adventure properties should remain unchanged")]
    public void ThenAllAdventurePropertiesShouldRemainUnchanged() {
        var originalProperties = _context.Get<Adventure>("OriginalProperties");
        _updateResult!.Value!.Name.Should().Be(originalProperties.Name);
        _updateResult!.Value!.Type.Should().Be(originalProperties.Type);
        _updateResult!.Value!.Description.Should().Be(originalProperties.Description);
        _updateResult!.Value!.IsPublished.Should().Be(originalProperties.IsPublished);
        _updateResult!.Value!.IsPublic.Should().Be(originalProperties.IsPublic);
    }

    [Then(@"only the CampaignId should be set to null")]
    public void ThenOnlyCampaignIdShouldBeSetToNull() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"I should now have (.*) standalone adventures")]
    public void ThenIShouldNowHaveStandaloneAdventures(int expectedCount) {
        var originalCount = _context.Get<int>("StandaloneAdventureCount");
        (originalCount + 1).Should().Be(expectedCount);
    }

    [Then(@"the adventure should appear in standalone adventures query")]
    public void ThenAdventureShouldAppearInStandaloneAdventuresQuery() {
        _updateResult!.Value!.CampaignId.Should().BeNull();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeErrorMessage(string expectedError) {
        _updateResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase) || e.Contains("NotFound"));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e =>
            e.Contains("not authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("NotAllowed") ||
            e.Contains("forbidden", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
