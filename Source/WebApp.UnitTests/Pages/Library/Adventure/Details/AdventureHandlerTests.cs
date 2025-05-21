#pragma warning disable IDE0079 // Remove unnecessary suppression
#pragma warning disable BL0005
#pragma warning restore IDE0079 // Remove unnecessary suppression
namespace VttTools.WebApp.Pages.Library.Adventure.Details;

public class AdventureHandlerTests
    : ComponentTestContext {
    private readonly AdventurePage _page = Substitute.For<AdventurePage>();
    private readonly Guid _adventureId = Guid.NewGuid();
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();

    public AdventureHandlerTests() {
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
        _page.Id = _adventureId;
    }

    [Fact]
    public async Task LoadAdventureAsync_WithValidId_ReturnsTrue_AndPopulatesState() {
        // Arrange
        var handler = CreateHandler();
        var adventure = new AdventureInput {
            Name = "Test Adventure",
            Description = "Test Description",
            Type = AdventureType.OpenWorld,
            IsPublished = true,
            IsPublic = true,
        };
        _client.GetAdventureByIdAsync(_adventureId).Returns(adventure);
        _page.Action = "view";

        // Act
        var result = await handler.LoadAdventureAsync(_client);

        // Assert
        result.Should().BeTrue();
        _page.Input.Name.Should().Be("Test Adventure");
        _page.Input.Description.Should().Be("Test Description");
        _page.Input.Type.Should().Be(AdventureType.OpenWorld);
        _page.Input.IsPublished.Should().BeTrue();
        _page.Input.IsPublic.Should().BeTrue();
        _page.State.Mode.Should().Be(DetailsPageMode.View);
    }

    [Fact]
    public async Task LoadAdventureAsync_WithInvalidId_ReturnsFalse() {
        // Arrange
        var handler = CreateHandler();
        _client.GetAdventureByIdAsync(_adventureId).Returns((AdventureInput?)null);
        _page.Action = "view";

        // Act
        var result = await handler.LoadAdventureAsync(_client);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task LoadAdventureAsync_InCloneMode_AppendsCloneSuffix_AndChangesVisibility() {
        // Arrange
        var handler = CreateHandler();
        var adventure = new AdventureInput {
            Name = "Test Adventure",
            Description = "Test Description",
            Type = AdventureType.OpenWorld,
            IsPublished = true,
            IsPublic = true,
        };
        _client.GetAdventureByIdAsync(_adventureId).Returns(adventure);
        _page.Action = "clone";

        // Act
        var result = await handler.LoadAdventureAsync(_client);

        // Assert
        result.Should().BeTrue();
        _page.Input.Name.Should().Be("Test Adventure (Copy)");
        _page.Input.IsPublished.Should().BeFalse();
        _page.Input.IsPublic.Should().BeFalse();
        _page.State.Mode.Should().Be(DetailsPageMode.Clone);
    }

    [Fact]
    public async Task SaveChangesAsync_InCreateMode_CallsCreateEndpoint() {
        // Arrange
        var handler = CreateHandler();
        _page.Action = "create";
        _page.State.Mode = DetailsPageMode.Create;
        _page.Input.Name = "New Adventure";
        _page.Input.Description = "New Description";
        _page.Input.Type = AdventureType.DungeonCrawl;
        _page.Input.IsPublished = true;
        _page.Input.IsPublic = false;

        var createdAdventure = new AdventureListItem {
            Id = Guid.NewGuid(),
            Name = "New Adventure",
            Description = "New Description",
            Type = AdventureType.DungeonCrawl,
            IsPublished = true,
            IsPublic = false,
        };

        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>())
            .Returns(Result.Success(createdAdventure));

        // Act
        await handler.SaveChangesAsync();

        // Assert
        await _client.Received(1).CreateAdventureAsync(Arg.Any<CreateAdventureRequest>());

        _page.NavigationManager.Received(1).NavigateTo($"/adventure/view/{createdAdventure.Id}");
    }

    [Fact]
    public async Task SaveChangesAsync_InEditMode_CallsUpdateEndpoint() {
        // Arrange
        var handler = CreateHandler();
        _page.Action = "edit";
        _page.State.Mode = DetailsPageMode.Edit;
        _page.Id = _adventureId;

        // Set up original values
        _page.State.Original.Name = "Original Name";
        _page.State.Original.Description = "Original Description";
        _page.State.Original.Type = AdventureType.OpenWorld;
        _page.State.Original.IsPublished = false;
        _page.State.Original.IsPublic = false;

        // Set up changed values
        _page.Input.Name = "Updated Name";
        _page.Input.Description = "Updated Description";
        _page.Input.Type = AdventureType.DungeonCrawl;
        _page.Input.IsPublished = true;
        _page.Input.IsPublic = true;

        _client.UpdateAdventureAsync(_adventureId, Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Success());

        // Act
        await handler.SaveChangesAsync();

        // Assert
        await _client.Received(1).UpdateAdventureAsync(
            Arg.Is(_adventureId),
            Arg.Is<UpdateAdventureRequest>(req =>
                req.Name.IsSet && req.Name.Value == "Updated Name" &&
                req.Description.IsSet && req.Description.Value == "Updated Description" &&
                req.Type.IsSet && req.Type.Value == AdventureType.DungeonCrawl &&
                req.IsPublished.IsSet && req.IsPublished.Value &&
                req.IsPublic.IsSet && req.IsPublic.Value));

        _page.NavigationManager.Received(1).NavigateTo($"/adventure/view/{_adventureId}");
    }

    [Fact]
    public async Task SaveChangesAsync_WithValidationErrors_DoesNotNavigate_AndSetsErrors() {
        // Arrange
        var handler = CreateHandler();
        _page.Action = "create";
        _page.State.Mode = DetailsPageMode.Create;

        var error = new Error("Name", "Name is required");
        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>())
            .Returns(Result.Failure([error]));

        // Act
        await handler.SaveChangesAsync();

        // Assert
        _page.State.Errors.Should().Contain(error);
        _page.NavigationManager.DidNotReceive().NavigateTo(Arg.Any<string>());
    }

    [Fact]
    public async Task SaveChangesAndContinueAsync_InCreateMode_RedirectsToEditMode() {
        // Arrange
        var handler = CreateHandler();
        _page.Action = "create";
        _page.State.Mode = DetailsPageMode.Create;
        _page.Input.Name = "New Adventure";
        _page.Input.Description = "New Description";

        var createdId = Guid.NewGuid();
        var createdAdventure = new AdventureListItem {
            Id = createdId,
            Name = "New Adventure",
            Description = "New Description",
        };

        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>())
            .Returns(Result.Success(createdAdventure));

        // Act
        await handler.SaveChangesAsync();

        // Assert
        _page.NavigationManager.Received(1).NavigateTo($"/adventure/edit/{createdId}");
    }

    [Fact]
    public async Task SaveChangesAndContinueAsync_InEditMode_RefreshesData() {
        // Arrange
        var handler = CreateHandler();
        _page.Action = "edit";
        _page.State.Mode = DetailsPageMode.Edit;
        _page.Id = _adventureId;

        // Setup original and changed values
        _page.State.Original.Name = "Original Name";
        _page.Input.Name = "Updated Name";

        _client.UpdateAdventureAsync(_adventureId, Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Success());

        var updatedAdventure = new AdventureInput {
            Name = "Updated Name",
            Description = "Updated Description",
            Type = AdventureType.OpenWorld,
        };
        _client.GetAdventureByIdAsync(_adventureId).Returns(updatedAdventure);

        // Act
        await handler.SaveChangesAsync();

        // Assert
        await _client.Received(1).UpdateAdventureAsync(
            Arg.Is(_adventureId),
            Arg.Any<UpdateAdventureRequest>());
        await _client.Received(1).GetAdventureByIdAsync(_adventureId);
        _page.NavigationManager.DidNotReceive().NavigateTo(Arg.Any<string>());
    }

    [Fact]
    public void DiscardChanges_ResetsInputToOriginalValues() {
        // Arrange
        var handler = CreateHandler();

        // Set original values
        _page.State.Original.Name = "Original Name";
        _page.State.Original.Description = "Original Description";
        _page.State.Original.Type = AdventureType.OpenWorld;
        _page.State.Original.IsPublished = true;
        _page.State.Original.IsPublic = false;

        // Set changed values
        _page.Input.Name = "Changed Name";
        _page.Input.Description = "Changed Description";
        _page.Input.Type = AdventureType.DungeonCrawl;
        _page.Input.IsPublished = false;
        _page.Input.IsPublic = true;

        // Act
        handler.DiscardChanges();

        // Assert
        _page.Input.Name.Should().Be("Original Name");
        _page.Input.Description.Should().Be("Original Description");
        _page.Input.Type.Should().Be(AdventureType.OpenWorld);
        _page.Input.IsPublished.Should().BeTrue();
        _page.Input.IsPublic.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAdventureAsync_CallsDeleteEndpoint_AndNavigatesBack() {
        // Arrange
        var handler = CreateHandler();
        _page.Id = _adventureId;
        _client.DeleteAdventureAsync(_adventureId).Returns(true);

        // Act
        await handler.DeleteAdventureAsync();

        // Assert
        await _client.Received(1).DeleteAdventureAsync(_adventureId);
        _page.NavigationManager.Received(1).NavigateTo("/adventures");
    }

    [Fact]
    public async Task DeleteAdventureAsync_WhenDeleteFails_DoesNotNavigate() {
        // Arrange
        var handler = CreateHandler();
        _page.Id = _adventureId;
        _client.DeleteAdventureAsync(_adventureId).Returns(false);

        // Act
        await handler.DeleteAdventureAsync();

        // Assert
        await _client.Received(1).DeleteAdventureAsync(_adventureId);
        _page.NavigationManager.DidNotReceive().NavigateTo(Arg.Any<string>());
    }

    private AdventureHandler CreateHandler() {
        EnsureAuthenticated();
        var handler = new AdventureHandler(_page);
        return handler;
    }
}
