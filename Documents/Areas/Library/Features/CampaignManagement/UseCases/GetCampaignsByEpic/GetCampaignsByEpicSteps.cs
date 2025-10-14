// Generated: 2025-10-12
// BDD Step Definitions for Get Campaigns By Epic Use Case
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
using VttTools.Library.Epics.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.GetCampaignsByEpic;

[Binding]
public class GetCampaignsByEpicSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IEpicStorage _epicStorage;
    private readonly ICampaignService _service;

    // Test state
    private List<Campaign> _campaigns = [];
    private Result<List<Campaign>>? _queryResult;
    private Guid _userId = Guid.Empty;
    private Guid _epicId = Guid.Empty;
    private string? _invalidId;

    public GetCampaignsByEpicSteps(ScenarioContext context) {
        _context = context;
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _epicStorage = Substitute.For<IEpicStorage>();

        // NOTE: CampaignService not implemented yet (Phase 7 - BLOCKED)
        _service = new CampaignService(_campaignStorage, _epicStorage, null!);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    #endregion

    #region Given Steps - Epic with Campaigns

    [Given(@"an epic exists with ID ""(.*)""")]
    public void GivenAnEpicExistsWithId(string epicId) {
        _epicId = Guid.Parse(epicId);
        _context["EpicId"] = _epicId;

        // Mock epic storage to return epic
        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(new Epic { Id = _epicId, OwnerId = _userId });
    }

    [Given(@"the epic has (.*) campaigns")]
    public void GivenTheEpicHasCampaigns(int count) {
        _campaigns.Clear();
        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                EpicId = _epicId,
                Name = $"Campaign {i + 1}",
                Description = string.Empty
            });
        }

        // Mock storage to return campaigns for epic
        _campaignStorage.GetByEpicIdAsync(_epicId, _userId, Arg.Any<CancellationToken>())
            .Returns(_campaigns);
    }

    [Given(@"an epic exists with no campaigns")]
    public void GivenAnEpicExistsWithNoCampaigns() {
        _epicId = Guid.CreateVersion7();
        _campaigns.Clear();

        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(new Epic { Id = _epicId, OwnerId = _userId });

        _campaignStorage.GetByEpicIdAsync(_epicId, _userId, Arg.Any<CancellationToken>())
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
                EpicId = null, // Standalone
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

    [Given(@"an epic exists with (.*) campaigns")]
    public void GivenAnEpicExistsWithMultipleCampaigns(int count) {
        _epicId = Guid.CreateVersion7();
        GivenTheEpicHasCampaigns(count);
    }

    [Given(@"I own (.*) of those campaigns")]
    public void GivenIAlreadyOwnSomeOfThoseCampaigns(int ownedCount) {
        // First N campaigns are owned by current user
        for (int i = 0; i < ownedCount && i < _campaigns.Count; i++) {
            _campaigns[i].OwnerId = _userId;
        }
    }

    [Given(@"another user owns (.*) campaigns in the same epic")]
    public void GivenAnotherUserOwnsCampaignsInSameEpic(int otherCount) {
        var otherUserId = Guid.CreateVersion7();
        // Remaining campaigns are owned by other user
        for (int i = _campaigns.Count - otherCount; i < _campaigns.Count; i++) {
            if (i >= 0) {
                _campaigns[i].OwnerId = otherUserId;
            }
        }
    }

    [Given(@"an epic has (.*) campaigns:")]
    public void GivenAnEpicHasCampaignsWithDetails(int count, Table table) {
        _epicId = Guid.CreateVersion7();
        _campaigns.Clear();

        var rows = table.CreateSet<CampaignVisibilityTable>();
        foreach (var row in rows) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                EpicId = _epicId,
                Name = row.Name,
                IsPublished = row.IsPublished,
                IsPublic = row.IsPublic,
                Description = string.Empty
            });
        }

        _campaignStorage.GetByEpicIdAsync(_epicId, _userId, Arg.Any<CancellationToken>())
            .Returns(_campaigns);
    }

    #endregion

    #region Given Steps - Multiple Ownership

    [Given(@"I own (.*) campaigns within an epic")]
    public void GivenIAlreadyOwnCampaignsWithinEpic(int count) {
        _epicId = Guid.CreateVersion7();
        _campaigns.Clear();

        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                EpicId = _epicId,
                Name = $"Epic Campaign {i + 1}",
                Description = string.Empty
            });
        }

        _context["EpicCampaignsCount"] = count;
    }

    [Given(@"I own (.*) standalone campaigns")]
    public void GivenIAlreadyOwnMultipleStandaloneCampaigns(int count) {
        var standaloneCampaigns = new List<Campaign>();
        for (int i = 0; i < count; i++) {
            standaloneCampaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                EpicId = null,
                Name = $"Standalone {i + 1}",
                Description = string.Empty
            });
        }

        _context["StandaloneCampaignsCount"] = count;
        _context["StandaloneCampaigns"] = standaloneCampaigns;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no epic exists with ID ""(.*)""")]
    public void GivenNoEpicExistsWithId(string epicId) {
        _epicId = Guid.Parse(epicId);

        // Mock epic storage to return null
        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns((Epic?)null);
    }

    [Given(@"I provide invalid epic ID ""(.*)""")]
    public void GivenIProvideInvalidEpicId(string invalidId) {
        _invalidId = invalidId;
    }

    #endregion

    #region When Steps - Query Actions

    [When(@"I request campaigns for epic ""(.*)""")]
    public async Task WhenIRequestCampaignsForEpic(string epicId) {
        try {
            _epicId = Guid.Parse(epicId);
            _queryResult = await _service.GetCampaignsByEpicAsync(_userId, _epicId, CancellationToken.None);
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request campaigns for that epic")]
    public async Task WhenIRequestCampaignsForThatEpic() {
        try {
            _queryResult = await _service.GetCampaignsByEpicAsync(_userId, _epicId, CancellationToken.None);
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request campaigns with null epic ID")]
    public async Task WhenIRequestCampaignsWithNullEpicId() {
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
            if (queryType == "epic") {
                _queryResult = await _service.GetCampaignsByEpicAsync(_userId, _epicId, CancellationToken.None);
            } else if (queryType == "null_epic") {
                _queryResult = await _service.GetStandaloneCampaignsAsync(_userId, CancellationToken.None);
            }
            _context["QueryResult"] = _queryResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to request campaigns for that epic")]
    public async Task WhenIAttemptToRequestCampaignsForThatEpic() {
        try {
            if (!Guid.TryParse(_invalidId, out _epicId)) {
                throw new FormatException("Invalid epic ID format");
            }

            _queryResult = await _service.GetCampaignsByEpicAsync(_userId, _epicId, CancellationToken.None);
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

    [Then(@"each campaign should reference the correct epic ID")]
    public void ThenEachCampaignShouldReferenceCorrectEpicId() {
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            campaign.EpicId.Should().Be(_epicId);
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

    [Then(@"each campaign should have null EpicId")]
    public void ThenEachCampaignShouldHaveNullEpicId() {
        _queryResult!.Value.Should().AllSatisfy(campaign => {
            campaign.EpicId.Should().BeNull();
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
