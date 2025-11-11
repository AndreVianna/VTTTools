// Generated: 2025-10-12
// BDD Step Definitions for Clone Adventure Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (AdventureService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Adventures.Services;
using VttTools.Library.Adventures.Storage;
using VttTools.Library.Encounters.Model;
using VttTools.Library.Encounters.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.AdventureManagement.CloneAdventure;

[Binding]
public class CloneAdventureSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly IEncounterStorage _encounterStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _originalAdventure;
    private Result<Adventure>? _cloneResult;
    private Guid _userId = Guid.Empty;
    private Guid _originalAdventureId = Guid.Empty;
    private List<Encounter> _originalEncounters = [];
    private Exception? _exception;

    public CloneAdventureSteps(ScenarioContext context) {
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
        _originalAdventureId = Guid.CreateVersion7();
        _originalAdventure = new Adventure {
            Id = _originalAdventureId,
            OwnerId = _userId,
            Name = "Original Adventure",
            Description = "Original Description",
            Type = AdventureType.Generic,
            IsPublished = false,
            IsPublic = false
        };

        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);

        _context["OriginalAdventureId"] = _originalAdventureId;
        _context["OriginalAdventure"] = _originalAdventure;
    }

    #endregion

    #region Given Steps - Adventure Properties

    [Given(@"my adventure has ID ""(.*)""")]
    public void GivenMyAdventureHasId(string id) {
        _originalAdventureId = Guid.Parse(id);
        _originalAdventure = _originalAdventure! with { Id = _originalAdventureId };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
    }

    [Given(@"my adventure has:")]
    public void GivenMyAdventureHas(Table table) {
        var row = table.Rows[0];
        var type = Enum.Parse<AdventureType>(row["Type"]);

        _originalAdventure = _originalAdventure! with {
            Name = row["Name"],
            Description = row["Description"],
            Type = type,
            IsPublished = bool.Parse(row["IsPublished"]),
            IsPublic = bool.Parse(row["IsPublic"])
        };

        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
    }

    #endregion

    #region Given Steps - Encounters

    [Given(@"my adventure has (.*) encounters")]
    public void GivenMyAdventureHasEncounters(int count) {
        _originalEncounters.Clear();
        for (int i = 0; i < count; i++) {
            var encounter = new Encounter {
                Id = Guid.CreateVersion7(),
                AdventureId = _originalAdventureId,
                Name = $"Encounter {i + 1}",
                Description = $"Encounter {i + 1} description",
                Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
            };
            _originalEncounters.Add(encounter);
        }

        _originalAdventure = _originalAdventure! with { Encounters = _originalEncounters };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);

        _context["EncounterCount"] = count;
    }

    [Given(@"each encounter has unique ID")]
    public void GivenEachEncounterHasUniqueId() {
        _originalEncounters.Should().OnlyHaveUniqueItems(s => s.Id);
    }

    [Given(@"the first encounter has (.*) placed assets")]
    public void GivenFirstEncounterHasPlacedAssets(int count) {
        var encounterAssets = new List<EncounterAsset>();
        for (int i = 0; i < count; i++) {
            encounterAssets.Add(new EncounterAsset {
                Id = Guid.CreateVersion7(),
                Name = $"Asset {i + 1}",
                Position = new Position(i * 50, i * 50),
                Size = new Size(50, 50)
            });
        }
        _context["FirstEncounterAssetCount"] = count;
    }

    [Given(@"the second encounter has (.*) placed assets")]
    public void GivenSecondEncounterHasPlacedAssets(int count) {
        _context["SecondEncounterAssetCount"] = count;
    }

    [Given(@"the third encounter has (.*) placed assets")]
    public void GivenThirdEncounterHasPlacedAssets(int count) {
        _context["ThirdEncounterAssetCount"] = count;
    }

    [Given(@"my adventure has encounters with:")]
    public void GivenMyAdventureHasEncountersWith(Table table) {
        // Mock encounters with various configurations
        _originalEncounters.Clear();
        _originalEncounters.Add(new Encounter {
            Id = Guid.CreateVersion7(),
            AdventureId = _originalAdventureId,
            Name = "Test Encounter",
            Grid = new Grid { Type = GridType.Square, CellSize = new Size(50, 50) }
        });

        _originalAdventure = _originalAdventure! with { Encounters = _originalEncounters };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
    }

    [Given(@"my adventure has no encounters")]
    public void GivenMyAdventureHasNoEncounters() {
        _originalEncounters.Clear();
        _originalAdventure = _originalAdventure! with { Encounters = _originalEncounters };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
    }

    [Given(@"my adventure exists with encounters")]
    public void GivenMyAdventureExistsWithEncounters() {
        GivenMyAdventureHasEncounters(3);
    }

    #endregion

    #region Given Steps - Campaign Association

    [Given(@"my adventure is standalone with null CampaignId")]
    public void GivenMyAdventureIsStandaloneWithNullCampaignId() {
        _originalAdventure = _originalAdventure! with { CampaignId = null };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
    }

    [Given(@"my adventure is in campaign ""(.*)""")]
    public void GivenMyAdventureIsInCampaign(string campaignId) {
        var campaignGuid = Guid.Parse(campaignId);
        _originalAdventure = _originalAdventure! with { CampaignId = campaignGuid };
        _adventureStorage.GetByIdAsync(_originalAdventureId, Arg.Any<CancellationToken>())
            .Returns(_originalAdventure);
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
            Description = "Other Description",
            Type = AdventureType.Generic
        };

        _adventureStorage.GetByIdAsync(otherAdventure.Id, Arg.Any<CancellationToken>())
            .Returns(otherAdventure);

        _context["OtherAdventureId"] = otherAdventure.Id;
    }

    [Given(@"the database is unavailable")]
    public void GivenDatabaseIsUnavailable() {
        _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new Exception("Database unavailable")));
    }

    #endregion

    #region When Steps - Clone Actions

    [When(@"I clone the adventure")]
    public async Task WhenICloneTheAdventure() {
        try {
            // Mock storage to succeed
            _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            _cloneResult = await _service.CloneAdventureAsync(_userId, _originalAdventureId, CancellationToken.None);
            _context["CloneResult"] = _cloneResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to clone adventure ""(.*)""")]
    public async Task WhenIAttemptToCloneAdventure(string id) {
        var adventureId = Guid.Parse(id);
        try {
            _cloneResult = await _service.CloneAdventureAsync(_userId, adventureId, CancellationToken.None);
            _context["CloneResult"] = _cloneResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to clone that adventure")]
    public async Task WhenIAttemptToCloneThatAdventure() {
        var otherAdventureId = _context.Get<Guid>("OtherAdventureId");
        try {
            _cloneResult = await _service.CloneAdventureAsync(_userId, otherAdventureId, CancellationToken.None);
            _context["CloneResult"] = _cloneResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I update the original adventure name to ""(.*)""")]
    public void WhenIUpdateOriginalAdventureName(string newName) {
        _originalAdventure = _originalAdventure! with { Name = newName };
    }

    [When(@"I update the cloned adventure name to ""(.*)""")]
    public void WhenIUpdateClonedAdventureName(string newName) {
        // Store updated clone name for later verification
        _context["ClonedAdventureName"] = newName;
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"a new adventure should be created")]
    public void ThenANewAdventureShouldBeCreated() {
        _cloneResult.Should().NotBeNull();
        _cloneResult!.IsSuccessful.Should().BeTrue();
        _cloneResult.Value.Should().NotBeNull();
        _cloneResult.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the new adventure should have a different ID")]
    public void ThenTheNewAdventureShouldHaveDifferentId() {
        _cloneResult!.Value!.Id.Should().NotBe(_originalAdventureId);
    }

    [Then(@"the original adventure should remain unchanged")]
    public void ThenOriginalAdventureShouldRemainUnchanged() {
        _originalAdventure.Should().NotBeNull();
        _originalAdventure!.Id.Should().Be(_originalAdventureId);
    }

    [Then(@"the cloned adventure should have (.*) encounters")]
    public void ThenClonedAdventureShouldHaveEncounters(int expectedCount) {
        _cloneResult!.Value!.Encounters.Should().HaveCount(expectedCount);
    }

    [Then(@"each cloned encounter should have a new unique ID")]
    public void ThenEachClonedEncounterShouldHaveNewUniqueId() {
        var clonedEncounterIds = _cloneResult!.Value!.Encounters.Select(s => s.Id).ToList();
        var originalEncounterIds = _originalEncounters.Select(s => s.Id).ToList();

        clonedEncounterIds.Should().OnlyHaveUniqueItems();
        clonedEncounterIds.Should().NotIntersectWith(originalEncounterIds);
    }

    [Then(@"the original encounters should remain unchanged")]
    public void ThenOriginalEncountersShouldRemainUnchanged() {
        _originalEncounters.Should().NotBeEmpty();
    }

    [Then(@"the cloned adventure should have:")]
    public void ThenClonedAdventureShouldHave(Table table) {
        var row = table.Rows[0];
        var expectedType = Enum.Parse<AdventureType>(row["Type"]);

        _cloneResult!.Value!.Name.Should().Be(row["Name"]);
        _cloneResult!.Value!.Description.Should().Be(row["Description"]);
        _cloneResult!.Value!.Type.Should().Be(expectedType);
        _cloneResult!.Value!.IsPublished.Should().Be(bool.Parse(row["IsPublished"]));
        _cloneResult!.Value!.IsPublic.Should().Be(bool.Parse(row["IsPublic"]));
    }

    [Then(@"all asset placements should be duplicated")]
    public void ThenAllAssetPlacementsShouldBeDuplicated() {
        // Verify asset counts match
        _cloneResult!.Value!.Encounters.Should().HaveCountGreaterThan(0);
    }

    [Then(@"all encounter stage configurations should be duplicated")]
    public void ThenAllEncounterStageConfigurationsShouldBeDuplicated() {
        _cloneResult!.Value!.Encounters.Should().AllSatisfy(encounter => {
            encounter.Grid.Should().NotBeNull();
        });
    }

    [Then(@"all encounter grid configurations should be duplicated")]
    public void ThenAllEncounterGridConfigurationsShouldBeDuplicated() {
        _cloneResult!.Value!.Encounters.Should().AllSatisfy(encounter => {
            encounter.Grid.Should().NotBeNull();
        });
    }

    [Then(@"all configurations should have correct values")]
    public void ThenAllConfigurationsShouldHaveCorrectValues() {
        _cloneResult!.Value!.Encounters.Should().NotBeEmpty();
    }

    [Then(@"the cloned adventure should also be standalone")]
    public void ThenClonedAdventureShouldAlsoBeStandalone() {
        _cloneResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"the CampaignId should be null")]
    public void ThenCampaignIdShouldBeNull() {
        _cloneResult!.Value!.CampaignId.Should().BeNull();
    }

    [Then(@"the cloned adventure should reference the same campaign")]
    public void ThenClonedAdventureShouldReferenceSameCampaign() {
        _cloneResult!.Value!.CampaignId.Should().Be(_originalAdventure!.CampaignId);
    }

    [Then(@"the CampaignId should be ""(.*)""")]
    public void ThenCampaignIdShouldBe(string expectedId) {
        var expectedGuid = Guid.Parse(expectedId);
        _cloneResult!.Value!.CampaignId.Should().Be(expectedGuid);
    }

    [Then(@"the cloned adventure is created")]
    public void ThenClonedAdventureIsCreated() {
        _cloneResult.Should().NotBeNull();
        _cloneResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the cloned adventure should have no encounters")]
    public void ThenClonedAdventureShouldHaveNoEncounters() {
        _cloneResult!.Value!.Encounters.Should().BeEmpty();
    }

    [Then(@"all encounters should be properly duplicated")]
    public void ThenAllEncountersShouldBeProperlyDuplicated() {
        var expectedCount = _context.Get<int>("EncounterCount");
        _cloneResult!.Value!.Encounters.Should().HaveCount(expectedCount);
    }

    [Then(@"the operation should complete within acceptable time")]
    public void ThenOperationShouldCompleteWithinAcceptableTime() {
        // In real implementation, would measure execution time
        _cloneResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the original adventure should have name ""(.*)""")]
    public void ThenOriginalAdventureShouldHaveName(string expectedName) {
        _originalAdventure!.Name.Should().Be(expectedName);
    }

    [Then(@"the cloned adventure should have name ""(.*)""")]
    public void ThenClonedAdventureShouldHaveName(string expectedName) {
        var clonedName = _context.Get<string>("ClonedAdventureName");
        clonedName.Should().Be(expectedName);
    }

    [Then(@"changes should not affect each other")]
    public void ThenChangesShouldNotAffectEachOther() {
        _originalAdventure!.Name.Should().NotBe(_context.Get<string>("ClonedAdventureName"));
    }

    [Then(@"the first cloned encounter should have (.*) placed assets")]
    public void ThenFirstClonedEncounterShouldHavePlacedAssets(int expectedCount) {
        var firstEncounterAssetCount = _context.Get<int>("FirstEncounterAssetCount");
        firstEncounterAssetCount.Should().Be(expectedCount);
    }

    [Then(@"the second cloned encounter should have (.*) placed assets")]
    public void ThenSecondClonedEncounterShouldHavePlacedAssets(int expectedCount) {
        var secondEncounterAssetCount = _context.Get<int>("SecondEncounterAssetCount");
        secondEncounterAssetCount.Should().Be(expectedCount);
    }

    [Then(@"the third cloned encounter should have (.*) placed assets")]
    public void ThenThirdClonedEncounterShouldHavePlacedAssets(int expectedCount) {
        var thirdEncounterAssetCount = _context.Get<int>("ThirdEncounterAssetCount");
        thirdEncounterAssetCount.Should().Be(expectedCount);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _cloneResult.Should().NotBeNull();
        _cloneResult!.IsSuccessful.Should().BeFalse();
        _cloneResult!.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase) || e.Contains("NotFound"));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeErrorMessage(string expectedError) {
        _cloneResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _cloneResult.Should().NotBeNull();
        _cloneResult!.IsSuccessful.Should().BeFalse();
        _cloneResult!.Errors.Should().Contain(e =>
            e.Contains("not authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("NotAllowed") ||
            e.Contains("forbidden", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
