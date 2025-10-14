// Generated: 2025-10-12
// BDD Step Definitions for Update Campaign Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (CampaignService)
// Status: Phase 7 - BLOCKED (CampaignService not implemented)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Campaigns.ServiceContracts;
using VttTools.Library.Campaigns.Services;
using VttTools.Library.Campaigns.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.UpdateCampaign;

[Binding]
public class UpdateCampaignSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly ICampaignService _service;

    // Test state
    private Campaign? _existingCampaign;
    private UpdateCampaignData? _updateData;
    private Result<Campaign>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _campaignId = Guid.Empty;

    public UpdateCampaignSteps(ScenarioContext context) {
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
            Name = "Original Campaign",
            Description = "Original Description",
            IsPublished = false,
            IsPublic = false
        };

        _context["CampaignId"] = _campaignId;
        _context["ExistingCampaign"] = _existingCampaign;

        // Mock storage to return existing campaign
        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    #endregion

    #region Given Steps - Existing Campaign State

    [Given(@"my campaign has name ""(.*)""")]
    public void GivenMyCampaignHasName(string name) {
        if (_existingCampaign is not null) {
            _existingCampaign.Name = name;
        }
    }

    [Given(@"my campaign has description ""(.*)""")]
    public void GivenMyCampaignHasDescription(string description) {
        if (_existingCampaign is not null) {
            _existingCampaign.Description = description;
        }
    }

    [Given(@"my campaign has IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenMyCampaignHasPublicationStatus(bool isPublished, bool isPublic) {
        if (_existingCampaign is not null) {
            _existingCampaign.IsPublished = isPublished;
            _existingCampaign.IsPublic = isPublic;
        }
    }

    [Given(@"my campaign exists")]
    public void GivenMyCampaignExists() {
        // Campaign already set up in Background
        _existingCampaign.Should().NotBeNull();
    }

    #endregion

    #region Given Steps - Update Data

    [Given(@"I update the campaign name to ""(.*)""")]
    [When(@"I update the campaign name to ""(.*)""")]
    public void WhenIUpdateTheCampaignNameTo(string newName) {
        _updateData = new UpdateCampaignData {
            Name = newName,
            Description = _existingCampaign?.Description ?? string.Empty,
            IsPublished = _existingCampaign?.IsPublished ?? false,
            IsPublic = _existingCampaign?.IsPublic ?? false
        };
    }

    [When(@"I update the description to ""(.*)""")]
    public void WhenIUpdateTheDescriptionTo(string newDescription) {
        _updateData = new UpdateCampaignData {
            Name = _existingCampaign?.Name ?? "Test Campaign",
            Description = newDescription,
            IsPublished = _existingCampaign?.IsPublished ?? false,
            IsPublic = _existingCampaign?.IsPublic ?? false
        };
    }

    [When(@"I update to IsPublished=(.*) and IsPublic=(.*)")]
    public void WhenIUpdateToPublicationStatus(bool isPublished, bool isPublic) {
        _updateData = new UpdateCampaignData {
            Name = _existingCampaign?.Name ?? "Test Campaign",
            Description = _existingCampaign?.Description ?? string.Empty,
            IsPublished = isPublished,
            IsPublic = isPublic
        };
    }

    [When(@"I attempt to update with empty name")]
    public void WhenIAttemptToUpdateWithEmptyName() {
        _updateData = new UpdateCampaignData {
            Name = string.Empty,
            Description = _existingCampaign?.Description ?? string.Empty,
            IsPublished = _existingCampaign?.IsPublished ?? false,
            IsPublic = _existingCampaign?.IsPublic ?? false
        };
    }

    [When(@"I update the campaign with:")]
    public void WhenIUpdateTheCampaignWith(Table table) {
        var data = table.CreateInstance<UpdateCampaignDataTable>();
        _updateData = new UpdateCampaignData {
            Name = data.Name,
            Description = data.Description,
            IsPublic = data.IsPublic,
            IsPublished = _existingCampaign?.IsPublished ?? false
        };
    }

    [When(@"I update with the same name ""(.*)""")]
    public void WhenIUpdateWithSameName(string name) {
        _updateData = new UpdateCampaignData {
            Name = name,
            Description = _existingCampaign?.Description ?? string.Empty,
            IsPublished = _existingCampaign?.IsPublished ?? false,
            IsPublic = _existingCampaign?.IsPublic ?? false
        };
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
            OwnerId = otherUserId, // Different owner
            Name = "Other User's Campaign",
            Description = string.Empty
        };

        _campaignStorage.GetByIdAsync(_campaignId, Arg.Any<CancellationToken>())
            .Returns(_existingCampaign);
    }

    [When(@"I attempt to update campaign ""(.*)""")]
    public async Task WhenIAttemptToUpdateCampaign(string campaignId) {
        _campaignId = Guid.Parse(campaignId);
        _updateData = new UpdateCampaignData {
            Name = "Updated Name",
            Description = string.Empty
        };

        await WhenIUpdateTheCampaign();
    }

    [When(@"I attempt to update that campaign")]
    public async Task WhenIAttemptToUpdateThatCampaign() {
        _updateData = new UpdateCampaignData {
            Name = "Updated Name",
            Description = string.Empty
        };

        await WhenIUpdateTheCampaign();
    }

    #endregion

    #region When Steps - Update Actions

    [When(@"I update the campaign")]
    public async Task WhenIUpdateTheCampaign() {
        try {
            // Mock storage to succeed
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _updateResult = await _service.UpdateCampaignAsync(_userId, _campaignId, _updateData!, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign is updated successfully")]
    public void ThenTheCampaignIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign name should be ""(.*)""")]
    public void ThenTheCampaignNameShouldBe(string expectedName) {
        _updateResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the description should be ""(.*)""")]
    public void ThenTheDescriptionShouldBe(string expectedDescription) {
        _updateResult!.Value!.Description.Should().Be(expectedDescription);
    }

    [Then(@"the campaign should be publicly visible")]
    public void ThenTheCampaignShouldBePubliclyVisible() {
        _updateResult!.Value!.IsPublished.Should().BeTrue();
        _updateResult!.Value!.IsPublic.Should().BeTrue();
    }

    [Then(@"all updated fields should reflect new values")]
    public void ThenAllUpdatedFieldsShouldReflectNewValues() {
        _updateResult!.Value.Should().NotBeNull();
        _updateResult!.Value!.Name.Should().Be(_updateData!.Name);
        _updateResult!.Value!.Description.Should().Be(_updateData!.Description);
        _updateResult!.Value!.IsPublic.Should().Be(_updateData!.IsPublic);
    }

    [Then(@"no actual changes is saved")]
    public void ThenNoActualChangesAreSaved() {
        // Campaign was updated but values are the same
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult!.Value!.Name.Should().Be(_existingCampaign!.Name);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _updateResult!.Errors.Should().Contain(e => e.Contains(expectedError));
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

    private class UpdateCampaignDataTable {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
    }

    #endregion
}
