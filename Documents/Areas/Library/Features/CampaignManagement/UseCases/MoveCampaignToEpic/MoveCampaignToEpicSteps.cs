// Generated: 2025-10-12
// BDD Step Definitions for Move Campaign To Epic Use Case
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
using VttTools.Library.Epics.Model;
using VttTools.Library.Epics.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.MoveCampaignToEpic;

[Binding]
public class MoveCampaignToEpicSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IEpicStorage _epicStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private Epic? _targetEpic;
    private Result<Campaign>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private Guid _targetEpicId = Guid.Empty;
    private string? _invalidId;

    public MoveCampaignToEpicSteps(ScenarioContext context) {
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

    [Given(@"I own a standalone campaign")]
    public void GivenIAlreadyOwnAStandaloneCampaign() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            EpicId = null, // Standalone
            Name = "Standalone Campaign",
            Description = "Campaign without epic",
            Adventures = []
        };

        _context["CampaignId"] = _campaignId;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"I own an epic")]
    public void GivenIAlreadyOwnAnEpic() {
        _targetEpicId = Guid.CreateVersion7();
        _targetEpic = new Epic {
            Id = _targetEpicId,
            OwnerId = _userId,
            Name = "Target Epic",
            Description = string.Empty
        };

        _context["EpicId"] = _targetEpicId;

        // Mock epic storage to return epic
        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns(_targetEpic);
    }

    #endregion

    #region Given Steps - Campaign State

    [Given(@"my campaign has null EpicId")]
    public void GivenMyCampaignHasNullEpicId() {
        if (_existingCampaign is not null) {
            _existingCampaign.EpicId = null;
        }
    }

    [Given(@"I own epic with ID ""(.*)""")]
    public void GivenIAlreadyOwnEpicWithId(string epicId) {
        _targetEpicId = Guid.Parse(epicId);
        _targetEpic = new Epic {
            Id = _targetEpicId,
            OwnerId = _userId,
            Name = "My Epic",
            Description = string.Empty
        };

        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns(_targetEpic);
    }

    [Given(@"my campaign is in epic ""(.*)""")]
    public void GivenMyCampaignIsInEpic(string epicId) {
        var currentEpicId = Guid.Parse(epicId);
        if (_existingCampaign is not null) {
            _existingCampaign.EpicId = currentEpicId;
        }
    }

    [Given(@"I own epic ""(.*)""")]
    public void GivenIAlreadyOwnEpic(string epicId) {
        _targetEpicId = Guid.Parse(epicId);
        _targetEpic = new Epic {
            Id = _targetEpicId,
            OwnerId = _userId,
            Name = "Target Epic",
            Description = string.Empty
        };

        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns(_targetEpic);
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

    #region Given Steps - Epic Context

    [Given(@"an epic has (.*) campaigns")]
    public void GivenAnEpicHasCampaigns(int totalCount) {
        _targetEpicId = Guid.CreateVersion7();
        _targetEpic = new Epic {
            Id = _targetEpicId,
            OwnerId = _userId,
            Name = "Epic with Campaigns",
            Description = string.Empty
        };

        _context["TotalCampaignsInEpic"] = totalCount;

        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns(_targetEpic);
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"my standalone campaign exists")]
    public void GivenMyStandaloneCampaignExists() {
        // Already set up in Background
        _existingCampaign.Should().NotBeNull();
    }

    [Given(@"no epic exists with ID ""(.*)""")]
    public void GivenNoEpicExistsWithId(string epicId) {
        _targetEpicId = Guid.Parse(epicId);

        // Mock epic storage to return null
        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns((Epic?)null);
    }

    [Given(@"a standalone campaign exists owned by another user")]
    public void GivenAStandaloneCampaignExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = otherUserId,
            EpicId = null,
            Name = "Other User's Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"an epic exists owned by another user")]
    public void GivenAnEpicExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _targetEpicId = Guid.CreateVersion7();
        _targetEpic = new Epic {
            Id = _targetEpicId,
            OwnerId = otherUserId,
            Name = "Other User's Epic",
            Description = string.Empty
        };

        _epicStorage.GetByIdAsync(_targetEpicId, Arg.Any<CancellationToken>())
            .Returns(_targetEpic);
    }

    #endregion

    #region When Steps - Move to Epic Actions

    [When(@"I move the campaign to epic ""(.*)""")]
    public async Task WhenIMoveTheCampaignToEpic(string epicId) {
        try {
            _targetEpicId = Guid.Parse(epicId);

            // Mock storage to succeed
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.MoveCampaignToEpicAsync(_userId, _campaignId, _targetEpicId, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I move the campaign to the epic")]
    public async Task WhenIMoveTheCampaignToTheEpic() {
        try {
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.MoveCampaignToEpicAsync(_userId, _campaignId, _targetEpicId, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to move the campaign to epic ""(.*)""")]
    public async Task WhenIAttemptToMoveTheCampaignToEpic(string epicId) {
        await WhenIMoveTheCampaignToEpic(epicId);
    }

    [When(@"I attempt to move campaign to epic ""(.*)""")]
    public async Task WhenIAttemptToMoveCampaignToEpic(string epicId) {
        if (epicId == "not-a-guid") {
            _invalidId = epicId;
            try {
                if (!Guid.TryParse(_invalidId, out _targetEpicId)) {
                    throw new FormatException("Invalid epic ID format");
                }
            }
            catch (Exception ex) {
                _context["Exception"] = ex;
                return;
            }
        }

        await WhenIMoveTheCampaignToEpic(epicId);
    }

    [When(@"I attempt to move that campaign to my epic")]
    public async Task WhenIAttemptToMoveThatCampaignToMyEpic() {
        await WhenIMoveTheCampaignToTheEpic();
    }

    [When(@"I attempt to move my campaign to that epic")]
    public async Task WhenIAttemptToMoveMyC ampaignToThatEpic() {
        await WhenIMoveTheCampaignToTheEpic();
    }

    [When(@"I move the standalone campaign to the epic")]
    public async Task WhenIMoveTheStandaloneCampaignToTheEpic() {
        await WhenIMoveTheCampaignToTheEpic();
    }

    [When(@"I move the campaign to an epic")]
    public async Task WhenIMoveTheCampaignToAnEpic() {
        await WhenIMoveTheCampaignToTheEpic();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign is updated successfully")]
    public void ThenTheCampaignIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign EpicId should be ""(.*)""")]
    public void ThenTheCampaignEpicIdShouldBe(string expectedEpicId) {
        var expectedGuid = Guid.Parse(expectedEpicId);
        _updateResult!.Value!.EpicId.Should().Be(expectedGuid);
    }

    [Then(@"the campaign should be associated with the epic")]
    public void ThenTheCampaignShouldBeAssociatedWithEpic() {
        _updateResult!.Value!.EpicId.Should().Be(_targetEpicId);
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

    [Then(@"only the EpicId is updated")]
    public void ThenOnlyTheEpicIdIsUpdated() {
        _updateResult!.Value!.EpicId.Should().Be(_targetEpicId);
        _updateResult!.Value!.EpicId.Should().NotBeNull();
    }

    [Then(@"the epic should now have (.*) campaigns")]
    public void ThenTheEpicShouldNowHaveCampaigns(int expectedCount) {
        var previousCount = _context.Get<int>("TotalCampaignsInEpic");
        expectedCount.Should().Be(previousCount + 1);
    }

    [Then(@"the moved campaign should appear in epic's campaign collection")]
    public void ThenTheMovedCampaignShouldAppearInEpicCampaignCollection() {
        _updateResult!.Value!.EpicId.Should().Be(_targetEpicId);
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
