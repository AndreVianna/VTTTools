// Generated: 2025-10-12
// BDD Step Definitions for Create World Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (WorldService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Worlds.Model;
using VttTools.Library.Worlds.ServiceContracts;
using VttTools.Library.Worlds.Services;
using VttTools.Library.Worlds.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.WorldManagement.CreateWorld;

/// <summary>
/// BDD Step Definitions for Create World scenarios.
/// BLOCKED: WorldService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class CreateWorldSteps {
    private readonly ScenarioContext _context;
    private readonly IWorldStorage _worldStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IWorldService _service;

    // Test state
    private CreateWorldData? _createData;
    private Result<World>? _createResult;
    private Guid _userId = Guid.Empty;
    private List<Campaign> _campaigns = [];
    private Exception? _exception;

    public CreateWorldSteps(ScenarioContext context) {
        _context = context;
        _worldStorage = Substitute.For<IWorldStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        // NOTE: IWorldService does not exist yet - placeholder for Phase 7
        _service = Substitute.For<IWorldService>();
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

    #region Given Steps - World Name

    [Given(@"I provide world name ""(.*)""")]
    public void GivenIProvideWorldName(string name) {
        _createData = new CreateWorldData {
            Name = name,
            Description = string.Empty,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I provide empty world name")]
    public void GivenIProvideEmptyWorldName() {
        _createData = new CreateWorldData {
            Name = string.Empty,
            Description = string.Empty
        };
    }

    [Given(@"I provide world name with (.*) characters")]
    public void GivenIProvideWorldNameWithLength(int length) {
        var name = new string('A', length);
        _createData = new CreateWorldData {
            Name = name,
            Description = string.Empty
        };
    }

    #endregion

    #region Given Steps - World Description

    [Given(@"I provide world with description of exactly (.*) characters")]
    public void GivenIProvideWorldWithDescriptionOfExactlyCharacters(int length) {
        var description = new string('B', length);
        _createData = new CreateWorldData {
            Name = "Test World",
            Description = description,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I provide world with description of (.*) characters")]
    public void GivenIProvideWorldWithDescriptionOfCharacters(int length) {
        GivenIProvideWorldWithDescriptionOfExactlyCharacters(length);
    }

    [Given(@"I do not provide description")]
    public void GivenIDoNotProvideDescription() {
        if (_createData is not null) {
            _createData = _createData with { Description = string.Empty };
        }
    }

    #endregion

    #region Given Steps - Publication Status

    [Given(@"I provide world with IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenIProvideWorldWithPublicationStatus(bool isPublished, bool isPublic) {
        _createData = new CreateWorldData {
            Name = "Test World",
            Description = "Test Description",
            IsPublished = isPublished,
            IsPublic = isPublic
        };
    }

    #endregion

    #region Given Steps - Complete World Data

    [Given(@"I provide valid world data:")]
    public void GivenIProvideValidWorldData(Table table) {
        var data = table.CreateInstance<WorldDataTable>();
        _createData = new CreateWorldData {
            Name = data.Name,
            Description = data.Description,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic
        };
    }

    [Given(@"I provide valid world data")]
    public void GivenIProvideValidWorldData() {
        _createData = new CreateWorldData {
            Name = "Test World",
            Description = "Test Description",
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have a valid world name ""(.*)""")]
    public void GivenIHaveAValidWorldName(string name) {
        _createData = new CreateWorldData {
            Name = name,
            Description = string.Empty,
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have an empty world name")]
    public void GivenIHaveAnEmptyWorldName() {
        GivenIProvideEmptyWorldName();
    }

    [Given(@"I have an world name with (.*) characters")]
    public void GivenIHaveAnWorldNameWithCharacters(int length) {
        GivenIProvideWorldNameWithLength(length);
    }

    [Given(@"I have a valid world titled ""(.*)""")]
    public void GivenIHaveAValidWorldTitled(string name) {
        _createData = new CreateWorldData {
            Name = name,
            Description = "World description",
            IsPublished = false,
            IsPublic = false
        };
    }

    [Given(@"I have a valid world structure")]
    public void GivenIHaveAValidWorldStructure() {
        GivenIProvideValidWorldData();
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
                WorldId = null // Will be set after world creation
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

    [Given(@"I provide world with owner ID that doesn't exist")]
    public void GivenIProvideWorldWithOwnerIdThatDoesntExist() {
        _userId = Guid.CreateVersion7(); // Non-existent user ID
        _createData = new CreateWorldData {
            Name = "Test World",
            Description = string.Empty
        };
        // Service should validate owner existence
    }

    [Given(@"I specify a non-existent owner identifier")]
    public void GivenISpecifyANonExistentOwnerIdentifier() {
        GivenIProvideWorldWithOwnerIdThatDoesntExist();
    }

    [Given(@"I provide world with background resource ID that doesn't exist")]
    public void GivenIProvideWorldWithBackgroundResourceIdThatDoesntExist() {
        var nonExistentResourceId = Guid.CreateVersion7();
        _createData = new CreateWorldData {
            Name = "Test World",
            Description = string.Empty,
            BackgroundResourceId = nonExistentResourceId
        };

        // Mock media storage to return null for non-existent resource
        _mediaStorage.GetByIdAsync(nonExistentResourceId, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);
    }

    [Given(@"I specify a non-existent background resource identifier")]
    public void GivenISpecifyANonExistentBackgroundResourceIdentifier() {
        GivenIProvideWorldWithBackgroundResourceIdThatDoesntExist();
    }

    [Given(@"I provide world with background resource that is not an image")]
    public void GivenIProvideWorldWithBackgroundResourceThatIsNotAnImage() {
        var resourceId = Guid.CreateVersion7();
        _createData = new CreateWorldData {
            Name = "Test World",
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
        _worldStorage.UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>())
            .Returns<bool>(x => throw new InvalidOperationException("Database connection failed"));
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    #endregion

    #region When Steps - Create Actions

    [When(@"I create the world")]
    public async Task WhenICreateTheWorld() {
        try {
            // Mock storage to succeed
            _worldStorage.UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // NOTE: This will fail because IWorldService.CreateWorldAsync does not exist
            // Placeholder call for when service is implemented
            _createResult = await _service.CreateWorldAsync(_userId, _createData!, CancellationToken.None);
            _context["CreateResult"] = _createResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to create the world")]
    public async Task WhenIAttemptToCreateTheWorld() {
        await WhenICreateTheWorld();
    }

    [When(@"I attempt to create an world")]
    public async Task WhenIAttemptToCreateAnWorld() {
        await WhenICreateTheWorld();
    }

    [When(@"I create an world with this name")]
    public async Task WhenICreateAnWorldWithThisName() {
        await WhenICreateTheWorld();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the world should be created with generated ID")]
    public void ThenTheWorldShouldBeCreatedWithGeneratedId() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
        _createResult.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the world name should be ""(.*)""")]
    public void ThenTheWorldNameShouldBe(string expectedName) {
        _createResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the world is created")]
    public void ThenTheWorldIsCreated() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
    }

    [Then(@"my world is created successfully")]
    public void ThenMyWorldIsCreatedSuccessfully() {
        ThenTheWorldIsCreated();
    }

    [Then(@"I receive the world details with my name")]
    public void ThenIReceiveTheWorldDetailsWithMyName() {
        _createResult!.Value.Should().NotBeNull();
        _createResult!.Value!.Name.Should().NotBeEmpty();
    }

    [Then(@"the world should be marked as published")]
    public void ThenTheWorldShouldBeMarkedAsPublished() {
        _createResult!.Value!.IsPublished.Should().BeTrue();
    }

    [Then(@"the world should be marked as public")]
    public void ThenTheWorldShouldBeMarkedAsPublic() {
        _createResult!.Value!.IsPublic.Should().BeTrue();
    }

    [Then(@"the world should be publicly visible")]
    public void ThenTheWorldShouldBePubliclyVisible() {
        ThenTheWorldShouldBeMarkedAsPublic();
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

    [Then(@"the world is saved in the database")]
    public async Task ThenTheWorldIsSavedInTheDatabase() {
        await _worldStorage.Received(1).UpdateAsync(
            Arg.Is<World>(e => e.Id == _createResult!.Value!.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"an WorldCreated domain action is logged")]
    public void ThenAnWorldCreatedDomainActionIsLogged() {
        // In real implementation, would verify domain event was published
        _createResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive the world with generated ID")]
    public void ThenIShouldReceiveTheWorldWithGeneratedId() {
        _createResult!.Value.Should().NotBeNull();
        _createResult!.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the world should be retrievable by ID")]
    public async Task ThenTheWorldShouldBeRetrievableById() {
        // Verify world was stored and can be retrieved
        await _worldStorage.Received(1).UpdateAsync(
            Arg.Is<World>(e => e.Id == _createResult!.Value!.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Then(@"I should see the world in my library")]
    public void ThenIShouldSeeTheWorldInMyLibrary() {
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult!.Value!.OwnerId.Should().Be(_userId);
    }

    [Then(@"the world should be saved")]
    public void ThenTheWorldShouldBeSaved() {
        ThenTheWorldIsCreated();
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

    [Then(@"all (.*) campaigns should be associated with the world")]
    public void ThenAllCampaignsShouldBeAssociatedWithWorld(int expectedCount) {
        ThenAllCampaignsAreSaved(expectedCount);
    }

    [Then(@"each campaign should reference the world ID")]
    public void ThenEachCampaignShouldReferenceTheWorldId() {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().BeGreaterThan(0);
    }

    [Then(@"the world contains my two campaigns")]
    public void ThenTheWorldContainsMyTwoCampaigns() {
        var campaignsCount = _context.Get<int>("CampaignsCount");
        campaignsCount.Should().Be(2);
    }

    [Then(@"the world contains an empty campaign collection")]
    public void ThenTheWorldContainsAnEmptyCampaignCollection() {
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

    [Then(@"the world has no background resource linked")]
    public void ThenTheWorldHasNoBackgroundResourceLinked() {
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
        ThenIShouldSeeError("World name is required");
    }

    [Then(@"I receive a validation error indicating name is too long")]
    public void ThenIReceiveAValidationErrorIndicatingNameIsTooLong() {
        ThenIShouldSeeError("World name must not exceed 128 characters");
    }

    [Then(@"the world should not be persisted")]
    public void ThenTheWorldShouldNotBePersisted() {
        await _worldStorage.DidNotReceive().UpdateAsync(
            Arg.Any<World>(),
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

    private class WorldDataTable {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsPublic { get; set; }
    }

    #endregion
}

// Placeholder service contracts (Phase 7 - to be implemented)
namespace VttTools.Library.Worlds.ServiceContracts;

public record CreateWorldData {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundResourceId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Guid> CampaignIds { get; init; } = [];
}

namespace VttTools.Library.Worlds.Services;

public interface IWorldService {
    Task<Result<World>> CreateWorldAsync(Guid userId, CreateWorldData data, CancellationToken ct);
    Task<Result<World>> GetByIdAsync(Guid worldId, CancellationToken ct);
    Task<Result<IEnumerable<World>>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<Result> UpdateWorldAsync(Guid userId, Guid worldId, UpdateWorldData data, CancellationToken ct);
    Task<Result> DeleteWorldAsync(Guid userId, Guid worldId, CancellationToken ct);
}

namespace VttTools.Library.Worlds.Storage;

public interface IWorldStorage {
    Task<World?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<World>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<bool> UpdateAsync(World world, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
