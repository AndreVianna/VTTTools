// Generated: 2025-10-12
// BDD Step Definitions for Update Adventure Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (AdventureService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Adventures.Model;
using VttTools.Library.Adventures.ServiceContracts;
using VttTools.Library.Adventures.Services;
using VttTools.Library.Adventures.Storage;
using VttTools.Library.Scenes.Storage;
using VttTools.Media.Model;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.AdventureManagement.UpdateAdventure;

[Binding]
public class UpdateAdventureSteps {
    private readonly ScenarioContext _context;
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IAdventureService _service;

    // Test state
    private Adventure? _existingAdventure;
    private UpdatedAdventureData? _updateData;
    private Result<Adventure>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _adventureId = Guid.Empty;
    private Exception? _exception;

    public UpdateAdventureSteps(ScenarioContext context) {
        _context = context;
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new AdventureService(_adventureStorage, _sceneStorage, _mediaStorage);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I own an adventure in my library")]
    public void GivenIAlreadyOwnAnAdventure() {
        _adventureId = Guid.CreateVersion7();
        _existingAdventure = new Adventure {
            Id = _adventureId,
            OwnerId = _userId,
            Name = "Original Adventure",
            Description = "Original Description",
            Type = AdventureType.Generic,
            IsPublished = false,
            IsPublic = false
        };

        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);

        _context["AdventureId"] = _adventureId;
        _context["ExistingAdventure"] = _existingAdventure;
    }

    #endregion

    #region Given Steps - Existing Adventure State

