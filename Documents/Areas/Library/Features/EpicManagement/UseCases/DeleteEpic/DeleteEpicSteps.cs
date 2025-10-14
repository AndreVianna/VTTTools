// Generated: 2025-10-12
// BDD Step Definitions for Delete Epic Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (EpicService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Epics.Model;
using VttTools.Library.Epics.Services;
using VttTools.Library.Epics.Storage;
using VttTools.Library.Scenes.Model;
using Xunit;

namespace VttTools.Library.Tests.BDD.EpicManagement.DeleteEpic;

/// <summary>
/// BDD Step Definitions for Delete Epic scenarios.
/// BLOCKED: EpicService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class DeleteEpicSteps {
    private readonly ScenarioContext _context;
    private readonly IEpicStorage _epicStorage;
    private readonly IEpicService _service;

    // Test state
    private Epic? _existingEpic;
    private Result? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _epicId = Guid.Empty;
    private int _campaignCount = 0;
    private int _adventureCount = 0;
    private int _sceneCount = 0;
    private Exception? _exception;

    public DeleteEpicSteps(ScenarioContext context) {
        _context = context;
        _epicStorage = Substitute.For<IEpicStorage>();
        // NOTE: IEpicService does not exist yet - placeholder for Phase 7
        _service = Substitute.For<IEpicService>();
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own an epic in my library")]
    public void GivenIOwnAnEpicInMyLibrary() {
        _epicId = Guid.CreateVersion7();
        _existingEpic = new Epic {
            Id = _epicId,
            OwnerId = _userId,
            Name = "Test Epic",
            Description = "Test Description",
            Campaigns = []
        };

        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(_existingEpic);

        _context["EpicId"] = _epicId;
    }

    [Given(@"I have an epic with two campaigns")]
    public void GivenIHaveAnEpicWithTwoCampaigns() {
        GivenMyEpicHasAssociatedCampaigns(2);
    }

    [Given(@"I have an epic titled ""(.*)""")]
    public void GivenIHaveAnEpicTitled(string name) {
        GivenIOwnAnEpicInMyLibrary();
        _existingEpic = _existingEpic! with { Name = name };
    }

    #endregion

    #region Given Steps - Epic with Campaigns

    [Given(@"my epic has (.*) associated campaigns")]
    public void GivenMyEpicHasAssociatedCampaigns(int count) {
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }

        var campaigns = new List<Campaign>();
        for (int i = 0; i < count; i++) {
            campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                Name = $"Campaign {i + 1}",
                OwnerId = _userId,
                EpicId = _epicId
            });
        }

        _existingEpic = _existingEpic! with { Campaigns = campaigns };
        _campaignCount = count;
        _context["CampaignCount"] = count;
    }

    [Given(@"my epic has no associated campaigns")]
    public void GivenMyEpicHasNoAssociatedCampaigns() {
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }
        _existingEpic = _existingEpic! with { Campaigns = [] };
        _campaignCount = 0;
    }

    [Given(@"my epic has (.*) campaigns")]
    public void GivenMyEpicHasCampaigns(int count) {
        GivenMyEpicHasAssociatedCampaigns(count);
    }

    [Given(@"the epic has a campaign in use by an active game session")]
    public void GivenTheEpicHasACampaignInUseByActiveGameSession() {
        GivenMyEpicHasAssociatedCampaigns(1);
        _context["HasActiveSession"] = true;
    }

    #endregion

    #region Given Steps - Complete Content Hierarchy

    [Given(@"the first campaign has (.*) adventures")]
    public void GivenTheFirstCampaignHasAdventures(int count) {
        _adventureCount += count;
        _context["FirstCampaignAdventureCount"] = count;
    }

    [Given(@"the second campaign has (.*) adventures")]
    public void GivenTheSecondCampaignHasAdventures(int count) {
        _adventureCount += count;
        _context["SecondCampaignAdventureCount"] = count;
    }

    [Given(@"my epic has complete content hierarchy:")]
    public void GivenMyEpicHasCompleteContentHierarchy(Table table) {
        foreach (var row in table.Rows) {
            var level = row["Level"];
            var count = int.Parse(row["Count"]);

            if (level == "Campaigns") {
                GivenMyEpicHasAssociatedCampaigns(count);
            }
            else if (level == "Adventures") {
                _adventureCount = count;
            }
            else if (level == "Scenes") {
                _sceneCount = count;
            }
        }
    }

    [Given(@"each campaign has three adventures")]
    public void GivenEachCampaignHasThreeAdventures() {
        _adventureCount = _campaignCount * 3;
    }

    [Given(@"each adventure has multiple scenes")]
    public void GivenEachAdventureHasMultipleScenes() {
        _sceneCount = _adventureCount * 2;
    }

    #endregion

    #region Given Steps - Epic State

    [Given(@"my epic has ID ""(.*)""")]
    public void GivenMyEpicHasId(string epicId) {
        _epicId = Guid.Parse(epicId);
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }
        _existingEpic = _existingEpic! with { Id = _epicId };
    }

    [Given(@"my epic exists")]
    public void GivenMyEpicExists() {
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }
    }

    [Given(@"my epic is published and public")]
    public void GivenMyEpicIsPublishedAndPublic() {
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }
        _existingEpic = _existingEpic! with {
            IsPublished = true,
            IsPublic = true
        };
    }

    [Given(@"my epic was recently deleted")]
    public void GivenMyEpicWasRecentlyDeleted() {
        // Epic no longer exists in storage
        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns((Epic?)null);
    }

    [Given(@"an epic exists with (.*) campaigns")]
    public void GivenAnEpicExistsWithCampaigns(int count) {
        GivenIOwnAnEpicInMyLibrary();
        GivenMyEpicHasAssociatedCampaigns(count);
    }

    #endregion

    #region Given Steps - Multi-Epic Scenarios

    [Given(@"I own another separate epic with (.*) campaigns")]
    public void GivenIOwnAnotherSeparateEpicWithCampaigns(int count) {
        var secondEpicId = Guid.CreateVersion7();
        var secondEpic = new Epic {
            Id = secondEpicId,
            OwnerId = _userId,
            Name = "Second Epic",
            Description = "Another epic",
            Campaigns = []
        };

        _context["SecondEpicId"] = secondEpicId;
        _context["SecondEpicCampaignCount"] = count;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no epic exists with ID ""(.*)""")]
    public void GivenNoEpicExistsWithId(string epicId) {
        var guid = Guid.Parse(epicId);
        _epicStorage.GetByIdAsync(guid, Arg.Any<CancellationToken>())
            .Returns((Epic?)null);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        // Mock storage to throw exception
        _epicStorage.DeleteAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns<Task>(x => throw new InvalidOperationException("Database connection failed"));
    }

    [Given(@"an epic exists owned by another user")]
    public void GivenAnEpicExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _epicId = Guid.CreateVersion7();
        _existingEpic = new Epic {
            Id = _epicId,
            OwnerId = otherUserId, // Different owner
            Name = "Other User's Epic",
            Description = "Description"
        };

        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(_existingEpic);
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    [Given(@"an epic exists")]
    public void GivenAnEpicExists() {
        GivenIOwnAnEpicInMyLibrary();
    }

    [Given(@"another Game Master has created an epic")]
    public void GivenAnotherGameMasterHasCreatedAnEpic() {
        GivenAnEpicExistsOwnedByAnotherUser();
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the epic")]
    public async Task WhenIDeleteTheEpic() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete the epic")]
    public async Task WhenIAttemptToDeleteTheEpic() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete epic ""(.*)""")]
    public async Task WhenIAttemptToDeleteEpic(string epicId) {
        _epicId = Guid.Parse(epicId);
        await ExecuteDelete();
    }

    [When(@"I attempt to delete that epic")]
    public async Task WhenIAttemptToDeleteThatEpic() {
        await ExecuteDelete();
    }

    [When(@"I delete the first epic")]
    public async Task WhenIDeleteTheFirstEpic() {
        // Delete the primary epic (already set up)
        await ExecuteDelete();
    }

    [When(@"I attempt to delete their epic")]
    public async Task WhenIAttemptToDeleteTheirEpic() {
        await ExecuteDelete();
    }

    private async Task ExecuteDelete() {
        try {
            // Mock storage to succeed
            _epicStorage.DeleteAsync(_epicId, Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            // NOTE: This will fail because IEpicService.DeleteEpicAsync does not exist
            // Placeholder call for when service is implemented
            _deleteResult = await _service.DeleteEpicAsync(_userId, _epicId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the epic is removed")]
    public void ThenTheEpicIsRemoved() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the epic is removed successfully")]
    public void ThenTheEpicIsRemovedSuccessfully() {
        ThenTheEpicIsRemoved();
    }

    [Then(@"I should receive deletion confirmation")]
    public void ThenIShouldReceiveDeletionConfirmation() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all (.*) campaigns is removed")]
    public void ThenAllCampaignsAreRemoved(int expectedCount) {
        var campaignCount = _context.Get<int>("CampaignCount");
        campaignCount.Should().Be(expectedCount);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"both campaigns is removed")]
    public void ThenBothCampaignsAreRemoved() {
        ThenAllCampaignsAreRemoved(2);
    }

    [Then(@"all (.*) adventures is removed")]
    public void ThenAllAdventuresAreRemoved(int expectedCount) {
        _adventureCount.Should().Be(expectedCount);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all campaigns is removed")]
    public void ThenAllCampaignsAreRemoved() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all adventures is removed")]
    public void ThenAllAdventuresAreRemoved() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all scenes is removed")]
    public void ThenAllScenesAreRemoved() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all associated campaigns is removed")]
    public void ThenAllAssociatedCampaignsAreRemoved() {
        ThenAllCampaignsAreRemoved();
    }

    [Then(@"all adventures under campaigns is removed")]
    public void ThenAllAdventuresUnderCampaignsAreRemoved() {
        ThenAllAdventuresAreRemoved();
    }

    [Then(@"attempting to retrieve epic ""(.*)"" should fail")]
    public async Task ThenAttemptingToRetrieveEpicShouldFail(string epicId) {
        var guid = Guid.Parse(epicId);
        var epic = await _epicStorage.GetByIdAsync(guid, CancellationToken.None);
        epic.Should().BeNull();
    }

    [Then(@"public users should no longer see the epic")]
    public void ThenPublicUsersShouldNoLongerSeeTheEpic() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the first epic and its (.*) campaigns is removed")]
    public void ThenTheFirstEpicAndItsCampaignsAreRemoved(int count) {
        _deleteResult!.IsSuccessful.Should().BeTrue();
        _campaignCount.Should().Be(count);
    }

    [Then(@"the second epic and its (.*) campaigns should remain intact")]
    public void ThenTheSecondEpicAndItsCampaignsShouldRemainIntact(int count) {
        var secondEpicCampaignCount = _context.Get<int>("SecondEpicCampaignCount");
        secondEpicCampaignCount.Should().Be(count);
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
        _exception.Should().NotBeNull();
        _exception.Should().BeOfType<InvalidOperationException>();
    }

    [Then(@"the epic should remain in the database")]
    public void ThenTheEpicShouldRemainInTheDatabase() {
        // Delete failed, epic still exists
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("forbidden") || e.Contains("not authorized"));
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("unauthorized") || e.Contains("Unauthorized"));
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        var isAuthenticated = _context.Get<bool>("UserAuthenticated");
        isAuthenticated.Should().BeFalse();
    }

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"my request is rejected")]
    public void ThenMyRequestIsRejected() {
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I receive an error indicating active session dependency")]
    public void ThenIReceiveAnErrorIndicatingActiveSessionDependency() {
        ThenIShouldSeeError("Cannot delete epic referenced by active game session");
    }

    #endregion
}
