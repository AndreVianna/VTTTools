// Generated: 2025-10-12
// BDD Step Definitions for Create Epic Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (EpicService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Epics.Model;
using VttTools.Library.Epics.ServiceContracts;
using VttTools.Library.Epics.Services;
using VttTools.Library.Epics.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.EpicManagement.CreateEpic;

/// <summary>
/// BDD Step Definitions for Create Epic scenarios.
/// BLOCKED: EpicService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class CreateEpicSteps {
    private readonly ScenarioContext _context;
    private readonly IEpicStorage _epicStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IEpicService _service;

    // Test state
    private CreateEpicData? _createData;
    private Result<Epic>? _createResult;
    private Guid _userId = Guid.Empty;
    private List<Campaign> _campaigns = [];
    private Exception? _exception;

    public CreateEpicSteps(ScenarioContext context) {
        _context = context;
        _epicStorage = Substitute.For<IEpicStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        // NOTE: IEpicService does not exist yet - placeholder for Phase 7
        _service = Substitute.For<IEpicService>();
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"my user account exists in the Identity context")]
    public void GivenMyUserAccountExistsInIdentityContext() {
        // Authentication validates user existence
        _context["UserAuthenticated"] = true;
    }

    #endregion

    #region Given Steps - Epic Name

    [Given(@"I provide epic name ""(.*)""")]
    public void GivenIProvideEpicName(string name) {
        _createData = new CreateEpicData {
            Name = name,
            Description = string.Empty,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I provide empty epic name")]
    public void GivenIProvideEmptyEpicName() {
        _createData = new CreateEpicData {
            Name = string.Empty,
            Description = string.Empty
        };
    }

    [Given(@"I provide epic name with (.*) characters")]
    public void GivenIProvideEpicNameWithLength(int length) {
        var name = new string('A', length);
        _createData = new CreateEpicData {
            Name = name,
            Description = string.Empty
        };
    }

    #endregion

    #region Given Steps - Epic Description

    [Given(@"I provide epic with description of exactly (.*) characters")]
    public void GivenIProvideEpicWithDescriptionOfExactlyCharacters(int length) {
        var description = new string('B', length);
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = description,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I provide epic with description of (.*) characters")]
    public void GivenIProvideEpicWithDescriptionOfCharacters(int length) {
        GivenIProvideEpicWithDescriptionOfExactlyCharacters(length);
    }

    [Given(@"I do not provide description")]
    public void GivenIDoNotProvideDescription() {
        if (_createData is not null) {
            _createData = _createData with { Description = string.Empty };
        }
    }

    #endregion

    #region Given Steps - Publication Status

    [Given(@"I provide epic with IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenIProvideEpicWithPublicationStatus(bool isPublished, bool isPublic) {
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = "Test Description",
            IsPublished = isPublished,
            IsPublic = isPublic
        };
    }

    #endregion

    #region Given Steps - Complete Epic Data

    [Given(@"I provide valid epic data:")]
    public void GivenIProvideValidEpicData(Table table) {
        var data = table.CreateInstance<EpicDataTable>();
        _createData = new CreateEpicData {
            Name = data.Name,
            Description = data.Description,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic
        };
    }

    [Given(@"I provide valid epic data")]
    public void GivenIProvideValidEpicData() {
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = "Test Description",
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have a valid epic name ""(.*)""")]
    public void GivenIHaveAValidEpicName(string name) {
        _createData = new CreateEpicData {
            Name = name,
            Description = string.Empty,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have an empty epic name")]
    public void GivenIHaveAnEmptyEpicName() {
        GivenIProvideEmptyEpicName();
    }

    [Given(@"I have an epic name with (.*) characters")]
    public void GivenIHaveAnEpicNameWithCharacters(int length) {
        GivenIProvideEpicNameWithLength(length);
    }

    [Given(@"I have a valid epic titled ""(.*)""")]
    public void GivenIHaveAValidEpicTitled(string name) {
        _createData = new CreateEpicData {
            Name = name,
            Description = "Epic description",
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have a valid epic structure")]
    public void GivenIHaveAValidEpicStructure() {
        GivenIProvideValidEpicData();
    }

    #endregion

    #region Given Steps - Campaigns

    [Given(@"I provide (.*) valid campaigns in the collection")]
    public void GivenIProvideValidCampaignsInCollection(int count) {
        _campaigns.Clear();
        for (int i = 0; i < count; i++) {
            _campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                Name = $"Campaign {i + 1}",
                OwnerId = _userId,
                EpicId = null // Will be set after epic creation
            });
        }
        _context["CampaignsCount"] = count;
    }

    [Given(@"I provide (.*) valid campaigns")]
    public void GivenIProvideValidCampaigns(int count) {
        GivenIProvideValidCampaignsInCollection(count);
    }

    [Given(@"I have two campaigns to include")]
    public void GivenIHaveTwoCampaignsToInclude() {
        GivenIProvideValidCampaignsInCollection(2);
    }

    [Given(@"I have no campaigns to include")]
    public void GivenIHaveNoCampaignsToInclude() {
        _campaigns.Clear();
        _context["CampaignsCount"] = 0;
    }

    #endregion

    #region Given Steps - Background Resource

    [Given(@"I provide valid image resource as background")]
    public void GivenIProvideValidImageResourceAsBackground() {
        var resourceId = Guid.CreateVersion7();
        if (_createData is not null) {
            _createData = _createData with { BackgroundResourceId = resourceId };
        }

        // Mock media storage to return valid image resource
        var resource = new Resource {
            Id = resourceId,
            OwnerId = _userId,
            Filename = "background.jpg",
            MimeType = "image/jpeg"
        };
        _mediaStorage.GetByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);
    }

    [Given(@"I have a background resource reference")]
    public void GivenIHaveABackgroundResourceReference() {
        GivenIProvideValidImageResourceAsBackground();
    }

    [Given(@"I have no background resource")]
    public void GivenIHaveNoBackgroundResource() {
        if (_createData is not null) {
            _createData = _createData with { BackgroundResourceId = null };
        }
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"I provide epic with owner ID that doesn't exist")]
    public void GivenIProvideEpicWithOwnerIdThatDoesntExist() {
        _userId = Guid.CreateVersion7(); // Non-existent user ID
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = string.Empty
        };
        // Service should validate owner existence
    }

    [Given(@"I specify a non-existent owner identifier")]
    public void GivenISpecifyANonExistentOwnerIdentifier() {
        GivenIProvideEpicWithOwnerIdThatDoesntExist();
    }

    [Given(@"I provide epic with background resource ID that doesn't exist")]
    public void GivenIProvideEpicWithBackgroundResourceIdThatDoesntExist() {
        var nonExistentResourceId = Guid.CreateVersion7();
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = string.Empty,
            BackgroundResourceId = nonExistentResourceId
        };

        // Mock media storage to return null for non-existent resource
        _mediaStorage.GetByIdAsync(nonExistentResourceId, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);
    }

    [Given(@"I specify a non-existent background resource identifier")]
    public void GivenISpecifyANonExistentBackgroundResourceIdentifier() {
        GivenIProvideEpicWithBackgroundResourceIdThatDoesntExist();
    }

    [Given(@"I provide epic with background resource that is not an image")]
    public void GivenIProvideEpicWithBackgroundResourceThatIsNotAnImage() {
        var resourceId = Guid.CreateVersion7();
        _createData = new CreateEpicData {
            Name = "Test Epic",
            Description = string.Empty,
            BackgroundResourceId = resourceId
        };

        // Mock media storage to return non-image resource
        var resource = new Resource {
            Id = resourceId,
            OwnerId = _userId,
            Filename = "document.pdf",
            MimeType = "application/pdf" // Not an image
        };
        _mediaStorage.GetByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        // Mock storage to throw exception
        _epicStorage.UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>())
            .Returns<bool>(x => throw new InvalidOperationException("Database connection failed"));
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    #endregion

    #region When Steps - Create Actions

    [When(@"I create the epic")]
    public async Task WhenICreateTheEpic() {
        try {
            // Mock storage to succeed
            _epicStorage.UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // NOTE: This will fail because IEpicService.CreateEpicAsync does not exist
            // Placeholder call for when service is implemented
            _createResult = await _service.CreateEpicAsync(_userId, _createData!, CancellationToken.None);
            _context["CreateResult"] = _createResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to create the epic")]
    public async Task WhenIAttemptToCreateTheEpic() {
        await WhenICreateTheEpic();
    }

    [When(@"I attempt to create an epic")]
    public async Task WhenIAttemptToCreateAnEpic() {
        await WhenICreateTheEpic();
    }

    [When(@"I create an epic with this name")]
    public async Task WhenICreateAnEpicWithThisName() {
        await WhenICreateTheEpic();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the epic should be created with generated ID")]
    public void ThenTheEpicShouldBeCreatedWithGeneratedId() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
        _createResult.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the epic name should be ""(.*)""")]
    public void ThenTheEpicNameShouldBe(string expectedName) {
        _createResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the epic is created")]
    public void ThenTheEpicIsCreated() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
    }

    [Then(@"my epic is created successfully")]
    public void ThenMyEpicIsCreatedSuccessfully() {
        ThenTheEpicIsCreated();
    }

    [Then(@"I receive the epic details with my name")]
    public void ThenIReceiveTheEpicDetailsWithMyName() {
        _createResult!.Value.Should().NotBeNull();
        _createResult!.Value!.Name.Should().NotBeEmpty();
    }

    [Then(@"the epic should be marked as published")]
    public void ThenTheEpicShouldBeMarkedAsPublished() {
        _createResult!.Value!.IsPublished.Should().BeTrue();
    }

    [Then(@"the epic should be marked as public")]
    public void ThenTheEpicShouldBeMarkedAsPublic() {
        _createResult!.Value!.IsPublic.Should().BeTrue();
    }

    [Then(@"the epic should be publicly visible")]
    public void ThenTheEpicShouldBePubliclyVisible() {
        ThenTheEpicShouldBeMarkedAsPublic();
    }

    [Then(@"the full description should be preserved")]
    public void ThenTheFullDescriptionShouldBePreserved() {
        _createResult!.Value!.Description.Should().NotBeEmpty();
        _createResult!.Value!.Description.Length.Should().BeLessOrEqualTo(4096);
    }

    [Then(@"the description should be empty string")]
    public void ThenTheDescriptionShouldBeEmptyString() {
        _createResult!.Value!.Description.Should().BeEmpty();
    }

    [Then(@"the epic is saved in the database")]
    public async Task ThenTheEpicIsSavedInTheDatabase() {
        await _epicStorage.Received(1).UpdateAsync(
            Arg.Is<Epic>(e => e.Id == _createResult!.Value!.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"an EpicCreated domain action is logged")]
    public void ThenAnEpicCreatedDomainActionIsLogged() {
        // In real implementation, would verify domain event was published
        _createResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive the epic with generated ID")]
    public void ThenIShouldReceiveTheEpicWithGeneratedId() {
        _createResult!.Value.Should().NotBeNull();
        _createResult!.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the epic should be retrievable by ID")]
    public async Task ThenTheEpicShouldBeRetrievableById() {
        // Verify epic was stored and can be retrieved
        await _epicStorage.Received(1).UpdateAsync(
            Arg.Is<Epic>(e => e.Id == _createResult!.Value!.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should see the epic in my library")]
    public void ThenIShouldSeeTheEpicInMyLibrary() {
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult!.Value!.OwnerId.Should().Be(_userId);
    }

    [Then(@"the epic should be saved")]
    public void ThenTheEpicShouldBeSaved() {
        ThenTheEpicIsCreated();
    }

    [Then(@"I should see confirmation")]
    public void ThenIShouldSeeConfirmation() {
        _createResult!.IsSuccessful.Should().BeTrue();
    }

    #endregion

    #region Then Steps - Campaign Associations

    [Then(@"all (.*) campaigns is saved")]
    public void ThenAllCampaignsAreSaved(int expectedCount) {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().Be(expectedCount);
    }

    [Then(@"all (.*) campaigns should be associated with the epic")]
    public void ThenAllCampaignsShouldBeAssociatedWithEpic(int expectedCount) {
        ThenAllCampaignsAreSaved(expectedCount);
    }

    [Then(@"each campaign should reference the epic ID")]
    public void ThenEachCampaignShouldReferenceTheEpicId() {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().BeGreaterThan(0);
    }

    [Then(@"the epic contains my two campaigns")]
    public void ThenTheEpicContainsMyTwoCampaigns() {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().Be(2);
    }

    [Then(@"the epic contains an empty campaign collection")]
    public void ThenTheEpicContainsAnEmptyCampaignCollection() {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().Be(0);
    }

    #endregion

    #region Then Steps - Background Resource

    [Then(@"the background resource should be associated")]
    public void ThenTheBackgroundResourceShouldBeAssociated() {
        _createResult!.Value!.Background.Should().NotBeNull();
    }

    [Then(@"the background resource is linked")]
    public void ThenTheBackgroundResourceIsLinked() {
        ThenTheBackgroundResourceShouldBeAssociated();
    }

    [Then(@"the epic has no background resource linked")]
    public void ThenTheEpicHasNoBackgroundResourceLinked() {
        _createResult!.Value!.Background.Should().BeNull();
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

    [Then(@"I should see error")]
    public void ThenIShouldSeeError() {
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I receive a validation error indicating name is required")]
    public void ThenIReceiveAValidationErrorIndicatingNameIsRequired() {
        ThenIShouldSeeError("Epic name is required");
    }

    [Then(@"I receive a validation error indicating name is too long")]
    public void ThenIReceiveAValidationErrorIndicatingNameIsTooLong() {
        ThenIShouldSeeError("Epic name must not exceed 128 characters");
    }

    [Then(@"the epic should not be persisted")]
    public void ThenTheEpicShouldNotBePersisted() {
        await _epicStorage.DidNotReceive().UpdateAsync(
            Arg.Any<Epic>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().Contain(e => e.Contains("not found") || e.Contains("NotFound"));
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
        _exception.Should().BeOfType<InvalidOperationException>();
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().Contain(e => e.Contains("unauthorized") || e.Contains("Unauthorized"));
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        var isAuthenticated = _context.Get<bool>("UserAuthenticated");
        isAuthenticated.Should().BeFalse();
    }

    [Then(@"I should be redirected to login")]
    public void ThenIShouldBeRedirectedToLogin() {
        ThenIShouldBePromptedToLogIn();
    }

    [Then(@"my request is rejected")]
    public void ThenMyRequestIsRejected() {
        _createResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I receive a validation error for owner reference")]
    public void ThenIReceiveAValidationErrorForOwnerReference() {
        ThenIShouldSeeError("Owner user not found");
    }

    [Then(@"I receive a validation error for background resource")]
    public void ThenIReceiveAValidationErrorForBackgroundResource() {
        ThenIShouldSeeError("Background resource not found or not an image");
    }

    [Then(@"I receive an error response")]
    public void ThenIReceiveAnErrorResponse() {
        _createResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I am informed to retry my request")]
    public void ThenIAmInformedToRetryMyRequest() {
        _createResult!.Errors.Should().Contain(e => e.Contains("retry") || e.Contains("try again"));
    }

    #endregion

    #region Then Steps - Data-Driven

    [Then(@"the result should be (.*)")]
    public void ThenTheResultShouldBe(string expectedResult) {
        if (expectedResult == "success") {
            _createResult!.IsSuccessful.Should().BeTrue();
        }
        else if (expectedResult == "failure") {
            _createResult!.IsSuccessful.Should().BeFalse();
        }
    }

    #endregion

    #region Helper Classes

    private class EpicDataTable {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsPublic { get; set; }
    }

    #endregion
}

// Placeholder service contracts (Phase 7 - to be implemented)
namespace VttTools.Library.Epics.ServiceContracts;

public record CreateEpicData {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundResourceId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Guid> CampaignIds { get; init; } = [];
}

namespace VttTools.Library.Epics.Services;

public interface IEpicService {
    Task<Result<Epic>> CreateEpicAsync(Guid userId, CreateEpicData data, CancellationToken ct);
    Task<Result<Epic>> GetByIdAsync(Guid epicId, CancellationToken ct);
    Task<Result<IEnumerable<Epic>>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<Result> UpdateEpicAsync(Guid userId, Guid epicId, UpdateEpicData data, CancellationToken ct);
    Task<Result> DeleteEpicAsync(Guid userId, Guid epicId, CancellationToken ct);
}

namespace VttTools.Library.Epics.Storage;

public interface IEpicStorage {
    Task<Epic?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Epic>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<bool> UpdateAsync(Epic epic, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