    [Given(@"my adventure has name ""(.*)""")]
    public void GivenMyAdventureHasName(string name) {
        _existingAdventure = _existingAdventure! with { Name = name };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure has type ""(.*)""")]
    public void GivenMyAdventureHasType(string typeName) {
        var type = Enum.Parse<AdventureType>(typeName);
        _existingAdventure = _existingAdventure! with { Type = type };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure has description ""(.*)""")]
    public void GivenMyAdventureHasDescription(string description) {
        _existingAdventure = _existingAdventure! with { Description = description };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure has IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenMyAdventureHasPublishStatus(bool isPublished, bool isPublic) {
        _existingAdventure = _existingAdventure! with { IsPublished = isPublished, IsPublic = isPublic };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure has IsPublished=(.*)")]
    public void GivenMyAdventureHasPublishStatus(bool isPublished) {
        _existingAdventure = _existingAdventure! with { IsPublished = isPublished };
        _adventureStorage.GetByIdAsync(_adventureId, Arg.Any<CancellationToken>())
            .Returns(_existingAdventure);
    }

    [Given(@"my adventure exists")]
    public void GivenMyAdventureExists() {
        // Adventure already set up in background step
        _existingAdventure.Should().NotBeNull();
    }

    #endregion

    #region Given Steps - Non-Existent Adventures

    [Given(@"no adventure exists with ID ""(.*)""")]
    public void GivenNoAdventureExistsWithId(string id) {
        var nonExistentId = Guid.Parse(id);
        _adventureStorage.GetByIdAsync(nonExistentId, Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);
        _context["NonExistentId"] = nonExistentId;
    }

    [Given(@"an adventure exists owned by another user")]
    public void GivenAdventureExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        var otherAdventure = new Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = otherUserId,
            Name = "Other User's Adventure",
            Description = "Other Description",
            Type = AdventureType.Generic
        };

        _adventureStorage.GetByIdAsync(otherAdventure.Id, Arg.Any<CancellationToken>())
            .Returns(otherAdventure);

        _context["OtherAdventureId"] = otherAdventure.Id;
    }

    #endregion

    #region When Steps - Update Actions

    [When(@"I update the adventure name to ""(.*)""")]
    public async Task WhenIUpdateTheAdventureName(string newName) {
        _updateData = new UpdatedAdventureData {
            Name = new Optional<string>(newName)
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I attempt to update with empty name")]
    public async Task WhenIAttemptToUpdateWithEmptyName() {
        _updateData = new UpdatedAdventureData {
            Name = new Optional<string>(string.Empty)
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I update to IsPublished=(.*) and IsPublic=(.*)")]
    public async Task WhenIUpdateToPublishStatus(bool isPublished, bool isPublic) {
        _updateData = new UpdatedAdventureData {
            IsListed = new Optional<bool>(isPublished),
            IsPublic = new Optional<bool>(isPublic)
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I attempt to update to IsPublished=(.*) and IsPublic=(.*)")]
    public async Task WhenIAttemptToUpdateToPublishStatus(bool isPublished, bool isPublic) {
        await WhenIUpdateToPublishStatus(isPublished, isPublic);
    }

    [When(@"I update the adventure type to ""(.*)""")]
    public async Task WhenIUpdateTheAdventureType(string newType) {
        var type = Enum.Parse<AdventureType>(newType);
        _updateData = new UpdatedAdventureData {
            Type = new Optional<AdventureType>(type)
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I update the description to ""(.*)""")]
    public async Task WhenIUpdateTheDescription(string newDescription) {
        _updateData = new UpdatedAdventureData {
            Description = new Optional<string>(newDescription)
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I update the adventure with:")]
    public async Task WhenIUpdateTheAdventureWith(Table table) {
        var row = table.Rows[0];
        _updateData = new UpdatedAdventureData {
            Name = new Optional<string>(row["Name"]),
            Type = new Optional<AdventureType>(Enum.Parse<AdventureType>(row["Type"])),
            Description = new Optional<string>(row["Description"]),
            IsPublic = new Optional<bool>(bool.Parse(row["IsPublic"]))
        };
        await WhenIUpdateTheAdventure();
    }

    [When(@"I attempt to update adventure ""(.*)""")]
    public async Task WhenIAttemptToUpdateAdventure(string id) {
        var adventureId = Guid.Parse(id);
        _updateData = new UpdatedAdventureData {
            Name = new Optional<string>("Updated Name")
        };

        try {
            _updateResult = await _service.UpdateAdventureAsync(_userId, adventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    [When(@"I attempt to update that adventure")]
    public async Task WhenIAttemptToUpdateThatAdventure() {
        var otherAdventureId = _context.Get<Guid>("OtherAdventureId");
        _updateData = new UpdatedAdventureData {
            Name = new Optional<string>("Attempted Update")
        };

        try {
            _updateResult = await _service.UpdateAdventureAsync(_userId, otherAdventureId, _updateData, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    private async Task WhenIUpdateTheAdventure() {
        try {
            // Mock storage to succeed
            _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask);

            _updateResult = await _service.UpdateAdventureAsync(_userId, _adventureId, _updateData!, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the adventure is updated successfully")]
    public void ThenTheAdventureIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
        _updateResult.Value.Should().NotBeNull();
    }

    [Then(@"the adventure name should be ""(.*)""")]
    public void ThenTheAdventureNameShouldBe(string expectedName) {
        _updateResult!.Value!.Name.Should().Be(expectedName);
    }

    [Then(@"the adventure should be publicly visible")]
    public void ThenTheAdventureShouldBePubliclyVisible() {
        _updateResult!.Value!.IsPublished.Should().BeTrue();
        _updateResult!.Value!.IsPublic.Should().BeTrue();
    }

    [Then(@"the adventure type should be ""(.*)""")]
    public void ThenTheAdventureTypeShouldBe(string expectedType) {
        var type = Enum.Parse<AdventureType>(expectedType);
        _updateResult!.Value!.Type.Should().Be(type);
    }

    [Then(@"the description should be ""(.*)""")]
    public void ThenTheDescriptionShouldBe(string expectedDescription) {
        _updateResult!.Value!.Description.Should().Be(expectedDescription);
    }

    [Then(@"all updated fields should reflect new values")]
    public void ThenAllUpdatedFieldsShouldReflectNewValues() {
        _updateResult!.Value.Should().NotBeNull();
        // Verify that all updated fields have been applied
        if (_updateData!.Name.IsSet) {
            _updateResult!.Value!.Name.Should().Be(_updateData.Name.Value);
        }
        if (_updateData!.Type.IsSet) {
            _updateResult!.Value!.Type.Should().Be(_updateData.Type.Value);
        }
        if (_updateData!.Description.IsSet) {
            _updateResult!.Value!.Description.Should().Be(_updateData.Description.Value);
        }
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
    public void ThenIShouldSeeErrorMessage(string expectedError) {
        _updateResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error with not found error")]
    public void ThenIShouldSeeErrorWithNotFoundError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase) || e.Contains("NotFound"));
    }

    [Then(@"I should see error with forbidden error")]
    public void ThenIShouldSeeErrorWithForbiddenError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e =>
            e.Contains("not authorized", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("NotAllowed") ||
            e.Contains("forbidden", StringComparison.OrdinalIgnoreCase));
    }

    #endregion
}
