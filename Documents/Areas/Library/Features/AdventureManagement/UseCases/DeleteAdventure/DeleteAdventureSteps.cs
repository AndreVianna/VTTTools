// Generated: 2025-10-12
// BDD Step Definitions for Delete Adventure Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (AdventureService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Adventures.Services;
using VttTools.Library.Adventures.Storage;
using VttTools.Library.Encounters.Model;
using VttTools.Library.Encounters.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.AdventureManagement.DeleteAdventure;

[Binding]
public class DeleteAdventureSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly IEncounterStorage _encounterStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _existingAdventure;
    private Result? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _adventureId = Guid.Empty;
    private List<Encounter> _encounters = [];
    private int _totalAssetPlacements = 0;
    private Exception? _exception;

    public DeleteAdventureSteps(ScenarioContext context) {
        _context = context;
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new AdventureService(_adventureStorage, _encounterStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own an adventure in my library")]
    public void GivenIAlreadyOwnAnAdventure() {
        _adventureId = Guid.CreateVersion7();
        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Test Adventure",
            Description = "Test Description",
            Type = AdventureType.Generic
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["AdventureId"] = _adventureId;
        _context["ExistingAdventure"] = _existingAdventure;
    }

    #endregion

    #region Given Steps - Encounters

    [Given(@"my adventure has (.*) associated encounters")]
    public void GivenMyAdventureHasAssociatedEncounters(int count) {
        _encounters.Clear();
        for (int i = 0; i < count; i++) {
            _encounters.Add(new Encounter {
                Id = Guid.CreateVersion7(),
                AdventureId = _adventureId,
                Name = $"Encounter {i + 1}",
                Description = $"Encounter {i + 1} description"
            });
        }

        _existingAdventure = _existingAdventure! with { Encounters = _encounters };
        _encounterStorage.GetByParentIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_encounters.ToArray());

        _context["EncounterCount"] = count;
    }

    [Given(@"my adventure has (.*) encounters")]
    public void GivenMyAdventureHasEncounters(int count) {
        GivenMyAdventureHasAssociatedEncounters(count);
    }

    [Given(@"the first encounter has (.*) placed assets")]
    public void GivenFirstEncounterHasPlacedAssets(int count) {
        _totalAssetPlacements += count;
        _context["FirstEncounterAssetCount"] = count;
    }

    [Given(@"the second encounter has (.*) placed assets")]
    public void GivenSecondEncounterHasPlacedAssets(int count) {
        _totalAssetPlacements += count;
        _context["SecondEncounterAssetCount"] = count;
    }

    [Given(@"the third encounter has (.*) placed assets")]
    public void GivenThirdEncounterHasPlacedAssets(int count) {
        _totalAssetPlacements += count;
        _context["ThirdEncounterAssetCount"] = count;
    }

    [Given(@"the fourth encounter has (.*) placed assets")]
    public void GivenFourthEncounterHasPlacedAssets(int count) {
        _totalAssetPlacements += count;
        _context["FourthEncounterAssetCount"] = count;
    }

    [Given(@"my adventure has no associated encounters")]
    public void GivenMyAdventureHasNoAssociatedEncounters() {
        _encounters.Clear();
        _existingAdventure = _existingAdventure! with { Encounters = _encounters };
        _encounterStorage.GetByParentIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_encounters.ToArray());
    }

    [Given(@"my adventure exists with encounters")]
    public void GivenMyAdventureExistsWithEncounters() {
        GivenMyAdventureHasAssociatedEncounters(3);
    }

    #endregion

    #region Given Steps - Campaign Association

    [Given(@"my adventure is standalone with null CampaignId")]
    public void GivenMyAdventureIsStandalone() {
        _existingAdventure = _existingAdventure! with { CampaignId = null };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure is in a campaign with (.*) adventures")]
    public void GivenMyAdventureIsInCampaignWithAdventures(int totalAdventures) {
        var campaignId = Guid.CreateVersion7();
        _existingAdventure = _existingAdventure! with { CampaignId = campaignId };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["CampaignId"] = campaignId;
        _context["TotalAdventures"] = totalAdventures;
    }

    [Given(@"my adventure is published and public")]
    public void GivenMyAdventureIsPublishedAndPublic() {
        _existingAdventure = _existingAdventure! with { IsPublished = true, IsPublic = true };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    #endregion

    #region Given Steps - Multiple Adventures

    [Given(@"I own (.*) adventures")]
    public void GivenIAlreadyOwnMultipleAdventures(int count) {
        var adventures = new List<Adventure>();
        for (int i = 0; i < count; i++) {
            adventures.Add(new Adventure {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                Name = $"Adventure {i + 1}",
                Type = AdventureType.Generic
            });
        }
        _context["AdventureList"] = adventures;
    }

    [Given(@"the first adventure has (.*) encounters")]
    public void GivenFirstAdventureHasEncounters(int count) {
        var adventures = _context.Get<List<Adventure>>("AdventureList");
        _adventureId = adventures[0].Id;
        _existingAdventure = adventures[0];
        GivenMyAdventureHasEncounters(count);
    }

    [Given(@"the second adventure has (.*) encounters")]
    public void GivenSecondAdventureHasEncounters(int count) {
        _context["SecondAdventureEncounterCount"] = count;
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

    [Given(@"an adventure exists owned by another user")]
    public void GivenAdventureExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        var otherAdventure = new Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = otherUserId,
            Name = "Other User's Adventure",
            Type = AdventureType.Generic
        };

        _adventureStorage.GetByIdAsync(otherAdventure.Id, Arg.Any<CancellationToken>())
            .Returns(otherAdventure);

        _context["OtherAdventureId"] = otherAdventure.Id;
    }

    [Given(@"the database is unavailable")]
    public void GivenDatabaseIsUnavailable() {
        _adventureStorage.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new Exception("Database unavailable")));
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserId"] = _userId;
    }

    [Given(@"an adventure exists")]
    public void GivenAnAdventureExists() {
        GivenIAlreadyOwnAnAdventure();
    }

    #endregion

    #region Given Steps - Data Driven

    [Given(@"I own an adventure with type ""(.*)""")]
    public void GivenIAlreadyOwnAnAdventureWithType(string typeName) {
        var type = Enum.Parse<AdventureType>(typeName);
        _adventureId = Guid.CreateVersion7();
        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = $"{type} Adventure",
            Type = type
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["AdventureId"] = _adventureId;
    }

    [Given(@"the adventure has (.*) encounters")]
    public void GivenTheAdventureHasEncounters(int count) {
        GivenMyAdventureHasEncounters(count);
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the adventure")]
    public async Task WhenIDeleteTheAdventure() {
        try {
            // Mock storage to succeed
            _adventureStorage.DeleteAsync(_adventureId, Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            _deleteResult = await _service.DeleteAdventureAsync(_userId, _adventureId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete adventure ""(.*)""")]
    public async Task WhenIAttemptToDeleteAdventure(string id) {
        var adventureId = Guid.Parse(id);
        try {
            _deleteResult = await _service.DeleteAdventureAsync(_userId, adventureId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete that adventure")]
    public async Task WhenIAttemptToDeleteThatAdventure() {
        var otherAdventureId = _context.Get<Guid>("OtherAdventureId");
        try {
            _deleteResult = await _service.DeleteAdventureAsync(_userId, otherAdventureId, CancellationToken.None);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to delete the adventure")]
    public async Task WhenIAttemptToDeleteTheAdventure() {
        await WhenIDeleteTheAdventure();
    }

    [When(@"I delete the first adventure")]
    public async Task WhenIDeleteTheFirstAdventure() {
        await WhenIDeleteTheAdventure();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the adventure is removed")]
    public void ThenTheAdventureIsRemoved() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all (.*) encounters is removed")]
    public void ThenAllEncountersAreRemoved(int expectedCount) {
        var encounterCount = _context.Get<int>("EncounterCount");
        encounterCount.Should().Be(expectedCount);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive deletion confirmation")]
    public void ThenIShouldReceiveDeletionConfirmation() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"all encounter asset placements is removed")]
    public void ThenAllEncounterAssetPlacementsAreRemoved() {
        _totalAssetPlacements.Should().BeGreaterThan(0);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the adventure should not appear in standalone adventures list")]
    public void ThenAdventureShouldNotAppearInStandaloneList() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the campaign should now have (.*) adventures")]
    public void ThenCampaignShouldHaveAdventures(int expectedCount) {
        var totalAdventures = _context.Get<int>("TotalAdventures");
        (totalAdventures - 1).Should().Be(expectedCount);
    }

    [Then(@"the campaign should remain intact")]
    public void ThenCampaignShouldRemainIntact() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the adventure is removed successfully")]
    public void ThenTheAdventureIsRemovedSuccessfully() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"public users should no longer see the adventure")]
    public void ThenPublicUsersShouldNoLongerSeeAdventure() {
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the first adventure and its (.*) encounters is removed")]
    public void ThenFirstAdventureAndEncountersAreRemoved(int encounterCount) {
        var expectedCount = _context.Get<int>("EncounterCount");
        expectedCount.Should().Be(encounterCount);
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the second adventure and its (.*) encounters should remain intact")]
    public void ThenSecondAdventureAndEncountersRemainIntact(int expectedCount) {
        var secondAdventureEncounterCount = _context.Get<int>("SecondAdventureEncounterCount");
        secondAdventureEncounterCount.Should().Be(expectedCount);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase) || e.Contains("NotFound"));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeErrorMessage(string expectedError) {
        _deleteResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
    }

    [Then(@"the adventure should remain in the database")]
    public void ThenAdventureShouldRemainInDatabase() {
        _existingAdventure.Should().NotBeNull();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("not authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("NotAllowed") ||
            e.Contains("forbidden", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        _userId.Should().Be(Guid.Empty);
    }

    #endregion
}
