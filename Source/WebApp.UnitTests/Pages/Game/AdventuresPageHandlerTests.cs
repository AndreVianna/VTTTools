namespace VttTools.WebApp.Pages.Game;

public class AdventuresPageHandlerTests {
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task InitializeAsync_LoadsAdventures_And_ReturnsPageState() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.Adventures.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAdventureAsync_WithValidInput_CreatesAdventureAndResetsInput() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.CreateInput = new() {
            Name = "New Adventure",
            Visibility = Visibility.Private,
        };
        var newAdventure = new Adventure {
            Name = "New Adventure",
            Visibility = Visibility.Private,
        };

        _service.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        await handler.SaveCreatedAdventure();

        // Assert
        handler.State.Adventures.Should().HaveCount(3);
    }

    [Fact]
    public async Task DeleteAdventureAsync_RemovesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventureId = handler.State.Adventures[1].Id;
        _service.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAdventure(adventureId);

        // Assert
        handler.State.Adventures.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneAdventureAsync_ClonesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventureId = Guid.NewGuid();
        handler.State.Adventures = [new Adventure { Id = adventureId, Name = "Adventure 1" }];
        var clonedAdventure = new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1 (Copy)" };
        var adventuresAfterClone = new[] {
            new Adventure { Id = adventureId, Name = "Adventure 1" },
            clonedAdventure,
        };

        _service.CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        await handler.CloneAdventure(adventureId);

        // Assert
        handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }

    [Fact]
    public async Task StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventure = new Adventure {
            Name = "Adventure to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        handler.StartAdventureEditing(adventure);

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Id.Should().Be(adventure.Id);
        handler.State.EditInput.Name.Should().Be(adventure.Name);
        handler.State.EditInput.Visibility.Should().Be(adventure.Visibility);
    }

    [Fact]
    public async Task CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.IsEditing = true;
        handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };

        // Act
        handler.EndAdventureEditing();

        // Assert
        handler.State.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.IsEditing = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new Adventure {
            Id = adventureId,
            Name = "Adventure 1",
            Visibility = Visibility.Hidden,
        };
        var adventuresBeforeEdit = new List<Adventure> { adventureBeforeEdit };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        handler.State.Adventures = adventuresBeforeEdit;
        var adventuresAfterEdit = new[] {
            new Adventure { Id = adventureId, Name = "Updated Adventure", Visibility = Visibility.Public },
        };

        _service.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
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
        var handler = await CreateInitializedHandler();
        handler.State.IsEditing = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new Adventure {
            Id = adventureId,
            Name = "Adventure 1",
            Visibility = Visibility.Hidden,
        };
        var adventuresBeforeEdit = new List<Adventure> { adventureBeforeEdit };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        handler.State.Adventures = adventuresBeforeEdit;

        _service.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await handler.SaveEditedAdventure();

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Errors.Should().NotBeEmpty();
        handler.State.EditInput.Errors[0].Message.Should().Be("Some errors.");
        handler.State.Adventures.Should().BeEquivalentTo(adventuresBeforeEdit);
    }

    private async Task<AdventuresPageHandler> CreateInitializedHandler() {
        var adventures = new[] {
            new Adventure { Name = "Adventure 1", Visibility = Visibility.Public },
            new Adventure { Name = "Adventure 2", Visibility = Visibility.Private },
        };
        var handler = new AdventuresPageHandler();
        _service.GetAdventuresAsync().Returns(adventures);
        await handler.InitializeAsync(_service);
        return handler;
    }
}