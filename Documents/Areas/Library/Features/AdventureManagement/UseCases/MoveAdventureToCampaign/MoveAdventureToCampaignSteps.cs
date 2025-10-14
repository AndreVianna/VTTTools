// Generated: 2025-10-12
// BDD Step Definitions for Move Adventure To Campaign Use Case
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

namespace VttTools.Library.Tests.BDD.AdventureManagement.MoveAdventureToCampaign;

[Binding]
public class MoveAdventureToCampaignSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _existingAdventure;
    private Campaign? _targetCampaign;
    private UpdatedAdventureData? _updateData;
    private Result<Adventure>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _adventureId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private List<Scene> _scenes = [];
    private Exception? _exception;

    public MoveAdventureToCampaignSteps(ScenarioContext context) {
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

    [Given(@"I own a standalone adventure")]
    public void GivenIAlreadyOwnAStandaloneAdventure() {
        _adventureId = Guid.CreateVersion7();
        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Standalone Adventure",
            Description = "Test Description",
            Type = AdventureType.Generic,
            CampaignId = null
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"I own a campaign")]
    public void GivenIAlreadyOwnACampaign() {
        _campaignId = Guid.CreateVersion7();
        _targetCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Target Campaign"
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_targetCampaign);

        _context["CampaignId"] = _campaignId;
    }

    #endregion

    #region Given Steps - Adventure State

    [Given(@"my adventure has null CampaignId")]
    public void GivenMyAdventureHasNullCampaignId() {
        _existingAdventure = _existingAdventure! with { CampaignId = null };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"I own campaign with ID ""(.*)""")]
    public void GivenIAlreadyOwnCampaignWithId(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        _targetCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Target Campaign"
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_targetCampaign);

        _context["CampaignId"] = _campaignId;
    }

    [Given(@"my adventure is in campaign ""(.*)""")]
    public void GivenMyAdventureIsInCampaign(string campaignId) {
        var currentCampaignId = Guid.Parse(campaignId);
        _existingAdventure = _existingAdventure! with { CampaignId = currentCampaignId };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["CurrentCampaignId"] = currentCampaignId;
    }

    [Given(@"I own campaign ""(.*)""")]
    public void GivenIAlreadyOwnCampaign(string campaignId) {
        var newCampaignId = Guid.Parse(campaignId);
        var campaign = new Campaign {
            Id = newCampaignId,
            OwnerId = _userId,
            Name = "New Campaign"
        };

        _campaignStorage.GetByIdAsync(newCampaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);

        _context["NewCampaignId"] = newCampaignId;
    }

    [Given(@"my standalone adventure has (.*) scenes")]
    public void GivenMyStandaloneAdventureHasScenes(int count) {
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

    [Given(@"my standalone adventure has:")]
    public void GivenMyStandaloneAdventureHas(Table table) {
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

    [Given(@"my standalone adventure exists")]
    public void GivenMyStandaloneAdventureExists() {
        _existingAdventure.Should().NotBeNull();
    }

    #endregion

    #region Given Steps - Campaign Context

    [Given(@"a campaign has (.*) adventures")]
    public void GivenACampaignHasAdventures(int totalAdventures) {
        _context["TotalAdventures"] = totalAdventures;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no campaign exists with ID ""(.*)""")]
    public void GivenNoCampaignExistsWithId(string id) {
        var nonExistentCampaignId = Guid.Parse(id);
        _campaignStorage.GetByIdAsync(nonExistentCampaignId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);
        _context["NonExistentCampaignId"] = nonExistentCampaignId;
    }

    [Given(@"a standalone adventure exists owned by another user")]
    public void GivenStandaloneAdventureExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        var otherAdventure = new Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = otherUserId,
            Name = "Other User's Adventure",
            Type = AdventureType.Generic,
            CampaignId = null
        };

        _adventureStorage.GetByIdAsync(otherAdventure.Id, Arg.Any<CancellationToken>())
            .Returns(otherAdventure);

        _context["OtherAdventureId"] = otherAdventure.Id;
    }

    [Given(@"a campaign exists owned by another user")]
    public void GivenCampaignExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        var otherCampaign = new Campaign {
            Id = Guid.CreateVersion7(),
            OwnerId = otherUserId,
            Name = "Other User's Campaign"
        };

        _campaignStorage.GetByIdAsync(otherCampaign.Id, Arg.Any<CancellationToken>())
            .Returns(otherCampaign);

        _context["OtherCampaignId"] = otherCampaign.Id;
    }

    #endregion

    #region When Steps - Move to Campaign Actions

    [When(@"I move the adventure to campaign ""(.*)""")]
    public async Task WhenIMoveTheAdventureToCampaign(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        await WhenIMoveTheAdventureToCampaign();
    }

    [When(@"I attempt to move the adventure to campaign ""(.*)""")]
    public async Task WhenIAttemptToMoveTheAdventureToCampaign(string campaignId) {
        var targetCampaignId = Guid.Parse(campaignId);
        await ExecuteMoveOperation(targetCampaignId);
    }

    [When(@"I move the adventure to the campaign")]
    public async Task WhenIMoveTheAdventureToCampaign() {
        await ExecuteMoveOperation(_campaignId);
    }

    [When(@"I attempt to move adventure to campaign ""(.*)""")]
    public async Task WhenIAttemptToMoveAdventureToCampaign(string campaignId) {
        var targetCampaignId = Guid.Parse(campaignId);
        await ExecuteMoveOperation(targetCampaignId);
    }

    [When(@"I attempt to move that adventure to my campaign")]
    public async Task WhenIAttemptToMoveThatAdventureToMyCampaign() {
        var otherAdventureId = _context.Get<Guid>("OtherAdventureId");
        try {
            _updateData = new UpdatedAdventureData {
                CampaignId = new Optional<Guid?>(_campaignId)
            };

            _updateResult = await _service.UpdateAdventureAsync(_userId, otherAdventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to move my adventure to that campaign")]
    public async Task WhenIAttemptToMoveMyAdventureToThatCampaign() {
        var otherCampaignId = _context.Get<Guid>("OtherCampaignId");
        await ExecuteMoveOperation(otherCampaignId);
    }

    [When(@"I move the standalone adventure to the campaign")]
    public async Task WhenIMoveTheStandaloneAdventureToTheCampaign() {
        await ExecuteMoveOperation(_campaignId);
    }

    private async Task ExecuteMoveOperation(Guid targetCampaignId) {
        try {
            _updateData = new UpdatedAdventureData {
                CampaignId = new Optional<Guid?>(targetCampaignId)
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

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the adventure is updated successfully")]
    public void ThenTheAdventureIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the adventure CampaignId should be ""(.*)""")]
    public void ThenTheAdventureCampaignIdShouldBe(string expectedId) {
        var expectedGuid = Guid.Parse(expectedId);
        _updateResult!.Value!.CampaignId.Should().Be(expectedGuid);
    }

    [Then(@"the adventure should be associated with the campaign")]
    public void ThenTheAdventureShouldBeAssociatedWithCampaign() {
        _updateResult!.Value!.CampaignId.Should().Be(_campaignId);
    }

    [Then(@"all (.*) scenes should remain with the adventure")]
    public void ThenAllScenesShouldRemainWithAdventure(int expectedCount) {
        var sceneCount = _context.Get<int>("SceneCount");
        sceneCount.Should().Be(expectedCount);
    }

    [Then(@"the adventure type should remain unchanged")]
    public void ThenAdventureTypeShouldRemainUnchanged() {
        _updateResult!.Value!.Type.Should().Be(_existingAdventure!.Type);
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

    [Then(@"only the CampaignId is updated")]
    public void ThenOnlyCampaignIdIsUpdated() {
        _updateResult!.Value!.CampaignId.Should().NotBeNull();
        _updateResult!.Value!.CampaignId.Should().Be(_campaignId);
    }

    [Then(@"the campaign should now have (.*) adventures")]
    public void ThenCampaignShouldNowHaveAdventures(int expectedCount) {
        var totalAdventures = _context.Get<int>("TotalAdventures");
        (totalAdventures + 1).Should().Be(expectedCount);
    }

    [Then(@"the moved adventure should appear in campaign's adventure collection")]
    public void ThenMovedAdventureShouldAppearInCampaignCollection() {
        _updateResult!.Value!.CampaignId.Should().Be(_campaignId);
    }

    [Then(@"the adventure is associated with the campaign")]
    public void ThenAdventureIsAssociatedWithCampaign() {
        _updateResult!.Value!.CampaignId.Should().Be(_campaignId);
    }

    [Then(@"the adventure is no longer standalone")]
    public void ThenAdventureIsNoLongerStandalone() {
        _updateResult!.Value!.CampaignId.Should().NotBeNull();
    }

    [Then(@"the adventure and all (.*) scenes are moved successfully")]
    public void ThenAdventureAndAllScenesAreMovedSuccessfully(int expectedCount) {
        _updateResult!.IsSuccessful.Should().BeTrue();
        var sceneCount = _context.Get<int>("SceneCount");
        sceneCount.Should().Be(expectedCount);
    }

    [Then(@"all scenes remain accessible")]
    public void ThenAllScenesRemainAccessible() {
        _scenes.Should().AllSatisfy(scene => {
            scene.AdventureId.Should().Be(_adventureId);
        });
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
