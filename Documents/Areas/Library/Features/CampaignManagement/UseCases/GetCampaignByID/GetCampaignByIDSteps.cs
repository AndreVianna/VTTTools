// Generated: 2025-10-12
// BDD Step Definitions for Get Campaign By ID Use Case
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
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.GetCampaignByID;

[Binding]
public class GetCampaignByIDSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private Result<Campaign>? _getResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;
    private string? _invalidId;

    public GetCampaignByIDSteps(ScenarioContext context) {
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

    #endregion

    #region Given Steps - Campaign Setup

    [Given(@"a campaign exists with ID ""(.*)""")]
    public void GivenACampaignExistsWithId(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign",
            Description = "Test Description",
            Adventures = []
        };

        _context["CampaignId"] = _campaignId;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"the campaign has name ""(.*)""")]
    public void GivenTheCampaignHasName(string name) {
        if (_existingCampaign is not null) {
            _existingCampaign.Name = name;
        }
    }

    [Given(@"a campaign exists with (.*) associated adventures")]
    public void GivenACampaignExistsWithAssociatedAdventures(int count) {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign",
            Description = string.Empty,
            Adventures = []
        };

        for (int i = 0; i < count; i++) {
            _existingCampaign.Adventures.Add(new Adventure {
                Id = Guid.CreateVersion7(),
                CampaignId = _campaignId,
                Name = $"Adventure {i + 1}",
                Description = string.Empty
            });
        }

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"a campaign exists within an epic")]
    public void GivenACampaignExistsWithinEpic() {
        _campaignId = Guid.CreateVersion7();
        var epicId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            EpicId = epicId,
            Name = "Epic Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"a standalone campaign exists")]
    public void GivenAStandaloneCampaignExists() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            EpicId = null,
            Name = "Standalone Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"a campaign exists with no associated adventures")]
    public void GivenACampaignExistsWithNoAdventures() {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Empty Campaign",
            Description = string.Empty,
            Adventures = []
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"a campaign exists with IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenACampaignExistsWithPublicationStatus(bool isPublished, bool isPublic) {
        _campaignId = Guid.CreateVersion7();
        _existingCampaign = new Campaign {
            Id = _campaignId,
            OwnerId = _userId,
            Name = "Test Campaign",
            Description = string.Empty,
            IsPublished = isPublished,
            IsPublic = isPublic
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [Given(@"I am authenticated as (.*)")]
    public void GivenIAmAuthenticatedAsRole(string role) {
        _userId = Guid.CreateVersion7();
        _context["UserRole"] = role;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no campaign exists with ID ""(.*)""")]
    public void GivenNoCampaignExistsWithId(string campaignId) {
        _campaignId = Guid.Parse(campaignId);

        // Mock storage to return null for non-existent campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);
    }

    [Given(@"I provide invalid ID format ""(.*)""")]
    public void GivenIProvideInvalidIdFormat(string invalidId) {
        _invalidId = invalidId;
    }

    #endregion

    #region When Steps - Get Actions

    [When(@"I request the campaign by ID ""(.*)""")]
    public async Task WhenIRequestTheCampaignById(string campaignId) {
        try {
            _campaignId = Guid.Parse(campaignId);
            _getResult = await _service.GetCampaignByIdAsync(_userId, _campaignId, CancellationToken.None);
            _context["GetResult"] = _getResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I request the campaign by its ID")]
    public async Task WhenIRequestTheCampaignByItsId() {
        try {
            _getResult = await _service.GetCampaignByIdAsync(_userId, _campaignId, CancellationToken.None);
            _context["GetResult"] = _getResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to request the campaign")]
    public async Task WhenIAttemptToRequestTheCampaign() {
        try {
            // Try to parse invalid ID
            if (!Guid.TryParse(_invalidId, out _campaignId)) {
                throw new FormatException("Invalid campaign ID format");
            }

            _getResult = await _service.GetCampaignByIdAsync(_userId, _campaignId, CancellationToken.None);
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive the campaign details")]
    public void ThenIShouldReceiveTheCampaignDetails() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeTrue();
        _getResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign name should be ""(.*)""")]
    public void ThenTheCampaignNameShouldBe(string expectedName) {
        _getResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"I should see all (.*) adventures in the collection")]
    public void ThenIShouldSeeAllAdventuresInCollection(int expectedCount) {
        _getResult!.Value!.Adventures.Should().HaveCount(expectedCount);
    }

    [Then(@"the epic ID should be included")]
    public void ThenTheEpicIdShouldBeIncluded() {
        _getResult!.Value!.EpicId.Should().NotBeNull();
    }

    [Then(@"the EpicId should be null")]
    public void ThenTheEpicIdShouldBeNull() {
        _getResult!.Value!.EpicId.Should().BeNull();
    }

    [Then(@"the adventures collection should be empty")]
    public void ThenTheAdventuresCollectionShouldBeEmpty() {
        _getResult!.Value!.Adventures.Should().BeEmpty();
    }

    [Then(@"the result should be success")]
    [Then(@"the result should be (.*)")]
    public void ThenTheResultShouldBe(string expectedResult) {
        if (expectedResult == "success") {
            _getResult!.IsSuccessful.Should().BeTrue();
        } else if (expectedResult == "failure") {
            _getResult!.IsSuccessful.Should().BeFalse();
        }
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeFalse();
        _getResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        if (_getResult is not null) {
            _getResult.Errors.Should().Contain(e => e.Contains(expectedError));
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
}
