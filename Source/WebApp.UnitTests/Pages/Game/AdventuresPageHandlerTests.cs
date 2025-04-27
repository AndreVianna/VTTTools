namespace VttTools.WebApp.Pages.Game;

public class AdventuresPageHandlerTests {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly AdventuresPage.Handler _handler;
    private readonly Adventure[] _adventures = [
        new() { Name = "Adventure 1", Visibility = Visibility.Public },
        new() { Name = "Adventure 2", Visibility = Visibility.Private },
    ];

    public AdventuresPageHandlerTests() {
        _handler = new(_service);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAdventures_And_ReturnsPageState() {
        // Arrange
        _service.GetAdventuresAsync().Returns(_adventures);

        // Act
        var handler = await AdventuresPage.Handler.InitializeAsync(_service);

        // Assert
        handler.Should().NotBeNull();
        handler.State.Adventures.Should().BeEquivalentTo(_adventures);
    }

    [Fact]
    public async Task CreateAdventureAsync_WithValidInput_CreatesAdventureAndResetsInput() {
        // Arrange
        _handler.State.CreateInput = new() {
            Name = "New Adventure",
            Visibility = Visibility.Private,
        };
        var newAdventure = new Adventure {
            Name = "New Adventure",
            Visibility = Visibility.Private,
        };
        var adventuresAfterCreate = new[] { newAdventure };

        _service.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        await _handler.CreateAdventureAsync();

        // Assert
        _handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterCreate);
    }

    [Fact]
    public async Task DeleteAdventureAsync_RemovesAdventureAndReloadsAdventures() {
        // Arrange
        var adventureId = Guid.NewGuid();

        var adventuresAfterDelete = Array.Empty<Adventure>();

        // Act
        await _handler.DeleteAdventureAsync(adventureId);

        // Assert
        _handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterDelete);
    }

    [Fact]
    public async Task CloneAdventureAsync_ClonesAdventureAndReloadsAdventures() {
        // Arrange
        var adventureId = Guid.NewGuid();
        _handler.State.Adventures = [new Adventure { Id = adventureId, Name = "Adventure 1" }];
        var clonedAdventure = new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1 (Copy)" };
        var adventuresAfterClone = new[] {
            new Adventure { Id = adventureId, Name = "Adventure 1" },
            clonedAdventure,
        };

        _service.CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        await _handler.CloneAdventureAsync(adventureId);

        // Assert
        _handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }

    [Fact]
    public void StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var adventure = new Adventure {
            Name = "Adventure to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        _handler.StartEdit(adventure);

        // Assert
        _handler.State.ShowEditDialog.Should().BeTrue();
        _handler.State.EditInput.Id.Should().Be(adventure.Id);
        _handler.State.EditInput.Name.Should().Be(adventure.Name);
        _handler.State.EditInput.Visibility.Should().Be(adventure.Visibility);
    }

    [Fact]
    public void CancelEdit_ResetIsEditingFlag() {
        // Arrange
        _handler.State.ShowEditDialog = true;
        _handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };

        // Act
        _handler.CancelEdit();

        // Assert
        _handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesAdventureAndReloadsAdventures() {
        // Arrange
        _handler.State.ShowEditDialog = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new Adventure {
            Id = adventureId,
            Name = "Adventure 1",
            Visibility = Visibility.Hidden,
        };
        var adventuresBeforeEdit = new List<Adventure> { adventureBeforeEdit };
        _handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        _handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        _handler.State.Adventures = adventuresBeforeEdit;
        var adventuresAfterEdit = new[] {
            new Adventure { Id = adventureId, Name = "Updated Adventure", Visibility = Visibility.Public },
        };

        _service.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Success());

        // Act
        await _handler.SaveEditAsync();

        // Assert
        _handler.State.ShowEditDialog.Should().BeFalse();
        _handler.State.Adventures.Should().BeEquivalentTo(adventuresAfterEdit);
    }

    [Fact]
    public async Task SaveEditAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        _handler.State.ShowEditDialog = true;
        var adventureId = Guid.NewGuid();
        var adventureBeforeEdit = new Adventure {
            Id = adventureId,
            Name = "Adventure 1",
            Visibility = Visibility.Hidden,
        };
        var adventuresBeforeEdit = new List<Adventure> { adventureBeforeEdit };
        _handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        _handler.State.EditInput = new() {
            Id = adventureId,
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };
        _handler.State.Adventures = adventuresBeforeEdit;

        _service.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await _handler.SaveEditAsync();

        // Assert
        _handler.State.ShowEditDialog.Should().BeTrue();
        _handler.State.EditInput.Errors.Should().NotBeEmpty();
        _handler.State.EditInput.Errors[0].Message.Should().Be("Some errors.");
        _handler.State.Adventures.Should().BeEquivalentTo(adventuresBeforeEdit);
    }
}