// Generated: 2025-10-12
// BDD Step Definitions for Get World By ID Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (WorldService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Library.Campaigns.Model;
using VttTools.Library.Worlds.Model;
using VttTools.Library.Worlds.Services;
using VttTools.Library.Worlds.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.WorldManagement.GetWorldByID;

/// <summary>
/// BDD Step Definitions for Get World By ID scenarios.
/// BLOCKED: WorldService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class GetWorldByIDSteps {
    private readonly ScenarioContext _context;
    private readonly IWorldStorage _worldStorage;
    private readonly IWorldService _service;

    // Test state
    private World? _existingWorld;
    private Result<World>? _getResult;
    private Guid _userId = Guid.Empty;
    private Guid _worldId = Guid.Empty;
    private string? _invalidId;
    private Exception? _exception;

    public GetWorldByIDSteps(ScenarioContext context) {
        _context = context;
        _worldStorage = Substitute.For<IWorldStorage>();
        // NOTE: IWorldService does not exist yet - placeholder for Phase 7
        _service = Substitute.For<IWorldService>();
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    #endregion

    #region Given Steps - World Existence

    [Given(@"an world exists with ID ""(.*)""")]
    public void GivenAnWorldExistsWithId(string worldId) {
        _worldId = Guid.Parse(worldId);
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Test World",
            Description = "Test Description",
            IsPublished = false,
            IsPublic = false,
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"the world has name ""(.*)""")]
    public void GivenTheWorldHasName(string name) {
        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with { Name = name };
        }
    }

    [Given(@"an world exists with (.*) associated campaigns")]
    public void GivenAnWorldExistsWithAssociatedCampaigns(int count) {
        if (_existingWorld is null) {
            _worldId = Guid.CreateVersion7();
            _existingWorld = new World {
                Id = _worldId,
                OwnerId = _userId,
                Name = "Test World",
                Description = "Test Description"
            };
        }

        var campaigns = new List<Campaign>();
        for (int i = 0; i < count; i++) {
            campaigns.Add(new Campaign {
                Id = Guid.CreateVersion7(),
                Name = $"Campaign {i + 1}",
                OwnerId = _userId,
                WorldId = _worldId
            });
        }

        _existingWorld = _existingWorld with { Campaigns = campaigns };
        _context["CampaignCount"] = count;

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"an world exists with background resource")]
    public void GivenAnWorldExistsWithBackgroundResource() {
        if (_existingWorld is null) {
            _worldId = Guid.CreateVersion7();
            _existingWorld = new World {
                Id = _worldId,
                OwnerId = _userId,
                Name = "Test World",
                Description = "Test Description"
            };
        }

        var resource = new Resource {
            Id = Guid.CreateVersion7(),
            OwnerId = _userId,
            Filename = "background.jpg",
            MimeType = "image/jpeg"
        };

        _existingWorld = _existingWorld with { Background = resource };
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"an world exists with no associated campaigns")]
    public void GivenAnWorldExistsWithNoAssociatedCampaigns() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Empty World",
            Description = "No campaigns",
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"an world exists with only required fields populated")]
    public void GivenAnWorldExistsWithOnlyRequiredFieldsPopulated() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Minimal World",
            Description = string.Empty,
            Background = null!,
            IsPublished = false,
            IsPublic = false,
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"an world exists with IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenAnWorldExistsWithPublicationStatus(bool isPublished, bool isPublic) {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Test World",
            Description = "Test Description",
            IsPublished = isPublished,
            IsPublic = isPublic,
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"I am authenticated as (.*)")]
    public void GivenIAmAuthenticatedAs(string role) {
        // For now, all authenticated users are Game Masters
        // In full implementation, would differentiate by role
        _userId = Guid.CreateVersion7();
        _context["UserRole"] = role;
    }

    [Given(@"I have created an world titled ""(.*)""")]
    public void GivenIHaveCreatedAnWorldTitled(string name) {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = name,
            Description = "World description",
            Campaigns = []
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no world exists with ID ""(.*)""")]
    public void GivenNoWorldExistsWithId(string worldId) {
        _worldId = Guid.Parse(worldId);
        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"I provide invalid ID format ""(.*)""")]
    public void GivenIProvideInvalidIdFormat(string invalidId) {
        _invalidId = invalidId;
    }

    [Given(@"an world exists in the database")]
    public void GivenAnWorldExistsInTheDatabase() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Test World",
            Description = "Test Description"
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"the database is unavailable")]
    public void GivenTheDatabaseIsUnavailable() {
        _worldStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns<World?>(x => throw new InvalidOperationException("Database connection failed"));
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    [Given(@"a private world exists")]
    public void GivenAPrivateWorldExists() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = Guid.CreateVersion7(), // Different owner
            Name = "Private World",
            Description = "Private description",
            IsPublished = false,
            IsPublic = false
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    #endregion

    #region When Steps - Retrieve Actions

    [When(@"I request the world by ID ""(.*)""")]
    public async Task WhenIRequestTheWorldById(string worldId) {
        _worldId = Guid.Parse(worldId);
        await ExecuteGet();
    }

    [When(@"I request the world by its ID")]
    public async Task WhenIRequestTheWorldByItsId() {
        await ExecuteGet();
    }

    [When(@"I attempt to request the world")]
    public async Task WhenIAttemptToRequestTheWorld() {
        if (_invalidId is not null) {
            // Invalid GUID format - should fail parsing
            try {
                _worldId = Guid.Parse(_invalidId);
            }
            catch (FormatException ex) {
                _exception = ex;
                _context["Exception"] = ex;
                return;
            }
        }
        await ExecuteGet();
    }

    [When(@"I attempt to request the world by its ID")]
    public async Task WhenIAttemptToRequestTheWorldByItsId() {
        await ExecuteGet();
    }

    [When(@"I retrieve the world by its identifier")]
    public async Task WhenIRetrieveTheWorldByItsIdentifier() {
        await ExecuteGet();
    }

    private async Task ExecuteGet() {
        try {
            // NOTE: This will fail because IWorldService.GetByIdAsync does not exist
            // Placeholder call for when service is implemented
            _getResult = await _service.GetByIdAsync(_worldId, CancellationToken.None);
            _context["GetResult"] = _getResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"I should receive the world details")]
    public void ThenIShouldReceiveTheWorldDetails() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeTrue();
        _getResult.Value.Should().NotBeNull();
    }

    [Then(@"I receive the complete world details")]
    public void ThenIReceiveTheCompleteWorldDetails() {
        ThenIShouldReceiveTheWorldDetails();
    }

    [Then(@"the world name should be ""(.*)""")]
    public void ThenTheWorldNameShouldBe(string expectedName) {
        _getResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the world should include all properties")]
    public void ThenTheWorldShouldIncludeAllProperties() {
        _getResult!.Value.Should().NotBeNull();
        _getResult!.Value!.Id.Should().NotBeEmpty();
        _getResult!.Value!.Name.Should().NotBeEmpty();
    }

    [Then(@"I should see all (.*) campaigns in the collection")]
    public void ThenIShouldSeeAllCampaignsInTheCollection(int expectedCount) {
        _getResult!.Value!.Campaigns.Should().HaveCount(expectedCount);
    }

    [Then(@"each campaign should reference the correct world ID")]
    public void ThenEachCampaignShouldReferenceTheCorrectWorldId() {
        _getResult!.Value!.Campaigns.Should().AllSatisfy(c =>
            c.WorldId.Should().Be(_worldId)
        );
    }

    [Then(@"the background resource details should be included")]
    public void ThenTheBackgroundResourceDetailsShouldBeIncluded() {
        _getResult!.Value!.Background.Should().NotBeNull();
    }

    [Then(@"the campaigns collection should be empty")]
    public void ThenTheCampaignsCollectionShouldBeEmpty() {
        _getResult!.Value!.Campaigns.Should().BeEmpty();
    }

    [Then(@"optional fields should have default values")]
    public void ThenOptionalFieldsShouldHaveDefaultValues() {
        _getResult!.Value!.Description.Should().BeEmpty();
        _getResult!.Value!.Background.Should().BeNull();
    }

    [Then(@"I should see all associated campaigns")]
    public void ThenIShouldSeeAllAssociatedCampaigns() {
        _getResult!.Value!.Campaigns.Should().NotBeNull();
    }

    [Then(@"the details include all campaigns")]
    public void ThenTheDetailsIncludeAllCampaigns() {
        ThenIShouldSeeAllAssociatedCampaigns();
    }

    [Then(@"the details include the background resource")]
    public void ThenTheDetailsIncludeTheBackgroundResource() {
        ThenTheBackgroundResourceDetailsShouldBeIncluded();
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
        if (_exception is not null) {
            _exception.Message.Should().Contain(expectedError);
        }
        else {
            _getResult!.Errors.Should().Contain(e => e.Contains(expectedError));
        }
    }

    [Then(@"I should see error with validation error")]
    public void ThenIShouldSeeErrorWithValidationError() {
        if (_exception is not null) {
            _exception.Should().BeOfType<FormatException>();
        }
        else {
            _getResult.Should().NotBeNull();
            _getResult!.IsSuccessful.Should().BeFalse();
            _getResult!.Errors.Should().NotBeEmpty();
        }
    }

    [Then(@"I should see error with server error")]
    public void ThenIShouldSeeErrorWithServerError() {
        _exception.Should().NotBeNull();
        _exception.Should().BeOfType<InvalidOperationException>();
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeFalse();
        _getResult!.Errors.Should().Contain(e => e.Contains("unauthorized") || e.Contains("Unauthorized"));
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        var isAuthenticated = _context.Get<bool>("UserAuthenticated");
        isAuthenticated.Should().BeFalse();
    }

    #endregion

    #region Then Steps - Data-Driven

    [Then(@"the result should be (.*)")]
    public void ThenTheResultShouldBe(string expectedResult) {
        if (expectedResult == "success") {
            _getResult!.IsSuccessful.Should().BeTrue();
        }
        else if (expectedResult == "failure") {
            _getResult!.IsSuccessful.Should().BeFalse();
        }
    }

    #endregion
}
