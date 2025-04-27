namespace VttTools.WebApp.Pages.Game;

public class AssetsPageHandlerTests {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly AssetsPage.Handler _handler;
    private readonly Asset[] _assets = [
        new() { Name = "Asset 1",
                Type = AssetType.Character,
                Source = "https://example.com/asset1",
                Visibility = Visibility.Public,
         },
        new() { Name = "Asset 2",
                Type = AssetType.NPC,
                Source = "https://example.com/asset2",
                Visibility = Visibility.Private,
        },
    ];

    public AssetsPageHandlerTests() {
        _handler = new(_service);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAssets_And_ReturnsHandler() {
        // Arrange
        _service.GetAssetsAsync().Returns(_assets);

        // Act
        var handler = await AssetsPage.Handler.InitializeAsync(_service);

        // Assert
        handler.Should().NotBeNull();
        handler.State.Assets.Should().BeEquivalentTo(_assets);
    }

    [Fact]
    public async Task CreateAssetAsync_WithValidInput_CreatesAssetAndResetsInput() {
        // Arrange
        _handler.State.Input = new() {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };
        var newAsset = new Asset {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };
        var assetsAfterCreate = new[] { newAsset };

        _service.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        // Act
        await _handler.CreateAssetAsync();

        // Assert
        _handler.State.Assets.Should().BeEquivalentTo(assetsAfterCreate);
    }

    [Fact]
    public async Task DeleteAssetAsync_RemovesAssetAndReloadsAssets() {
        // Arrange
        var assetId = Guid.NewGuid();

        var assetsAfterDelete = Array.Empty<Asset>();

        // Act
        await _handler.DeleteAssetAsync(assetId);

        // Assert
        _handler.State.Assets.Should().BeEquivalentTo(assetsAfterDelete);
    }
}