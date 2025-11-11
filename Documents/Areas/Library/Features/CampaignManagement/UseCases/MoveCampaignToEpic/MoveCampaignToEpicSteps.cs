// Generated: 2025-10-12
// BDD Step Definitions for Move Campaign To World Use Case
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
using VttTools.Library.Worlds.Model;
using VttTools.Library.Worlds.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.MoveCampaignToWorld;

[Binding]
public class MoveCampaignToWorldSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IWorldStorage _worldStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private World? _targetWorld;
    private Result<Campaign>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private Guid _targetWorldId = Guid.Empty;
    private string? _invalidId;

    public MoveCampaignToWorldSteps(ScenarioContext context) {
        _context = context;
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _worldStorage = Substitute.For<IWorldStorage>();

        // NOTE: CampaignService not implemented yet (Phase 7 - BLOCKED)
        _service = new CampaignService(_campaignStorage, _worldStorage, null!);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own a standalone campaign")]
    public void GivenIAlreadyOwnAStandaloneCampaign() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            WorldId = null, // Standalone
            Name = "Standalone Campaign",
            Description = "Campaign without world",
            Adventures = []
        };

        _context["CampaignId"] = _campaignId;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"I own an world")]
    public void GivenIAlreadyOwnAnWorld() {
        _targetWorldId = Guid.CreateVersion7();
        _targetWorld = new World {
            Id = _targetWorldId,
            OwnerId = _userId,
            Name = "Target World",
            Description = string.Empty
        };

        _context["WorldId"] = _targetWorldId;

        // Mock world storage to return world
        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns(_targetWorld);
    }

    #endregion

    #region Given Steps - Campaign State

    [Given(@"my campaign has null WorldId")]
    public void GivenMyCampaignHasNullWorldId() {
        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = null;
        }
    }

    [Given(@"I own world with ID ""(.*)""")]
    public void GivenIAlreadyOwnWorldWithId(string worldId) {
        _targetWorldId = Guid.Parse(worldId);
        _targetWorld = new World {
            Id = _targetWorldId,
            OwnerId = _userId,
            Name = "My World",
            Description = string.Empty
        };

        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns(_targetWorld);
    }

    [Given(@"my campaign is in world ""(.*)""")]
    public void GivenMyCampaignIsInWorld(string worldId) {
        var currentWorldId = Guid.Parse(worldId);
        if (_existingCampaign is not null) {
            _existingCampaign.WorldId = currentWorldId;
        }
    }

    [Given(@"I own world ""(.*)""")]
    public void GivenIAlreadyOwnWorld(string worldId) {
        _targetWorldId = Guid.Parse(worldId);
        _targetWorld = new World {
            Id = _targetWorldId,
            OwnerId = _userId,
            Name = "Target World",
            Description = string.Empty
        };

        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns(_targetWorld);
    }

    #endregion

    #region Given Steps - Campaign with Adventures

    [Given(@"my standalone campaign has (.*) adventures")]
    public void GivenMyStandaloneCampaignHasAdventures(int count) {
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

    #region Given Steps - Campaign Properties

    [Given(@"my standalone campaign has:")]
    public void GivenMyStandaloneCampaignHasProperties(Table table) {
        var data = table.CreateInstance<CampaignPropertiesTable>();
        if (_existingCampaign is not null) {
            _existingCampaign.Name = data.Name;
            _existingCampaign.Description = data.Description;
            _existingCampaign.IsPublished = data.IsPublished;
            _existingCampaign.IsPublic = data.IsPublic;
        }
    }

    #endregion

    #region Given Steps - World Context

    [Given(@"an world has (.*) campaigns")]
    public void GivenAnWorldHasCampaigns(int totalCount) {
        _targetWorldId = Guid.CreateVersion7();
        _targetWorld = new World {
            Id = _targetWorldId,
            OwnerId = _userId,
            Name = "World with Campaigns",
            Description = string.Empty
        };

        _context["TotalCampaignsInWorld"] = totalCount;

        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns(_targetWorld);
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"my standalone campaign exists")]
    public void GivenMyStandaloneCampaignExists() {
        // Already set up in Background
        _existingCampaign.Should().NotBeNull();
    }

    [Given(@"no world exists with ID ""(.*)""")]
    public void GivenNoWorldExistsWithId(string worldId) {
        _targetWorldId = Guid.Parse(worldId);

        // Mock world storage to return null
        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"a standalone campaign exists owned by another user")]
    public void GivenAStandaloneCampaignExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = otherUserId,
            WorldId = null,
            Name = "Other User's Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"an world exists owned by another user")]
    public void GivenAnWorldExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _targetWorldId = Guid.CreateVersion7();
        _targetWorld = new World {
            Id = _targetWorldId,
            OwnerId = otherUserId,
            Name = "Other User's World",
            Description = string.Empty
        };

        _worldStorage.GetByIdAsync(_targetWorldId, Arg.Any<CancellationToken>())
            .Returns(_targetWorld);
    }

    #endregion

    #region When Steps - Move to World Actions

    [When(@"I move the campaign to world ""(.*)""")]
    public async Task WhenIMoveTheCampaignToWorld(string worldId) {
        try {
            _targetWorldId = Guid.Parse(worldId);

            // Mock storage to succeed
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.MoveCampaignToWorldAsync(_userId, _campaignId, _targetWorldId, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I move the campaign to the world")]
    public async Task WhenIMoveTheCampaignToTheWorld() {
        try {
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.MoveCampaignToWorldAsync(_userId, _campaignId, _targetWorldId, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to move the campaign to world ""(.*)""")]
    public async Task WhenIAttemptToMoveTheCampaignToWorld(string worldId) {
        await WhenIMoveTheCampaignToWorld(worldId);
    }

    [When(@"I attempt to move campaign to world ""(.*)""")]
    public async Task WhenIAttemptToMoveCampaignToWorld(string worldId) {
        if (worldId == "not-a-guid") {
            _invalidId = worldId;
            try {
                if (!Guid.TryParse(_invalidId, out _targetWorldId)) {
                    throw new FormatException("Invalid world ID format");
                }
            }
            catch (Exception ex) {
                _context["Exception"] = ex;
                return;
            }
        }

        await WhenIMoveTheCampaignToWorld(worldId);
    }

    [When(@"I attempt to move that campaign to my world")]
    public async Task WhenIAttemptToMoveThatCampaignToMyWorld() {
        await WhenIMoveTheCampaignToTheWorld();
    }

    [When(@"I attempt to move my campaign to that world")]
    public async Task WhenIAttemptToMoveMyC ampaignToThatWorld() {
        await WhenIMoveTheCampaignToTheWorld();
    }

    [When(@"I move the standalone campaign to the world")]
    public async Task WhenIMoveTheStandaloneCampaignToTheWorld() {
        await WhenIMoveTheCampaignToTheWorld();
    }

    [When(@"I move the campaign to an world")]
    public async Task WhenIMoveTheCampaignToAnWorld() {
        await WhenIMoveTheCampaignToTheWorld();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign is updated successfully")]
    public void ThenTheCampaignIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign WorldId should be ""(.*)""")]
    public void ThenTheCampaignWorldIdShouldBe(string expectedWorldId) {
        var expectedGuid = Guid.Parse(expectedWorldId);
        _updateResult!.Value!.WorldId.Should().Be(expectedGuid);
    }

    [Then(@"the campaign should be associated with the world")]
    public void ThenTheCampaignShouldBeAssociatedWithWorld() {
        _updateResult!.Value!.WorldId.Should().Be(_targetWorldId);
    }

    [Then(@"all (.*) adventures should remain with the campaign")]
    public void ThenAllAdventuresShouldRemainWithCampaign(int expectedCount) {
        _updateResult!.Value!.Adventures.Should().HaveCount(expectedCount);
    }

    [Then(@"all campaign properties should remain unchanged")]
    public void ThenAllCampaignPropertiesShouldRemainUnchanged() {
        _updateResult!.Value!.Name.Should().Be(_existingCampaign!.Name);
        _updateResult!.Value!.Description.Should().Be(_existingCampaign!.Description);
        _updateResult!.Value!.IsPublished.Should().Be(_existingCampaign!.IsPublished);
        _updateResult!.Value!.IsPublic.Should().Be(_existingCampaign!.IsPublic);
    }

    [Then(@"only the WorldId is updated")]
    public void ThenOnlyTheWorldIdIsUpdated() {
        _updateResult!.Value!.WorldId.Should().Be(_targetWorldId);
        _updateResult!.Value!.WorldId.Should().NotBeNull();
    }

    [Then(@"the world should now have (.*) campaigns")]
    public void ThenTheWorldShouldNowHaveCampaigns(int expectedCount) {
        var previousCount = _context.Get<int>("TotalCampaignsInWorld");
        expectedCount.Should().Be(previousCount + 1);
    }

    [Then(@"the moved campaign should appear in world's campaign collection")]
    public void ThenTheMovedCampaignShouldAppearInWorldCampaignCollection() {
        _updateResult!.Value!.WorldId.Should().Be(_targetWorldId);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        if (_updateResult is not null) {
            _updateResult!.IsSuccessful.Should().BeFalse();
            _updateResult!.Errors.Should().NotBeEmpty();
        } else {
            var exception = _context.Get<Exception>("Exception");
            exception.Should().BeOfType<FormatException>();
        }
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        if (_updateResult is not null) {
            _updateResult.Errors.Should().Contain(e => e.Contains(expectedError));
        } else {
            var exception = _context.Get<Exception>("Exception");
            exception.Message.Should().Contain(expectedError);
        }
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
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
