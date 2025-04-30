namespace VttTools.WebApp.Pages.Game;

public class AssetsPageHandlerTests {
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task InitializeAsync_LoadsAssets_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.Assets.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAssetAsync_WithValidInput_CreatesAssetAndResetsInput() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.Input = new() {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };
        var newAsset = new Asset {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };

        _service.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        // Act
        await handler.SaveCreatedAsset();

        // Assert
        handler.State.Assets.Should().HaveCount(3);
    }

    [Fact]
    public async Task DeleteAssetAsync_RemovesAssetAndReloadsAssets() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var assetId = handler.State.Assets[1].Id;
        _service.DeleteAssetAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAsset(assetId);

        // Assert
        handler.State.Assets.Should().HaveCount(1);
    }

    private async Task<AssetsPageHandler> CreateInitializedHandler() {
        var assets = new[] {
            new Asset { Name = "Asset 1", Visibility = Visibility.Public },
            new Asset { Name = "Asset 2", Visibility = Visibility.Private },
        };
        var handler = new AssetsPageHandler();
        _service.GetAssetsAsync().Returns(assets);
        await handler.InitializeAsync(_service);
        return handler;
    }
}