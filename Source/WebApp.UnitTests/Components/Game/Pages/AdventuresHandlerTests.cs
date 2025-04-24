namespace VttTools.WebApp.Components.Game.Pages;

public class AdventuresHandlerTests {
    private readonly IGameServiceClient _client = Substitute.For<IGameServiceClient>();
    private readonly Adventures.Handler _handler = new();

    [Fact]
    public async Task InitializeAsync_LoadsAdventures_And_ReturnsPageState() {
        // Arrange
        var adventures = new[] {
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1", Visibility = Visibility.Public },
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 2", Visibility = Visibility.Private },
                               };

        _client.GetAdventuresAsync().Returns(adventures);

        // Act
        var state = await _handler.InitializeAsync(_client);

        // Assert
        state.Should().NotBeNull();
        state.Adventures.Should().BeEquivalentTo(adventures);
        await _client.Received(1).GetAdventuresAsync();
    }

    [Fact]
    public async Task LoadAdventuresAsync_UpdatesStateWithAdventures() {
        // Arrange
        var state = new Adventures.PageState();
        var adventures = new[] {
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1", Visibility = Visibility.Public },
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 2", Visibility = Visibility.Private },
                               };

        _client.GetAdventuresAsync().Returns(adventures);

        // Act
        await _handler.LoadAdventuresAsync(state);

        // Assert
        state.Adventures.Should().BeEquivalentTo(adventures);
        await _client.Received(1).GetAdventuresAsync();
    }

    [Fact]
    public async Task CreateAdventureAsync_WithValidInput_CreatesAdventureAndResetsInput() {
        // Arrange
        var state = new Adventures.PageState {
            Input = new() {
                Name = "New Adventure",
                Visibility = Visibility.Private,
            },
        };

        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>())
            .Returns(Result.Success());

        var adventures = new[] { new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1" } };
        _client.GetAdventuresAsync().Returns(adventures);

        // Act
        await _handler.CreateAdventureAsync(state);

        // Assert
        await _client.Received(1).CreateAdventureAsync(Arg.Is<CreateAdventureRequest>(r =>
            r.Name == "New Adventure" && r.Visibility == Visibility.Private));

        state.Input.Name.Should().BeEmpty();
        state.Input.Visibility.Should().Be(Visibility.Hidden);
        state.Adventures.Should().BeEquivalentTo(adventures);
    }

    [Fact]
    public async Task DeleteAdventureAsync_RemovesAdventureAndReloadsAdventures() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var state = new Adventures.PageState();

        var adventuresAfterDelete = new[] { new Adventure { Id = Guid.NewGuid(), Name = "Adventure 2" } };
        _client.GetAdventuresAsync().Returns(adventuresAfterDelete);

        // Act
        await _handler.DeleteAdventureAsync(state, adventureId);

        // Assert
        await _client.Received(1).DeleteAdventureAsync(adventureId);
        await _client.Received(1).GetAdventuresAsync();
        state.Adventures.Should().BeEquivalentTo(adventuresAfterDelete);
    }

    [Fact]
    public void StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var state = new Adventures.PageState();
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
            Name = "Adventure to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        Adventures.Handler.StartEdit(state, adventure);

        // Assert
        state.IsEditing.Should().BeTrue();
        state.EditingAdventureId.Should().Be(adventure.Id);
        state.Input.Name.Should().Be(adventure.Name);
        state.Input.Visibility.Should().Be(adventure.Visibility);
    }

    [Fact]
    public void CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var state = new Adventures.PageState {
            IsEditing = true,
            EditingAdventureId = Guid.NewGuid(),
        };

        // Act
        Adventures.Handler.CancelEdit(state);

        // Assert
        state.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesAdventureAndReloadsAdventures() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var state = new Adventures.PageState {
            IsEditing = true,
            EditingAdventureId = adventureId,
            Input = new() {
                Name = "Updated Adventure",
                Visibility = Visibility.Public,
            },
        };

        _client.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>())
            .Returns(Result.Success());

        var adventures = new[] {
            new Adventure { Id = adventureId, Name = "Updated Adventure", Visibility = Visibility.Public },
                               };
        _client.GetAdventuresAsync().Returns(adventures);

        // Act
        await _handler.SaveEditAsync(state);

        // Assert
        await _client.Received(1).UpdateAdventureAsync(
            adventureId,
            Arg.Is<UpdateAdventureRequest>(r =>
                r.Name == "Updated Adventure" && r.Visibility == Visibility.Public)
        );

        state.IsEditing.Should().BeFalse();
        state.Adventures.Should().BeEquivalentTo(adventures);
    }

    [Fact]
    public async Task CloneAdventureAsync_ClonesAdventureAndReloadsAdventures() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var state = new Adventures.PageState();

        _client.CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>()).Returns(Result.Success());

        var adventuresAfterClone = new[] {
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1" },
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1 (Copy)" },
                                         };
        _client.GetAdventuresAsync().Returns(adventuresAfterClone);

        // Act
        await _handler.CloneAdventureAsync(state, adventureId);

        // Assert
        await _client.Received(1).CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>());
        await _client.Received(1).GetAdventuresAsync();
        state.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }
}