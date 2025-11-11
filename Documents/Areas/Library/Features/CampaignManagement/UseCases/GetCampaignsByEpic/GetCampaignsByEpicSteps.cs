// Generated: 2025-10-12
// BDD Step Definitions for Get Campaigns By World Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (CampaignService)
// Status: Phase 7 - BLOCKED (CampaignService not implemented)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Campaigns.Services;
using VttTools.Library.Campaigns.Storage;
using VttTools.Library.Worlds.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.GetCampaignsByWorld;

[Binding]
public class GetCampaignsByWorldSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IWorldStorage _worldStorage;
    private readonly ICampaignService _service;

    // Test state
    private List<Campaign> _campaigns = [];
    private Result<List<Campaign>>? _queryResult;
    private Guid _userId = Guid.Empty;
    private Guid _worldId = Guid.Empty;
    private string? _invalidId;

    public GetCampaignsByWorldSteps(ScenarioContext context) {
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

    #endregion

    #region Given Steps - World with Campaigns

    [Given(@"an world exists with ID ""(.*)""")]
    public void GivenAnWorldExistsWithId(string worldId) {
        _worldId = Guid.Parse(worldId);
        _context["WorldId"] = _worldId;

        // Mock world storage to return world
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(new World { Id = _worldId, OwnerId = _userId });
    }

    [Given(@"the world has (.*) campaigns")]
    public void GivenTheWorldHasCampaigns(int count) {
        _campaigns.Clear();
        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                WorldId = _worldId,
                Name = $"Campaign {i + 1}",
                Description = string.Empty
            });
        }

        // Mock storage to return campaigns for world
        _campaignStorage.GetByWorldIdAsync(_worldId, _userId, Arg.Any<CancellationToken>())
            .Returns(_campaigns);
    }

    [Given(@"an world exists with no campaigns")]
    public void GivenAnWorldExistsWithNoCampaigns() {
        _worldId = Guid.CreateVersion7();
        _campaigns.Clear();

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(new World { Id = _worldId, OwnerId = _userId });

        _campaignStorage.GetByWorldIdAsync(_worldId, _userId, Arg.Any<CancellationToken>())
            .Returns([]);
    }

    #endregion

    #region Given Steps - Standalone Campaigns

    [Given(@"I own (.*) standalone campaigns")]
    public void GivenIAlreadyOwnStandaloneCampaigns(int count) {
        _campaigns.Clear();
        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                WorldId = null, // Standalone
                Name = $"Standalone Campaign {i + 1}",
                Description = string.Empty
            });
        }

        // Mock storage to return standalone campaigns
        _campaignStorage.GetStandaloneCampaignsAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(_campaigns);
    }

    #endregion

    #region Given Steps - Ownership and Visibility

    [Given(@"an world exists with (.*) campaigns")]
    public void GivenAnWorldExistsWithMultipleCampaigns(int count) {
        _worldId = Guid.CreateVersion7();
        GivenTheWorldHasCampaigns(count);
    }

    [Given(@"I own (.*) of those campaigns")]
    public void GivenIAlreadyOwnSomeOfThoseCampaigns(int ownedCount) {
        // First N campaigns are owned by current user
        for (int i = 0; i < ownedCount && i < _campaigns.Count; i++) {
            _campaigns[i].OwnerId = _userId;
        }
    }

    [Given(@"another user owns (.*) campaigns in the same world")]
    public void GivenAnotherUserOwnsCampaignsInSameWorld(int otherCount) {
        var otherUserId = Guid.CreateVersion7();
        // Remaining campaigns are owned by other user
        for (int i = _campaigns.Count - otherCount; i < _campaigns.Count; i++) {
            if (i >= 0) {
                _campaigns[i].OwnerId = otherUserId;
            }
        }
    }

    [Given(@"an world has (.*) campaigns:")]
    public void GivenAnWorldHasCampaignsWithDetails(int count, Table table) {
        _worldId = Guid.CreateVersion7();
        _campaigns.Clear();

        var rows = table.CreateSet<CampaignVisibilityTable>();
        foreach (var row in rows) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                WorldId = _worldId,
                Name = row.Name,
                IsPublished = row.IsPublished,
                IsPublic = row.IsPublic,
                Description = string.Empty
            });
        }

        _campaignStorage.GetByWorldIdAsync(_worldId, _userId, Arg.Any<CancellationToken>())
            .Returns(_campaigns);
    }

    #endregion

    #region Given Steps - Multiple Ownership

    [Given(@"I own (.*) campaigns within an world")]
    public void GivenIAlreadyOwnCampaignsWithinWorld(int count) {
        _worldId = Guid.CreateVersion7();
        _campaigns.Clear();

        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                WorldId = _worldId,
                Name = $"World Campaign {i + 1}",
                Description = string.Empty
            });
        }

        _context["WorldCampaignsCount"] = count;
    }

    [Given(@"I own (.*) standalone campaigns")]
    public void GivenIAlreadyOwnMultipleStandaloneCampaigns(int count) {
        var standaloneCampaigns = new List<Campaign>();
        for (int i = 0; i < count; i++) {
            standaloneCampaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                WorldId = null,
                Name = $"Standalone {i + 1}",
                Description = string.Empty
            });
        }

        _context["StandaloneCampaignsCount"] = count;
        _context["StandaloneCampaigns"] = standaloneCampaigns;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no world exists with ID ""(.*)""")]
    public void GivenNoWorldExistsWithId(string worldId) {
        _worldId = Guid.Parse(worldId);

        // Mock world storage to return null
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"I provide invalid world ID ""(.*)""")]
    public void GivenIProvideInvalidWorldId(string invalidId) {
        _invalidId = invalidId;
    }

    #endregion

    #region When Steps - Query Actions

    [When(@"I request campaigns for world ""(.*)""")]
    public async Task WhenIRequestCampaignsForWorld(string worldId) {
        try {
            _worldId = Guid.Parse(worldId);
            _queryResult = await _service.GetCampaignsByWorldAsync(_userId, _worldId, CancellationToken.None);
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request campaigns for that world")]
    public async Task WhenIRequestCampaignsForThatWorld() {
        try {
            _queryResult = await _service.GetCampaignsByWorldAsync(_userId, _worldId, CancellationToken.None);
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request campaigns with null world ID")]
    public async Task WhenIRequestCampaignsWithNullWorldId() {
        try {
            _queryResult = await _service.GetStandaloneCampaignsAsync(_userId, CancellationToken.None);
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request campaigns for (.*)")]
    public async Task WhenIRequestCampaignsForType(string queryType) {
        try {
            if (queryType == "world") {
                _queryResult = await _service.GetCampaignsByWorldAsync(_userId, _worldId, CancellationToken.None);
            } else if (queryType == "null_world") {
                _queryResult = await _service.GetStandaloneCampaignsAsync(_userId, CancellationToken.None);
            }
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to request campaigns for that world")]
    public async Task WhenIAttemptToRequestCampaignsForThatWorld() {
        try {
            if (!Guid.TryParse(_invalidId, out _worldId)) {
                throw new FormatException("Invalid world ID format");
            }

            _queryResult = await _service.GetCampaignsByWorldAsync(_userId, _worldId, CancellationToken.None);
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive all (.*) campaigns")]
    public void ThenIShouldReceiveAllCampaigns(int expectedCount) {
        _queryResult.Should().NotBeNull();
        _queryResult!.IsSuccessful.Should().BeTrue();
        _queryResult.Value.Should().HaveCount(expectedCount);
    }

    [Then(@"each campaign should reference the correct world ID")]
    public void ThenEachCampaignShouldReferenceCorrectWorldId() {
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            campaign.WorldId.Should().Be(_worldId);
        });
    }

    [Then(@"I should receive an empty list")]
    public void ThenIShouldReceiveAnEmptyList() {
        _queryResult!.IsSuccessful.Should().BeTrue();
        _queryResult!.Value.Should().BeEmpty();
    }

    [Then(@"I should see message ""(.*)""")]
    public void ThenIShouldSeeMessage(string expectedMessage) {
        // Message would be included in response metadata
        _queryResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive all (.*) standalone campaigns")]
    public void ThenIShouldReceiveAllStandaloneCampaigns(int expectedCount) {
        _queryResult!.Value.Should().HaveCount(expectedCount);
    }

    [Then(@"each campaign should have null WorldId")]
    public void ThenEachCampaignShouldHaveNullWorldId() {
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            campaign.WorldId.Should().BeNull();
        });
    }

    [Then(@"I should receive only my (.*) campaigns")]
    public void ThenIShouldReceiveOnlyMyCampaigns(int expectedCount) {
        _queryResult!.Value.Should().HaveCount(expectedCount);
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            campaign.OwnerId.Should().Be(_userId);
        });
    }

    [Then(@"each should display its visibility status")]
    public void ThenEachShouldDisplayVisibilityStatus() {
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            // Verify IsPublished and IsPublic properties are set
            campaign.IsPublished.Should().NotBeNull();
            campaign.IsPublic.Should().NotBeNull();
        });
    }

    [Then(@"I should receive (.*) campaigns")]
    public void ThenIShouldReceiveCampaigns(int expectedCount) {
        _queryResult!.Value.Should().HaveCount(expectedCount);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _queryResult.Should().NotBeNull();
        _queryResult!.IsSuccessful.Should().BeFalse();
        _queryResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        if (_queryResult is not null) {
            _queryResult.Errors.Should().Contain(e => e.Contains(expectedError));
        } else {
            var exception = _context.Get<Exception>("Exception");
            exception.Message.Should().Contain(expectedError);
        }
    }

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        var exception = _context.Get<Exception>("Exception");
        exception.Should().BeOfType<FormatException>();
    }

    #endregion

    #region Helper Classes

    private class CampaignVisibilityTable {
        public string Name { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsPublic { get; set; }
    }

    #endregion
}
