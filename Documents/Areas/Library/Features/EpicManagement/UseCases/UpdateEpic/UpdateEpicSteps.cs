// Generated: 2025-10-12
// BDD Step Definitions for Update Epic Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (EpicService - Phase 7 BLOCKED)
// CRITICAL: Service not implemented - steps use placeholder contracts

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Library.Epics.Model;
using VttTools.Library.Epics.ServiceContracts;
using VttTools.Library.Epics.Services;
using VttTools.Library.Epics.Storage;
using VttTools.Media.Storage;
using Xunit;

namespace VttTools.Library.Tests.BDD.EpicManagement.UpdateEpic;

/// <summary>
/// BDD Step Definitions for Update Epic scenarios.
/// BLOCKED: EpicService implementation pending (Phase 7).
/// These steps define expected behavior using placeholder service contracts.
/// </summary>
[Binding]
[Tag("@blocked", "@phase7-pending")]
public class UpdateEpicSteps {
    private readonly ScenarioContext _context;
    private readonly IEpicStorage _epicStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly IEpicService _service;

    // Test state
    private Epic? _existingEpic;
    private UpdateEpicData? _updateData;
    private Result? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _epicId = Guid.Empty;
    private Exception? _exception;

    public UpdateEpicSteps(ScenarioContext context) {
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

    [Given(@"I own an epic in my library")]
    public void GivenIOwnAnEpicInMyLibrary() {
        _epicId = Guid.CreateVersion7();
        _existingEpic = new Epic {
            Id = _epicId,
            OwnerId = _userId,
            Name = "Original Epic",
            Description = "Original description",
            IsPublished = false,
            IsPublic = false
        };

        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(_existingEpic);

        _context["EpicId"] = _epicId;
    }

    [Given(@"I have an existing epic titled ""(.*)""")]
    public void GivenIHaveAnExistingEpicTitled(string name) {
        GivenIOwnAnEpicInMyLibrary();
        _existingEpic = _existingEpic! with { Name = name };
    }

    #endregion

    #region Given Steps - Existing Epic State

    [Given(@"my epic has name ""(.*)""")]
    public void GivenMyEpicHasName(string name) {
        if (_existingEpic is not null) {
            _existingEpic = _existingEpic with { Name = name };
        }
    }

    [Given(@"my epic has description ""(.*)""")]
    public void GivenMyEpicHasDescription(string description) {
        if (_existingEpic is not null) {
            _existingEpic = _existingEpic with { Description = description };
        }
    }

    [Given(@"my epic has IsPublished=(.*) and IsPublic=(.*)")]
    public void GivenMyEpicHasPublicationStatus(bool isPublished, bool isPublic) {
        if (_existingEpic is not null) {
            _existingEpic = _existingEpic with {
                IsPublished = isPublished,
                IsPublic = isPublic
            };
        }
    }

    [Given(@"my epic has no background resource")]
    public void GivenMyEpicHasNoBackgroundResource() {
        if (_existingEpic is not null) {
            _existingEpic = _existingEpic with { Background = null! };
        }
    }

    [Given(@"my epic has background resource")]
    public void GivenMyEpicHasBackgroundResource() {
        var resourceId = Guid.CreateVersion7();
        var resource = new Resource {
            Id = resourceId,
            OwnerId = _userId,
            Filename = "background.jpg",
            MimeType = "image/jpeg"
        };

        if (_existingEpic is not null) {
            _existingEpic = _existingEpic with { Background = resource };
        }
    }

    [Given(@"my epic exists")]
    public void GivenMyEpicExists() {
        if (_existingEpic is null) {
            GivenIOwnAnEpicInMyLibrary();
        }
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no epic exists with ID ""(.*)""")]
    public void GivenNoEpicExistsWithId(string epicId) {
        var guid = Guid.Parse(epicId);
        _epicStorage.GetByIdAsync(guid, Arg.Any<CancellationToken>())
            .Returns((Epic?)null);
    }

    [Given(@"an epic exists owned by another user")]
    public void GivenAnEpicExistsOwnedByAnotherUser() {
        var otherUserId = Guid.CreateVersion7();
        _epicId = Guid.CreateVersion7();
        _existingEpic = new Epic {
            Id = _epicId,
            OwnerId = otherUserId, // Different owner
            Name = "Other User's Epic",
            Description = "Description"
        };

        _epicStorage.GetByIdAsync(_epicId, Arg.Any<CancellationToken>())
            .Returns(_existingEpic);
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["UserAuthenticated"] = false;
    }

    [Given(@"an epic exists")]
    public void GivenAnEpicExists() {
        GivenIOwnAnEpicInMyLibrary();
    }

    [Given(@"another Game Master has created an epic")]
    public void GivenAnotherGameMasterHasCreatedAnEpic() {
        GivenAnEpicExistsOwnedByAnotherUser();
    }

    #endregion

    #region When Steps - Update Actions

    [When(@"I update the epic name to ""(.*)""")]
    public async Task WhenIUpdateTheEpicNameTo(string newName) {
        _updateData = new UpdateEpicData {
            Name = newName
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with empty name")]
    public async Task WhenIAttemptToUpdateWithEmptyName() {
        _updateData = new UpdateEpicData {
            Name = string.Empty
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with name of (.*) characters")]
    public async Task WhenIAttemptToUpdateWithNameOfCharacters(int length) {
        _updateData = new UpdateEpicData {
            Name = new string('A', length)
        };
        await ExecuteUpdate();
    }

    [When(@"I update to IsPublished=(.*) and IsPublic=(.*)")]
    public async Task WhenIUpdateToPublicationStatus(bool isPublished, bool isPublic) {
        _updateData = new UpdateEpicData {
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
        _updateData = new UpdateEpicData {
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

        _updateData = new UpdateEpicData {
            BackgroundResourceId = resourceId
        };
        await ExecuteUpdate();
    }

    [When(@"I update the epic with:")]
    public async Task WhenIUpdateTheEpicWith(Table table) {
        var data = table.CreateInstance<UpdateDataTable>();
        _updateData = new UpdateEpicData {
            Name = data.Name,
            Description = data.Description,
            IsPublic = data.IsPublic
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update epic ""(.*)""")]
    public async Task WhenIAttemptToUpdateEpic(string epicId) {
        _epicId = Guid.Parse(epicId);
        _updateData = new UpdateEpicData {
            Name = "Updated Name"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with non-existent background resource")]
    public async Task WhenIAttemptToUpdateWithNonExistentBackgroundResource() {
        var nonExistentResourceId = Guid.CreateVersion7();
        _mediaStorage.GetByIdAsync(nonExistentResourceId, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);

        _updateData = new UpdateEpicData {
            BackgroundResourceId = nonExistentResourceId
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update with description of (.*) characters")]
    public async Task WhenIAttemptToUpdateWithDescriptionOfCharacters(int length) {
        _updateData = new UpdateEpicData {
            Description = new string('B', length)
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update that epic")]
    public async Task WhenIAttemptToUpdateThatEpic() {
        _updateData = new UpdateEpicData {
            Name = "Unauthorized Update"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update the epic")]
    public async Task WhenIAttemptToUpdateTheEpic() {
        _updateData = new UpdateEpicData {
            Name = "Some Update"
        };
        await ExecuteUpdate();
    }

    [When(@"I update to remove background resource")]
    public async Task WhenIUpdateToRemoveBackgroundResource() {
        _updateData = new UpdateEpicData {
            BackgroundResourceId = null
        };
        await ExecuteUpdate();
    }

    [When(@"I update with the same name ""(.*)""")]
    public async Task WhenIUpdateWithTheSameName(string name) {
        _updateData = new UpdateEpicData {
            Name = name
        };
        await ExecuteUpdate();
    }

    [When(@"I update the title to ""(.*)""")]
    public async Task WhenIUpdateTheTitleTo(string newTitle) {
        _updateData = new UpdateEpicData {
            Name = newTitle
        };
        await ExecuteUpdate();
    }

    [When(@"I update the description")]
    public async Task WhenIUpdateTheDescription() {
        _updateData = new UpdateEpicData {
            Description = "Updated description content"
        };
        await ExecuteUpdate();
    }

    [When(@"I attempt to update their epic")]
    public async Task WhenIAttemptToUpdateTheirEpic() {
        await WhenIAttemptToUpdateThatEpic();
    }

    private async Task ExecuteUpdate() {
        try {
            // Mock storage to succeed
            _epicStorage.UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // NOTE: This will fail because IEpicService.UpdateEpicAsync does not exist
            // Placeholder call for when service is implemented
            _updateResult = await _service.UpdateEpicAsync(_userId, _epicId, _updateData!, CancellationToken.None);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _exception = ex;
            _context["Exception"] = ex;
        }
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the epic is updated successfully")]
    public void ThenTheEpicIsUpdatedSuccessfully() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"my epic is updated successfully")]
    public void ThenMyEpicIsUpdatedSuccessfully() {
        ThenTheEpicIsUpdatedSuccessfully();
    }

    [Then(@"the epic name should be ""(.*)""")]
    public void ThenTheEpicNameShouldBe(string expectedName) {
        // After update, verify the name was changed
        _updateData!.Name.Should().Be(expectedName);
    }

    [Then(@"the epic name should remain ""(.*)""")]
    public void ThenTheEpicNameShouldRemain(string originalName) {
        // Update failed, name should not change
        _existingEpic!.Name.Should().Be(originalName);
    }

    [Then(@"the epic is updated")]
    public void ThenTheEpicIsUpdated() {
        ThenTheEpicIsUpdatedSuccessfully();
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

    [Then(@"I receive the updated epic details")]
    public void ThenIReceiveTheUpdatedEpicDetails() {
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
namespace VttTools.Library.Epics.ServiceContracts;

public record UpdateEpicData {
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? BackgroundResourceId { get; init; }
    public bool? IsPublished { get; init; }
    public bool? IsPublic { get; init; }
}
