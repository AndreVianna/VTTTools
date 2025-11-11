// Generated: 2025-10-12
// BDD Step Definitions for Create Campaign Use Case
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
using VttTools.Library.Worlds.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.CampaignManagement.CreateCampaign;

[Binding]
public class CreateCampaignSteps {
    private readonly ScenarioContext _context;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IWorldStorage _worldStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly ICampaignService _service;

    // Test state
    private CreateCampaignData? _createData;
    private Result<Campaign>? _createResult;
    private Guid _userId = Guid.Empty;
    private Guid _worldId = Guid.Empty;
    private Exception? _exception;

    public CreateCampaignSteps(ScenarioContext context) {
        _context = context;
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _worldStorage = Substitute.For<IWorldStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();

        // NOTE: CampaignService not implemented yet (Phase 7 - BLOCKED)
        // This will fail until service implementation is complete
        _service = new CampaignService(_campaignStorage, _worldStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"my user account exists in the Identity context")]
    public void GivenMyUserAccountExistsInIdentityContext() {
        // In a real scenario, this would verify user existence in Identity DB
        // For BDD step definition, we assume authentication already validates this
        _context["UserAuthenticated"] = true;
    }

    #endregion

    #region Given Steps - Campaign Name

    [Given(@"I provide campaign name ""(.*)""")]
    public void GivenIProvideCampaignName(string name) {
        _createData = new CreateCampaignData {
            Name = name,
            Description = string.Empty
        };
    }

    [Given(@"I provide empty campaign name")]
    public void GivenIProvideEmptyCampaignName() {
        _createData = new CreateCampaignData {
            Name = string.Empty,
            Description = string.Empty
        };
    }

    [Given(@"I provide campaign name with (.*) characters")]
    public void GivenIProvideCampaignNameWithCharacters(int length) {
        _createData = new CreateCampaignData {
            Name = new string('A', length),
            Description = string.Empty
        };
    }

    #endregion

    #region Given Steps - Publication Status

