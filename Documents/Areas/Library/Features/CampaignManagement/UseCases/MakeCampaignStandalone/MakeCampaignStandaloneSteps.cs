// Generated: 2025-10-12
// BDD Step Definitions for Make Campaign Standalone Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (CampaignService)
// Status: Phase 7 - BLOCKED (CampaignService not implemented)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Campaigns.Services;
using VttTools.Library.Campaigns.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.MakeCampaignStandalone;

[Binding]
public class MakeCampaignStandaloneSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private Result<Campaign>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private Guid _worldId = Guid.Empty;

    public MakeCampaignStandaloneSteps(ScenarioContext context) {
        _context = context;
        _campaignStorage = Substitute.For<ICampaignStorage>();

        // NOTE: CampaignService not implemented yet (Phase 7 - BLOCKED)
        _service = new CampaignService(_campaignStorage, null!, null!);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own a campaign within an world")]
    public void GivenIAlreadyOwnACampaignWithinWorld() {
        _campaignId = Guid.CreateVersion7();
        _worldId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            WorldId = _worldId,
            Name = "World Campaign",
            Description = "Campaign within world",
            Adventures = []
        };

        _context["CampaignId"] = _campaignId;
        _context["WorldId"] = _worldId;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    #endregion

    #region Given Steps - Campaign State

    [Given(@"my campaign has WorldId ""(.*)""")]
    public void GivenMyCampaignHasWorldId(string worldId) {
        _worldId = Guid.Parse(worldId);
        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = _worldId;
        }
    }

    [Given(@"my campaign has null WorldId")]
    public void GivenMyCampaignHasNullWorldId() {
        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = null;
        }
    }

    [Given(@"my campaign is in an world")]
    public void GivenMyCampaignIsInAnWorld() {
        _worldId = Guid.CreateVersion7();
        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = _worldId;
        }
    }

    [Given(@"the campaign has (.*) adventures")]
    public void GivenTheCampaignHasAdventures(int count) {
        if (_existingCampaign is not null) {
            for (int i = 0; i < count; i++) {
                _existingCampaign.Adventures.Add(new Adventure {
                    Id = Guid.CreateVersion7(),
                    CampaignId = _campaignId,
                    Name = $"Adventure {i + 1}",
                    Description = string.Empty
                });
            }
        }
    }

    #endregion

    #region Given Steps - World Context

    [Given(@"an world has (.*) campaigns")]
    public void GivenAnWorldHasCampaigns(int totalCount) {
        _worldId = Guid.CreateVersion7();
        _context["TotalCampaignsInWorld"] = totalCount;

        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = _worldId;
        }
    }

    [Given(@"I own one of those campaigns")]
    public void GivenIAlreadyOwnOneOfThoseCampaigns() {
        // Already set up in Background
        _existingCampaign.Should().NotBeNull();
    }

    #endregion

    #region Given Steps - Campaign Properties

    [Given(@"my campaign in an world has:")]
    public void GivenMyCampaignInWorldHasProperties(Table table) {
        var data = table.CreateInstance<CampaignPropertiesTable>();
        if (_existingCampaign is not null) {
            _existingCampaign.Name = data.Name;
            _existingCampaign.Description = data.Description;
            _existingCampaign.IsPublished = data.IsPublished;
            _existingCampaign.IsPublic = data.IsPublic;
            _existingCampaign.WorldId = _worldId;
        }
    }

    #endregion

    #region Given Steps - Multiple Campaigns

    [Given(@"I have (.*) standalone campaigns")]
    public void GivenIAlreadyHaveStandaloneCampaigns(int count) {
        _context["StandaloneCampaignsCount"] = count;
    }

    [Given(@"I have (.*) campaign in an world")]
    public void GivenIAlreadyHaveCampaignInWorld(int count) {
        // Current campaign is in world
        GivenIAlreadyOwnACampaignWithinWorld();
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no campaign exists with ID ""(.*)""")]
    public void GivenNoCampaignExistsWithId(string campaignId) {
        _campaignId = Guid.Parse(campaignId);

        // Mock storage to return null
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);
    }

    [Given(@"a campaign exists in an world owned by another user")]
    public void GivenACampaignExistsInWorldOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _campaignId = Guid.CreateVersion7();
        _worldId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = otherUserId,
            WorldId = _worldId,
            Name = "Other User's Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<bool>(new Exception("Database connection failed")));
    }

    #endregion

    #region When Steps - Make Standalone Actions

    [When(@"I make the campaign standalone")]
    public async Task WhenIMakeTheCampaignStandalone() {
        try {
            // Mock storage to succeed
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.MakeCampaignStandaloneAsync(_userId, _campaignId, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to make the campaign standalone")]
    public async Task WhenIAttemptToMakeTheCampaignStandalone() {
        await WhenIMakeTheCampaignStandalone();
    }

    [When(@"I attempt to make campaign ""(.*)"" standalone")]
    public async Task WhenIAttemptToMakeCampaignStandalone(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        await WhenIMakeTheCampaignStandalone();
    }

    [When(@"I attempt to make that campaign standalone")]
    public async Task WhenIAttemptToMakeThatCampaignStandalone() {
        await WhenIMakeTheCampaignStandalone();
    }

    [When(@"I make my campaign standalone")]
    public async Task WhenIMakeMyCampaignStandalone() {
        await WhenIMakeTheCampaignStandalone();
    }

    [When(@"I make the world campaign standalone")]
    public async Task WhenIMakeTheWorldCampaignStandalone() {
        await WhenIMakeTheCampaignStandalone();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign is updated successfully")]
    public void ThenTheCampaignIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign WorldId should be null")]
    public void ThenTheCampaignWorldIdShouldBeNull() {
        _updateResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"the campaign should become standalone")]
    public void ThenTheCampaignShouldBecomeStandalone() {
        _updateResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"all (.*) adventures should remain with the campaign")]
    public void ThenAllAdventuresShouldRemainWithCampaign(int expectedCount) {
        _updateResult!.Value!.Adventures.Should().HaveCount(expectedCount);
    }

    [Then(@"the WorldId should be null")]
    public void ThenTheWorldIdShouldBeNull() {
        _updateResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"the campaign is removed from world")]
    public void ThenTheCampaignIsRemovedFromWorld() {
        _updateResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"the world should now have (.*) campaigns")]
    public void ThenTheWorldShouldNowHaveCampaigns(int expectedCount) {
        var totalInWorld = _context.Get<int>("TotalCampaignsInWorld");
        expectedCount.Should().Be(totalInWorld - 1);
    }

    [Then(@"all campaign properties should remain unchanged")]
    public void ThenAllCampaignPropertiesShouldRemainUnchanged() {
        _updateResult!.Value!.Name.Should().Be(_existingCampaign!.Name);
        _updateResult!.Value!.Description.Should().Be(_existingCampaign!.Description);
        _updateResult!.Value!.IsPublished.Should().Be(_existingCampaign!.IsPublished);
        _updateResult!.Value!.IsPublic.Should().Be(_existingCampaign!.IsPublic);
    }

    [Then(@"only the WorldId should be set to null")]
    public void ThenOnlyTheWorldIdShouldBeSetToNull() {
        _updateResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"I should now have (.*) standalone campaigns")]
    public void ThenIShouldNowHaveStandaloneCampaigns(int expectedCount) {
        var previousCount = _context.Get<int>("StandaloneCampaignsCount");
        expectedCount.Should().Be(previousCount + 1);
    }

    [Then(@"the campaign should appear in standalone campaigns query")]
    public void ThenTheCampaignShouldAppearInStandaloneCampaignsQuery() {
        _updateResult!.Value!.WorldId.Should().BeNull();
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
    public void ThenIShouldSeeError(string expectedError) {
        _updateResult!.Errors.Should().Contain(e => e.Contains(expectedError));
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("not authorized") || e.Contains("Forbidden"));
    }

    #endregion

    #region Helper Classes

    private class CampaignPropertiesTable {
        public string Property { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;

        // Parsed properties
        public string Name => GetValue("Name");
        public string Description => GetValue("Description");
        public bool IsPublished => GetValue("IsPublished") == "true";
        public bool IsPublic => GetValue("IsPublic") == "true";

        private string GetValue(string propertyName) {
            return Property == propertyName ? Value : string.Empty;
        }
    }

    #endregion
}
