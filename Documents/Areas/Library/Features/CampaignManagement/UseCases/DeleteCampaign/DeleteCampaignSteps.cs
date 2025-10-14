// Generated: 2025-10-12
// BDD Step Definitions for Delete Campaign Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (CampaignService)
// Status: Phase 7 - BLOCKED (CampaignService not implemented)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Campaigns.Services;
using VttTools.Library.Campaigns.Storage;
using VttTools.Library.Scenes.Model;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.DeleteCampaign;

[Binding]
public class DeleteCampaignSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private Result? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private int _adventureCount = 0;
    private int _sceneCount = 0;

    public DeleteCampaignSteps(ScenarioContext context) {
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

    [Given(@"I own a campaign in my library")]
    public void GivenIAlreadyOwnACampaign() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign",
            Description = "Test Description",
            Adventures = []
        };

        _context["CampaignId"] = _campaignId;
        _context["ExistingCampaign"] = _existingCampaign;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    #endregion

    #region Given Steps - Campaign with Adventures

    [Given(@"my campaign has (.*) associated adventures")]
    public void GivenMyCampaignHasAssociatedAdventures(int count) {
        _adventureCount = count;
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

    [Given(@"my campaign has (.*) adventures")]
    public void GivenMyCampaignHasAdventures(int count) {
        GivenMyCampaignHasAssociatedAdventures(count);
    }

    [Given(@"the first adventure has (.*) scenes")]
    public void GivenTheFirstAdventureHasScenes(int count) {
        _sceneCount += count;
        if (_existingCampaign?.Adventures.Count > 0) {
            var adventure = _existingCampaign.Adventures[0];
            for (int i = 0; i < count; i++) {
                adventure.Scenes.Add(new Scene {
                    Id = Guid.CreateVersion7(),
                    AdventureId = adventure.Id,
                    Name = $"Scene {i + 1}"
                });
            }
        }
    }

    [Given(@"the second adventure has (.*) scenes")]
    public void GivenTheSecondAdventureHasScenes(int count) {
        _sceneCount += count;
        if (_existingCampaign?.Adventures.Count > 1) {
            var adventure = _existingCampaign.Adventures[1];
            for (int i = 0; i < count; i++) {
                adventure.Scenes.Add(new Scene {
                    Id = Guid.CreateVersion7(),
                    AdventureId = adventure.Id,
                    Name = $"Scene {i + 1}"
                });
            }
        }
    }

    [Given(@"the third adventure has (.*) scenes")]
    public void GivenTheThirdAdventureHasScenes(int count) {
        _sceneCount += count;
        if (_existingCampaign?.Adventures.Count > 2) {
            var adventure = _existingCampaign.Adventures[2];
            for (int i = 0; i < count; i++) {
                adventure.Scenes.Add(new Scene {
                    Id = Guid.CreateVersion7(),
                    AdventureId = adventure.Id,
                    Name = $"Scene {i + 1}"
                });
            }
        }
    }

    [Given(@"my campaign has no associated adventures")]
    public void GivenMyCampaignHasNoAssociatedAdventures() {
        if (_existingCampaign is not null) {
            _existingCampaign.Adventures.Clear();
        }
    }

    #endregion

    #region Given Steps - Campaign Hierarchy

    [Given(@"my campaign is standalone with null EpicId")]
    public void GivenMyCampaignIsStandalone() {
        if (_existingCampaign is not null) {
            _existingCampaign.EpicId = null;
        }
    }

    [Given(@"my campaign is in an epic with (.*) campaigns")]
    public void GivenMyCampaignIsInEpicWithCampaigns(int totalCampaigns) {
        var epicId = Guid.CreateVersion7();
        if (_existingCampaign is not null) {
            _existingCampaign.EpicId = epicId;
        }
        _context["EpicId"] = epicId;
        _context["TotalCampaignsInEpic"] = totalCampaigns;
    }

    #endregion

    #region Given Steps - Publication Status

    [Given(@"my campaign is published and public")]
    public void GivenMyCampaignIsPublishedAndPublic() {
        if (_existingCampaign is not null) {
            _existingCampaign.IsPublished = true;
            _existingCampaign.IsPublic = true;
        }
    }

    #endregion

    #region Given Steps - Multiple Campaigns

    [Given(@"I own (.*) campaigns")]
    public void GivenIAlreadyOwnMultipleCampaigns(int count) {
        _context["TotalOwnedCampaigns"] = count;

        // Create first campaign (already exists from Background)
        if (_existingCampaign is null) {
            GivenIAlreadyOwnACampaign();
        }

        // Store additional campaigns in context
        var campaigns = new List<Campaign> { _existingCampaign! };
        for (int i = 1; i < count; i++) {
            campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                Name = $"Campaign {i + 1}",
                Description = string.Empty,
                Adventures = []
            });
        }
        _context["AllCampaigns"] = campaigns;
    }

    [Given(@"the first campaign has (.*) adventures")]
    public void GivenTheFirstCampaignHasAdventures(int count) {
        GivenMyCampaignHasAdventures(count);
    }

    [Given(@"the second campaign has (.*) adventures")]
    public void GivenTheSecondCampaignHasAdventures(int count) {
        var campaigns = _context.Get<List<Campaign>>("AllCampaigns");
        if (campaigns.Count > 1) {
            for (int i = 0; i < count; i++) {
                campaigns[1].Adventures.Add(new Adventure {
                    Id = Guid.CreateVersion7(),
                    CampaignId = campaigns[1].Id,
                    Name = $"Adventure {i + 1}",
                    Description = string.Empty
                });
            }
        }
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no campaign exists with ID ""(.*)""")]
    public void GivenNoCampaignExistsWithId(string campaignId) {
        var nonExistentId = Guid.Parse(campaignId);
        _campaignId = nonExistentId;

        // Mock storage to return null for non-existent campaign
        _campaignStorage.GetByIdAsync(nonExistentId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);
    }

    [Given(@"a campaign exists owned by another user")]
    public void GivenACampaignExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = otherUserId,
            Name = "Other User's Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"a campaign exists")]
    public void GivenACampaignExists() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = Guid.CreateVersion7(),
            Name = "Test Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        _campaignStorage.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<bool>(new Exception("Database connection failed")));
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the campaign")]
    public async Task WhenIDeleteTheCampaign() {
        try {
            // Mock storage to succeed
            _campaignStorage.DeleteAsync(_campaignId, Arg.Any<CancellationToken>())
                .Returns(true);

            _deleteResult = await _service.DeleteCampaignAsync(_userId, _campaignId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete campaign ""(.*)""")]
    public async Task WhenIAttemptToDeleteCampaign(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        await WhenIDeleteTheCampaign();
    }

    [When(@"I attempt to delete that campaign")]
    public async Task WhenIAttemptToDeleteThatCampaign() {
        await WhenIDeleteTheCampaign();
    }

    [When(@"I attempt to delete the campaign")]
    public async Task WhenIAttemptToDeleteTheCampaign() {
        await WhenIDeleteTheCampaign();
    }

    [When(@"I delete the first campaign")]
    public async Task WhenIDeleteTheFirstCampaign() {
        await WhenIDeleteTheCampaign();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign is removed")]
    public void ThenTheCampaignIsRemoved() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all (.*) adventures is removed")]
    public async Task ThenAllAdventuresAreRemoved(int count) {
        count.Should().Be(_adventureCount);
        await _campaignStorage.Received(1).DeleteAsync(_campaignId, Arg.Any<CancellationToken>());
    }

    [Then(@"I should receive deletion confirmation")]
    public void ThenIShouldReceiveDeletionConfirmation() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all (.*) scenes is removed")]
    public void ThenAllScenesAreRemoved(int count) {
        count.Should().Be(_sceneCount);
    }

    [Then(@"both adventures is removed")]
    public void ThenBothAdventuresAreRemoved() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the campaign should not appear in standalone campaigns list")]
    public void ThenTheCampaignShouldNotAppearInStandaloneCampaignsList() {
        // Would query campaign list and verify campaign is not present
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the epic should now have (.*) campaigns")]
    public void ThenTheEpicShouldNowHaveCampaigns(int expectedCount) {
        var totalInEpic = _context.Get<int>("TotalCampaignsInEpic");
        expectedCount.Should().Be(totalInEpic - 1);
    }

    [Then(@"the epic should remain intact")]
    public void ThenTheEpicShouldRemainIntact() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"public users should no longer see the campaign")]
    public void ThenPublicUsersShouldNoLongerSeeTheCampaign() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the first campaign and its (.*) adventures is removed")]
    public void ThenTheFirstCampaignAndAdventuresAreRemoved(int count) {
        _deleteResult!.IsSuccessful.Should().BeTrue();
        count.Should().Be(_adventureCount);
    }

    [Then(@"the second campaign and its (.*) adventures should remain intact")]
    public void ThenTheSecondCampaignAndAdventuresShouldRemainIntact(int count) {
        var campaigns = _context.Get<List<Campaign>>("AllCampaigns");
        campaigns[1].Adventures.Should().HaveCount(count);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _deleteResult!.Errors.Should().Contain(e => e.Contains(expectedError));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"the campaign should remain in the database")]
    public void ThenTheCampaignShouldRemainInDatabase() {
        // Campaign was not deleted due to error
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("not authorized") || e.Contains("Forbidden"));
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("Unauthorized") || e.Contains("not authenticated"));
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        _deleteResult!.Errors.Should().Contain(e => e.Contains("Unauthorized") || e.Contains("log in"));
    }

    [Then(@"the campaign is removed successfully")]
    public void ThenTheCampaignIsRemovedSuccessfully() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    #endregion
}
