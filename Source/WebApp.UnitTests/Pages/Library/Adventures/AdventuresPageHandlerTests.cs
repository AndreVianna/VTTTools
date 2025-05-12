namespace VttTools.WebApp.Pages.Library.Adventures;

public class AdventuresPageHandlerTests
    : ComponentTestContext {
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();

    public AdventuresPageHandlerTests() {
        var adventures = new[] {
            new AdventureListItem {
                Name = "Adventure 1",
                Description = "Adventure 1 Description",
                Type = AdventureType.Survival,
                ImagePath = "path/to/image1.png",
                IsVisible = true,
                IsPublic = true,
            },
            new AdventureListItem {
                Name = "Adventure 2",
                Description = "Adventure 2 Description",
                Type = AdventureType.OpenWorld,
                ImagePath = "path/to/image2.png",
                IsVisible = false,
                IsPublic = false,
            },
        };
        _client.GetAdventuresAsync().Returns(adventures);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAdventures_And_ReturnsPageState() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.Adventures.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAdventureAsync_WithValidInput_CreatesAdventureAndResetsInput() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.CreateInput = new() {
            Name = "New Adventure",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image1.png",
            IsVisible = true,
            IsPublic = true,
        };
        var newAdventure = new AdventureListItem {
            Name = "New Adventure",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image1.png",
            IsVisible = true,
            IsPublic = true,
        };

        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        await handler.SaveCreatedAdventure();

        // Assert
        handler.State.Adventures.Should().HaveCount(3);
    }

    [Fact]
    public async Task DeleteAdventureAsync_RemovesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = handler.State.Adventures[1].Id;
        _client.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAdventure(adventureId);

        // Assert
        handler.State.Adventures.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneAdventureAsync_ClonesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        handler.State.Adventures = [new AdventureListItem { Id = adventureId, Name = "Adventure 1" }];
        var clonedAdventure = new AdventureListItem { Id = Guid.NewGuid(), Name = "Adventure 1 (Copy)" };
        var adventuresAfterClone = new[] {
            new AdventureListItem { Id = adventureId, Name = "Adventure 1" },
            new AdventureListItem { Id = clonedAdventure.Id, Name = clonedAdventure.Name },
        };

        _client.CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        await handler.CloneAdventure(adventureId);

        // Assert
        handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }

    [Fact]
    public async Task StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        var adventure = new AdventureInputModel {
            Id = adventureId,
            Name = "Adventure to Edit",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        _client.GetAdventureByIdAsync(Arg.Any<Guid>()).Returns(adventure);
        // Act
        await handler.StartAdventureEditing(adventureId);

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Id.Should().Be(adventure.Id);
        handler.State.EditInput.Name.Should().Be(adventure.Name);
        handler.State.EditInput.Description.Should().Be(adventure.Description);
        handler.State.EditInput.Type.Should().Be(adventure.Type);
        handler.State.EditInput.ImagePath.Should().Be(adventure.ImagePath);
        handler.State.EditInput.IsVisible.Should().Be(adventure.IsVisible);
        handler.State.EditInput.IsPublic.Should().Be(adventure.IsPublic);
        handler.State.EditInput.Errors.Should().BeEmpty();
        handler.State.EditInput.CampaignId.Should().Be(adventure.CampaignId);
        handler.State.EditInput.OwnerId.Should().Be(adventure.OwnerId);
        handler.State.EditInput.Scenes.Should().BeEquivalentTo(adventure.Scenes);
    }

    [Fact]
    public async Task StartEdit_WithInvalidId_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        var adventure = new AdventureInputModel {
            Id = adventureId,
            Name = "Adventure to Edit",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        _client.GetAdventureByIdAsync(Arg.Any<Guid>()).Returns((AdventureInputModel?)null);
        // Act
        await handler.StartAdventureEditing(adventureId);

        // Assert
        handler.State.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Adventure",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };

        // Act
        handler.EndAdventureEditing();

        // Assert
        handler.State.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new AdventureListItem {
            Id = adventureId,
            Name = "Adventure 1",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        var adventuresBeforeEdit = new List<AdventureListItem> { adventureBeforeEdit };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        handler.State.Adventures = adventuresBeforeEdit;
        var adventuresAfterEdit = new[] {
            new AdventureListItem {
                Id = adventureId,
                Name = "Updated Adventure",
                Description = "Adventure Description",
                Type = AdventureType.Survival,
                ImagePath = "path/to/image.png",
                IsVisible = true,
                IsPublic = true,
            },
        };

        _client.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Success());

        // Act
        await handler.SaveEditedAdventure();

        // Assert
        handler.State.IsEditing.Should().BeFalse();
        handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterEdit);
    }

    [Fact]
    public async Task SaveEditAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new AdventureListItem {
            Id = adventureId,
            Name = "Adventure 1",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        var adventuresBeforeEdit = new List<AdventureListItem> { adventureBeforeEdit };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Description = "Adventure Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image.png",
            IsVisible = true,
            IsPublic = true,
        };
        handler.State.Adventures = adventuresBeforeEdit;

        _client.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await handler.SaveEditedAdventure();

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Errors.Should().NotBeEmpty();
        handler.State.EditInput.Errors[0].Message.Should().Be("Some errors.");
        handler.State.Adventures.Should().BeEquivalentTo(adventuresBeforeEdit);
    }

    private async Task<AdventuresHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var page = Substitute.For<IAuthenticatedPage>();
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new AdventuresHandler(page);
        if (isConfigured)
            await handler.LoadAdventuresAsync(_client);
        return handler;
    }
}