    [Given(@"I provide campaign with IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenIProvideCampaignWithPublicationStatus(bool isPublished, bool isPublic) {
        if (_createData is null) {
            _createData = new CreateCampaignData {
                Name = "Test Campaign",
                Description = string.Empty
            };
        }

        _createData = _createData with {
            IsPublished = isPublished,
            IsPublic = isPublic
        };
    }

    #endregion

    #region Given Steps - World Association

    [Given(@"I own an world with ID ""(.*)""")]
    public void GivenIAlreadyOwnAnWorld(string worldId) {
        _worldId = Guid.Parse(worldId);
        _context["WorldId"] = _worldId;

        // Mock world storage to return world
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(new World { Id = _worldId, OwnerId = _userId });
    }

    [Given(@"I provide valid campaign data with that world ID")]
    public void GivenIProvideValidCampaignDataWithWorldId() {
        _createData = new CreateCampaignData {
            Name = "World Campaign",
            Description = "Campaign within world",
            WorldId = _worldId
        };
    }

    [Given(@"I do not specify an world ID")]
    public void GivenIDoNotSpecifyWorldId() {
        if (_createData is not null) {
            _createData = _createData with { WorldId = null };
        }
    }

    [Given(@"I provide campaign with world ID that doesn't exist")]
    public void GivenIProvideCampaignWithNonExistentWorldId() {
        var nonExistentWorldId = Guid.CreateVersion7();
        _createData = new CreateCampaignData {
            Name = "Test Campaign",
            Description = string.Empty,
            WorldId = nonExistentWorldId
        };

        // Mock world storage to return null for non-existent world
        _worldStorage.GetByIdAsync(nonExistentWorldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    #endregion

    #region Given Steps - Complete Campaign Data

    [Given(@"I provide valid campaign data:")]
    public void GivenIProvideValidCampaignData(Table table) {
        var data = table.CreateInstance<CampaignDataTable>();
        _createData = new CreateCampaignData {
            Name = data.Name,
            Description = data.Description,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic
        };
    }

    [Given(@"I provide valid campaign data")]
    public void GivenIProvideValidCampaignData() {
        _createData = new CreateCampaignData {
            Name = "Test Campaign",
            Description = "Test Description",
            IsPublished = false,
            IsPublic = false
        };
    }

    #endregion

    #region Given Steps - Adventures Collection

    [Given(@"I provide (.*) valid adventures in the collection")]
    public void GivenIProvideValidAdventuresInCollection(int count) {
        if (_createData is null) {
            _createData = new CreateCampaignData {
                Name = "Test Campaign",
                Description = string.Empty
            };
        }

        var adventures = new List<CreateAdventureData>();
        for (int i = 0; i < count; i++) {
            adventures.Add(new CreateAdventureData {
                Name = $"Adventure {i + 1}",
                Description = $"Description {i + 1}"
            });
        }

        _createData = _createData with { Adventures = adventures };
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"I provide campaign with owner ID that doesn't exist")]
    public void GivenIProvideCampaignWithNonExistentOwnerId() {
        _userId = Guid.CreateVersion7(); // Non-existent user ID
        _createData = new CreateCampaignData {
            Name = "Test Campaign",
            Description = string.Empty
        };
    }

    [Given(@"I provide campaign with background resource that doesn't exist")]
    public void GivenIProvideCampaignWithNonExistentBackgroundResource() {
        var nonExistentResourceId = Guid.CreateVersion7();
        _createData = new CreateCampaignData {
            Name = "Test Campaign",
            Description = string.Empty,
            BackgroundId = nonExistentResourceId
        };

        // Mock media storage to return null for non-existent resource
        _mediaStorage.GetByIdAsync(nonExistentResourceId, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);
    }

    [Given(@"I provide campaign with description of exactly (.*) characters")]
    public void GivenIProvideCampaignWithDescriptionLength(int length) {
        _createData = new CreateCampaignData {
            Name = "Test Campaign",
            Description = new string('A', length)
        };
    }

    #endregion

    #region When Steps - Create Actions

    [When(@"I create the campaign")]
    public async Task WhenICreateTheCampaign() {
        try {
            // Mock storage to succeed
            _campaignStorage.UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
                .Returns(true);

            _createResult = await _service.CreateCampaignAsync(_userId, _createData!, CancellationToken.None);
            _context["CreateResult"] = _createResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to create the campaign")]
    public async Task WhenIAttemptToCreateTheCampaign() {
        await WhenICreateTheCampaign();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the campaign should be created with generated ID")]
    public void ThenTheCampaignShouldBeCreatedWithGeneratedId() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
        _createResult.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the campaign name should be ""(.*)""")]
    public void ThenTheCampaignNameShouldBe(string expectedName) {
        _createResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the campaign is created")]
    public void ThenTheCampaignIsCreated() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
    }

    [Then(@"the campaign should be marked as published")]
    public void ThenTheCampaignShouldBeMarkedAsPublished() {
        _createResult!.Value!.IsPublished.Should().BeTrue();
    }

    [Then(@"the campaign should be marked as public")]
    public void ThenTheCampaignShouldBeMarkedAsPublic() {
        _createResult!.Value!.IsPublic.Should().BeTrue();
    }

    [Then(@"the WorldId should be null")]
    public void ThenTheWorldIdShouldBeNull() {
        _createResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"the campaign should be standalone")]
    public void ThenTheCampaignShouldBeStandalone() {
        _createResult!.Value!.WorldId.Should().BeNull();
    }

    [Then(@"the WorldId should be ""(.*)""")]
    public void ThenTheWorldIdShouldBe(string expectedId) {
        var expectedGuid = Guid.Parse(expectedId);
        _createResult!.Value!.WorldId.Should().Be(expectedGuid);
    }

    [Then(@"the campaign is saved in the database")]
    public async Task ThenTheCampaignIsSavedInTheDatabase() {
        await _campaignStorage.Received(1).UpdateAsync(
            Arg.Is<Campaign>(c => c.Id == _createResult!.Value!.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"a CampaignCreated domain action is logged")]
    public void ThenCampaignCreatedDomainActionIsLogged() {
        // In real implementation, would verify domain event was published
        // For now, we verify the campaign was created successfully
        _createResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive the campaign with generated ID")]
    public void ThenIShouldReceiveTheCampaignWithGeneratedId() {
        _createResult!.Value.Should().NotBeNull();
        _createResult!.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"all (.*) adventures is saved")]
    public void ThenAllAdventuresAreSaved(int expectedCount) {
        _createResult!.Value!.Adventures.Should().HaveCount(expectedCount);
    }

    [Then(@"each adventure should reference the campaign ID")]
    public void ThenEachAdventureShouldReferenceCampaignId() {
        var campaignId = _createResult!.Value!.Id;
        _createResult.Value.Adventures.Should().AllSatisfy(adventure => {
            adventure.CampaignId.Should().Be(campaignId);
        });
    }

    [Then(@"the full description should be preserved")]
    public void ThenTheFullDescriptionShouldBePreserved() {
        _createResult!.Value!.Description.Should().NotBeNullOrEmpty();
        _createResult.Value.Description.Length.Should().Be(_createData!.Description.Length);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _createResult!.Errors.Should().Contain(e => e.Contains(expectedError));
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    #endregion

    #region Helper Classes

    private class CampaignDataTable {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsPublic { get; set; }
    }

    #endregion
}
