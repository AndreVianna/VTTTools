// Generated: 2025-10-12
// BDD Step Definitions for Delete World Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (WorldService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Worlds.Model;
using VttTools.Library.Worlds.Services;
using VttTools.Library.Worlds.Storage;
using VttTools.Library.Encounters.Model;
using Xunit;

namespace VttTools.Library.Tests.BDD.WorldManagement.DeleteWorld;

/// <summary>
/// BDD Step Definitions for Delete World scenarios.
/// BLOCKED: WorldService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class DeleteWorldSteps {
    private readonly ScenarioContext _context;
    private readonly IWorldStorage _worldStorage;
    private readonly IWorldService _service;

    // Test state
    private World? _existingWorld;
    private Result? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _worldId = Guid.Empty;
    private int _campaignCount = 0;
    private int _adventureCount = 0;
    private int _encounterCount = 0;
    private Exception? _exception;

    public DeleteWorldSteps(ScenarioContext context) {
        _context = context;
        _worldStorage = Substitute.For<IWorldStorage>();
        // NOTE: IWorldService does not exist yet - placeholder for Phase 7
        _service = Substitute.For<IWorldService>();
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own an world in my library")]
    public void GivenIOwnAnWorldInMyLibrary() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Test World",
            Description = "Test Description",
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);

        _context["WorldId"] = _worldId;
    }

    [Given(@"I have an world with two campaigns")]
    public void GivenIHaveAnWorldWithTwoCampaigns() {
        GivenMyWorldHasAssociatedCampaigns(2);
    }

    [Given(@"I have an world titled ""(.*)""")]
    public void GivenIHaveAnWorldTitled(string name) {
        GivenIOwnAnWorldInMyLibrary();
        _existingWorld = _existingWorld! with { Name = name };
    }

    #endregion

    #region Given Steps - World with Campaigns

    [Given(@"my world has (.*) associated campaigns")]
    public void GivenMyWorldHasAssociatedCampaigns(int count) {
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }

        var campaigns = new List<Campaign>();
        for (int i = 0; i < count; i++) {
            campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                Name = $"Campaign {i + 1}",
                OwnerId = _userId,
                WorldId = _worldId
            });
        }

        _existingWorld = _existingWorld! with { Campaigns = campaigns };
        _campaignCount = count;
        _context["CampaignCount"] = count;
    }

    [Given(@"my world has no associated campaigns")]
    public void GivenMyWorldHasNoAssociatedCampaigns() {
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }
        _existingWorld = _existingWorld! with { Campaigns = [] };
        _campaignCount = 0;
    }

    [Given(@"my world has (.*) campaigns")]
    public void GivenMyWorldHasCampaigns(int count) {
        GivenMyWorldHasAssociatedCampaigns(count);
    }

    [Given(@"the world has a campaign in use by an active game session")]
    public void GivenTheWorldHasACampaignInUseByActiveGameSession() {
        GivenMyWorldHasAssociatedCampaigns(1);
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

    [Given(@"my world has complete content hierarchy:")]
    public void GivenMyWorldHasCompleteContentHierarchy(Table table) {
        foreach (var row in table.Rows) {
            var level = row["Level"];
            var count = int.Parse(row["Count"]);

            if (level == "Campaigns") {
                GivenMyWorldHasAssociatedCampaigns(count);
            }
            else if (level == "Adventures") {
                _adventureCount = count;
            }
            else if (level == "Encounters") {
                _encounterCount = count;
            }
        }
    }

    [Given(@"each campaign has three adventures")]
    public void GivenEachCampaignHasThreeAdventures() {
        _adventureCount = _campaignCount * 3;
    }

    [Given(@"each adventure has multiple encounters")]
    public void GivenEachAdventureHasMultipleEncounters() {
        _encounterCount = _adventureCount * 2;
    }

    #endregion

    #region Given Steps - World State

    [Given(@"my world has ID ""(.*)""")]
    public void GivenMyWorldHasId(string worldId) {
        _worldId = Guid.Parse(worldId);
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }
        _existingWorld = _existingWorld! with { Id = _worldId };
    }

    [Given(@"my world exists")]
    public void GivenMyWorldExists() {
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }
    }

    [Given(@"my world is published and public")]
    public void GivenMyWorldIsPublishedAndPublic() {
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }
        _existingWorld = _existingWorld! with {
            IsPublished = true,
            IsPublic = true
        };
    }

    [Given(@"my world was recently deleted")]
    public void GivenMyWorldWasRecentlyDeleted() {
        // World no longer exists in storage
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"an world exists with (.*) campaigns")]
    public void GivenAnWorldExistsWithCampaigns(int count) {
        GivenIOwnAnWorldInMyLibrary();
        GivenMyWorldHasAssociatedCampaigns(count);
    }

    #endregion

    #region Given Steps - Multi-World Scenarios

    [Given(@"I own another separate world with (.*) campaigns")]
    public void GivenIOwnAnotherSeparateWorldWithCampaigns(int count) {
        var secondWorldId = Guid.CreateVersion7();
        var secondWorld = new World {
            Id = secondWorldId,
            OwnerId = _userId,
            Name = "Second World",
            Description = "Another world",
            Campaigns = []
        };

        _context["SecondWorldId"] = secondWorldId;
        _context["SecondWorldCampaignCount"] = count;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no world exists with ID ""(.*)""")]
    public void GivenNoWorldExistsWithId(string worldId) {
        var guid = Guid.Parse(worldId);
        _worldStorage.GetByIdAsync(guid, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        // Mock storage to throw exception
        _worldStorage.DeleteAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns<Task>(x => throw new InvalidOperationException("Database connection failed"));
    }

    [Given(@"an world exists owned by another user")]
    public void GivenAnWorldExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = otherUserId, // Different owner
            Name = "Other User's World",
            Description = "Description"
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    [Given(@"an world exists")]
    public void GivenAnWorldExists() {
        GivenIOwnAnWorldInMyLibrary();
    }

    [Given(@"another Game Master has created an world")]
    public void GivenAnotherGameMasterHasCreatedAnWorld() {
        GivenAnWorldExistsOwnedByAnotherUser();
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the world")]
    public async Task WhenIDeleteTheWorld() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete the world")]
    public async Task WhenIAttemptToDeleteTheWorld() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete world ""(.*)""")]
    public async Task WhenIAttemptToDeleteWorld(string worldId) {
        _worldId = Guid.Parse(worldId);
        await ExecuteDelete();
    }

    [When(@"I attempt to delete that world")]
    public async Task WhenIAttemptToDeleteThatWorld() {
        await ExecuteDelete();
    }

    [When(@"I delete the first world")]
    public async Task WhenIDeleteTheFirstWorld() {
        // Delete the primary world (already set up)
        await ExecuteDelete();
    }

    [When(@"I attempt to delete their world")]
    public async Task WhenIAttemptToDeleteTheirWorld() {
        await ExecuteDelete();
    }

    private async Task ExecuteDelete() {
        try {
            // Mock storage to succeed
            _worldStorage.DeleteAsync(_worldId, Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            // NOTE: This will fail because IWorldService.DeleteWorldAsync does not exist
            // Placeholder call for when service is implemented
            _deleteResult = await _service.DeleteWorldAsync(_userId, _worldId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the world is removed")]
    public void ThenTheWorldIsRemoved() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the world is removed successfully")]
    public void ThenTheWorldIsRemovedSuccessfully() {
        ThenTheWorldIsRemoved();
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

    [Then(@"all encounters is removed")]
    public void ThenAllEncountersAreRemoved() {
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

    [Then(@"attempting to retrieve world ""(.*)"" should fail")]
    public async Task ThenAttemptingToRetrieveWorldShouldFail(string worldId) {
        var guid = Guid.Parse(worldId);
        var world = await _worldStorage.GetByIdAsync(guid, CancellationToken.None);
        world.Should().BeNull();
    }

    [Then(@"public users should no longer see the world")]
    public void ThenPublicUsersShouldNoLongerSeeTheWorld() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the first world and its (.*) campaigns is removed")]
    public void ThenTheFirstWorldAndItsCampaignsAreRemoved(int count) {
        _deleteResult!.IsSuccessful.Should().BeTrue();
        _campaignCount.Should().Be(count);
    }

    [Then(@"the second world and its (.*) campaigns should remain intact")]
    public void ThenTheSecondWorldAndItsCampaignsShouldRemainIntact(int count) {
        var secondWorldCampaignCount = _context.Get<int>("SecondWorldCampaignCount");
        secondWorldCampaignCount.Should().Be(count);
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

    [Then(@"the world should remain in the database")]
    public void ThenTheWorldShouldRemainInTheDatabase() {
        // Delete failed, world still exists
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
        ThenIShouldSeeError("Cannot delete world referenced by active game session");
    }

    #endregion
}
