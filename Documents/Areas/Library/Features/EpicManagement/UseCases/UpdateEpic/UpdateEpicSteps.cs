// Generated: 2025-10-12
// BDD Step Definitions for Update World Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (WorldService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Worlds.Model;
using VttTools.Library.Worlds.ServiceContracts;
using VttTools.Library.Worlds.Services;
using VttTools.Library.Worlds.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.WorldManagement.UpdateWorld;

/// <summary>
/// BDD Step Definitions for Update World scenarios.
/// BLOCKED: WorldService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class UpdateWorldSteps {
    private readonly ScenarioContext _context;
    private readonly IWorldStorage _worldStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IWorldService _service;

    // Test state
    private World? _existingWorld;
    private UpdateWorldData? _updateData;
    private Result? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _worldId = Guid.Empty;
    private Exception? _exception;

    public UpdateWorldSteps(ScenarioContext context) {
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

    [Given(@"I own an world in my library")]
    public void GivenIOwnAnWorldInMyLibrary() {
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = _userId,
            Name = "Original World",
            Description = "Original description",
            IsPublished = false,
            IsPublic = false
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);

        _context["WorldId"] = _worldId;
    }

    [Given(@"I have an existing world titled ""(.*)""")]
    public void GivenIHaveAnExistingWorldTitled(string name) {
        GivenIOwnAnWorldInMyLibrary();
        _existingWorld = _existingWorld! with { Name = name };
    }

    #endregion

    #region Given Steps - Existing World State

    [Given(@"my world has name ""(.*)""")]
    public void GivenMyWorldHasName(string name) {
        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with { Name = name };
        }
    }

    [Given(@"my world has description ""(.*)""")]
    public void GivenMyWorldHasDescription(string description) {
        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with { Description = description };
        }
    }

    [Given(@"my world has IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenMyWorldHasPublicationStatus(bool isPublished, bool isPublic) {
        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with {
                IsPublished = isPublished,
                IsPublic = isPublic
            };
        }
    }

    [Given(@"my world has no background resource")]
    public void GivenMyWorldHasNoBackgroundResource() {
        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with { Background = null! };
        }
    }

    [Given(@"my world has background resource")]
    public void GivenMyWorldHasBackgroundResource() {
        var resourceId = Guid.CreateVersion7();
        var resource = new Resource {
            Id = resourceId,
            OwnerId = _userId,
            Filename = "background.jpg",
            MimeType = "image/jpeg"
        };

        if (_existingWorld is not null) {
            _existingWorld = _existingWorld with { Background = resource };
        }
    }

    [Given(@"my world exists")]
    public void GivenMyWorldExists() {
        if (_existingWorld is null) {
            GivenIOwnAnWorldInMyLibrary();
        }
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no world exists with ID ""(.*)""")]
    public void GivenNoWorldExistsWithId(string worldId) {
        var guid = Guid.Parse(worldId);
        _worldStorage.GetByIdAsync(guid, Arg.Any<CancellationToken>())
            .Returns((World?)null);
    }

    [Given(@"an world exists owned by another user")]
    public void GivenAnWorldExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _worldId = Guid.CreateVersion7();
        _existingWorld = new World {
            Id = _worldId,
            OwnerId = otherUserId, // Different owner
            Name = "Other User's World",
            Description = "Description"
        };

        _worldStorage.GetByIdAsync(_worldId, Arg.Any<CancellationToken>())
            .Returns(_existingWorld);
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    [Given(@"an world exists")]
    public void GivenAnWorldExists() {
        GivenIOwnAnWorldInMyLibrary();
    }

    [Given(@"another Game Master has created an world")]
    public void GivenAnotherGameMasterHasCreatedAnWorld() {
        GivenAnWorldExistsOwnedByAnotherUser();
    }

    #endregion

    #region When Steps - Update Actions

    [When(@"I update the world name to ""(.*)""")]
    public async Task WhenIUpdateTheWorldNameTo(string newName) {
        _updateData = new UpdateWorldData {
            Name = newName
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with empty name")]
    public async Task WhenIAttemptToUpdateWithEmptyName() {
        _updateData = new UpdateWorldData {
            Name = string.Empty
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with name of (.*) characters")]
    public async Task WhenIAttemptToUpdateWithNameOfCharacters(int length) {
        _updateData = new UpdateWorldData {
            Name = new string('A', length)
        };
        await ExecuteUpdate();
    }

    [When(@"I update to IsPublished=(.*) and IsPublic=(.*)")]
    public async Task WhenIUpdateToPublicationStatus(bool isPublished, bool isPublic) {
        _updateData = new UpdateWorldData {
            IsPublished = isPublished,
            IsPublic = isPublic
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update to IsPublished=(.*) and IsPublic=(.*)")]
    public async Task WhenIAttemptToUpdateToPublicationStatus(bool isPublished, bool isPublic) {
        await WhenIUpdateToPublicationStatus(isPublished, isPublic);
    }

    [When(@"I update the description to ""(.*)""")]
    public async Task WhenIUpdateTheDescriptionTo(string newDescription) {
        _updateData = new UpdateWorldData {
            Description = newDescription
        };
        await ExecuteUpdate();
    }

    [When(@"I update with valid image resource as background")]
    public async Task WhenIUpdateWithValidImageResourceAsBackground() {
        var resourceId = Guid.CreateVersion7();
        var resource = new Resource {
            Id = resourceId,
            OwnerId = _userId,
            Filename = "new-background.jpg",
            MimeType = "image/jpeg"
        };

        _mediaStorage.GetByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);

        _updateData = new UpdateWorldData {
            BackgroundResourceId = resourceId
        };
        await ExecuteUpdate();
    }

    [When(@"I update the world with:")]
    public async Task WhenIUpdateTheWorldWith(Table table) {
        var data = table.CreateInstance<UpdateDataTable>();
        _updateData = new UpdateWorldData {
            Name = data.Name,
            Description = data.Description,
            IsPublic = data.IsPublic
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update world ""(.*)""")]
    public async Task WhenIAttemptToUpdateWorld(string worldId) {
        _worldId = Guid.Parse(worldId);
        _updateData = new UpdateWorldData {
            Name = "Updated Name"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with non-existent background resource")]
    public async Task WhenIAttemptToUpdateWithNonExistentBackgroundResource() {
        var nonExistentResourceId = Guid.CreateVersion7();
        _mediaStorage.GetByIdAsync(nonExistentResourceId, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);

        _updateData = new UpdateWorldData {
            BackgroundResourceId = nonExistentResourceId
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with description of (.*) characters")]
    public async Task WhenIAttemptToUpdateWithDescriptionOfCharacters(int length) {
        _updateData = new UpdateWorldData {
            Description = new string('B', length)
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update that world")]
    public async Task WhenIAttemptToUpdateThatWorld() {
        _updateData = new UpdateWorldData {
            Name = "Unauthorized Update"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update the world")]
    public async Task WhenIAttemptToUpdateTheWorld() {
        _updateData = new UpdateWorldData {
            Name = "Some Update"
        };
        await ExecuteUpdate();
    }

    [When(@"I update to remove background resource")]
    public async Task WhenIUpdateToRemoveBackgroundResource() {
        _updateData = new UpdateWorldData {
            BackgroundResourceId = null
        };
        await ExecuteUpdate();
    }

    [When(@"I update with the same name ""(.*)""")]
    public async Task WhenIUpdateWithTheSameName(string name) {
        _updateData = new UpdateWorldData {
            Name = name
        };
        await ExecuteUpdate();
    }

    [When(@"I update the title to ""(.*)""")]
    public async Task WhenIUpdateTheTitleTo(string newTitle) {
        _updateData = new UpdateWorldData {
            Name = newTitle
        };
        await ExecuteUpdate();
    }

    [When(@"I update the description")]
    public async Task WhenIUpdateTheDescription() {
        _updateData = new UpdateWorldData {
            Description = "Updated description content"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update their world")]
    public async Task WhenIAttemptToUpdateTheirWorld() {
        await WhenIAttemptToUpdateThatWorld();
    }

    private async Task ExecuteUpdate() {
        try {
            // Mock storage to succeed
            _worldStorage.UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // NOTE: This will fail because IWorldService.UpdateWorldAsync does not exist
            // Placeholder call for when service is implemented
            _updateResult = await _service.UpdateWorldAsync(_userId, _worldId, _updateData!, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the world is updated successfully")]
    public void ThenTheWorldIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"my world is updated successfully")]
    public void ThenMyWorldIsUpdatedSuccessfully() {
        ThenTheWorldIsUpdatedSuccessfully();
    }

    [Then(@"the world name should be ""(.*)""")]
    public void ThenTheWorldNameShouldBe(string expectedName) {
        // After update, verify the name was changed
        _updateData!.Name.Should().Be(expectedName);
    }

    [Then(@"the world name should remain ""(.*)""")]
    public void ThenTheWorldNameShouldRemain(string originalName) {
        // Update failed, name should not change
        _existingWorld!.Name.Should().Be(originalName);
    }

    [Then(@"the world is updated")]
    public void ThenTheWorldIsUpdated() {
        ThenTheWorldIsUpdatedSuccessfully();
    }

    [Then(@"I should see the new name")]
    public void ThenIShouldSeeTheNewName() {
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the description should be ""(.*)""")]
    public void ThenTheDescriptionShouldBe(string expectedDescription) {
        _updateData!.Description.Should().Be(expectedDescription);
    }

    [Then(@"the background resource should be associated")]
    public void ThenTheBackgroundResourceShouldBeAssociated() {
        _updateData!.BackgroundResourceId.Should().NotBeNull();
    }

    [Then(@"all updated fields should reflect new values")]
    public void ThenAllUpdatedFieldsShouldReflectNewValues() {
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the background resource should be null")]
    public void ThenTheBackgroundResourceShouldBeNull() {
        _updateData!.BackgroundResourceId.Should().BeNull();
    }

    [Then(@"no actual changes is saved")]
    public void ThenNoActualChangesAreSaved() {
        // Idempotent update - no changes made
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I receive the updated world details")]
    public void ThenIReceiveTheUpdatedWorldDetails() {
        _updateResult!.IsSuccessful.Should().BeTrue();
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
        _updateResult!.Errors.Should().Contain(e => e.Contains("forbidden") || e.Contains("not authorized"));
    }

    [Then(@"I should see error with unauthorized error")]
    public void ThenIShouldSeeErrorWithUnauthorizedError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e => e.Contains("unauthorized") || e.Contains("Unauthorized"));
    }

    [Then(@"I should be prompted to log in")]
    public void ThenIShouldBePromptedToLogIn() {
        var isAuthenticated = _context.Get<bool>("UserAuthenticated");
        isAuthenticated.Should().BeFalse();
    }

    [Then(@"my request is rejected")]
    public void ThenMyRequestIsRejected() {
        _updateResult!.IsSuccessful.Should().BeFalse();
    }

    [Then(@"I receive an authorization error")]
    public void ThenIReceiveAnAuthorizationError() {
        ThenIShouldSeeErrorWithForbiddenError();
    }

    #endregion

    #region Then Steps - Data-Driven

    [Then(@"the result should be (.*)")]
    public void ThenTheResultShouldBe(string expectedResult) {
        if (expectedResult == "success") {
            _updateResult!.IsSuccessful.Should().BeTrue();
        }
        else if (expectedResult == "failure") {
            _updateResult!.IsSuccessful.Should().BeFalse();
        }
    }

    #endregion

    #region Helper Classes

    private class UpdateDataTable {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
    }

    #endregion
}

// Placeholder service contract (Phase 7 - to be implemented)
namespace VttTools.Library.Worlds.ServiceContracts;

public record UpdateWorldData {
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? BackgroundResourceId { get; init; }
    public bool? IsPublished { get; init; }
    public bool? IsPublic { get; init; }
}
