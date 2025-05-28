using VttTools.WebApp.Server.Pages.Assets;

namespace VttTools.WebApp.Pages.Assets;

public class AssetsPageTests
    : ComponentTestContext {
    private readonly IAssetsHttpClient _serverHttpClient = Substitute.For<IAssetsHttpClient>();
    private readonly AssetListItem[] _defaultAssets = [
        new() {
            Name = "Asset 1",
            Type = AssetType.Character,
        },
        new() {
            Name = "Asset 2",
            Type = AssetType.Creature,
        }];

    public AssetsPageTests() {
        Services.AddScoped<IAssetsHttpClient>(_ => _serverHttpClient);
        _serverHttpClient.GetAssetsAsync().Returns(_defaultAssets);
        EnsureAuthenticated();
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _serverHttpClient.GetAssetsAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultAssets));

        // Act
        var cut = RenderComponent<AssetsPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Assets</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoAssets_RendersAsEmpty() {
        // Arrange
        _serverHttpClient.GetAssetsAsync().Returns([]);

        // Act
        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Assets</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        cut.Markup.Should().Contain("You don't have any assets yet. Create a new one to get started!");
    }

    [Fact]
    public void WhenIsReady_RendersAssetList() {
        // Act
        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Assets</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var rows = cut.FindAll("#assets-table tr");
        rows.Count.Should().Be(3);

        cut.Find("#assets-name-header").TextContent.Should().Be(nameof(Asset.Name));
        cut.Find("#assets-type-header").TextContent.Should().Be(nameof(Asset.Type));
        cut.Find("#assets-action-header").TextContent.Should().Be("Actions");

        cut.Find($"#asset-{_defaultAssets[0].Id}-name").TextContent.Should().Be(_defaultAssets[0].Name);
        cut.Find($"#asset-{_defaultAssets[0].Id}-type").TextContent.Should().Be(_defaultAssets[0].Type.ToString());
        cut.Find($"#asset-{_defaultAssets[0].Id}-actions").TextContent.Should().Be("Delete");

        cut.Find($"#asset-{_defaultAssets[1].Id}-name").TextContent.Should().Be(_defaultAssets[1].Name);
        cut.Find($"#asset-{_defaultAssets[1].Id}-type").TextContent.Should().Be(_defaultAssets[1].Type.ToString());
        cut.Find($"#asset-{_defaultAssets[1].Id}-actions").TextContent.Should().Be("Delete");
    }

    [Fact]
    public void WhenCreateButtonIsClicked_CreatesAssetMethod() {
        // Arrange
        var newAsset = new AssetListItem {
            Name = "New Asset",
            Type = AssetType.NPC,
        };
        _serverHttpClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        cut.Find("#name-input").Change(newAsset.Name);
        cut.Find("#type-input").Change(newAsset.Type.ToString());

        // Act
        cut.Find("#create-asset").Click();

        // Assert
        var rows = cut.FindAll("#assets-table tr");
        rows.Count.Should().Be(4);
        cut.Find($"#asset-{newAsset.Id}-name").TextContent.Should().Be(newAsset.Name);
        cut.Find($"#asset-{newAsset.Id}-type").TextContent.Should().Be(newAsset.Type.ToString());
        cut.Find($"#asset-{newAsset.Id}-actions").TextContent.Should().Be("Delete");
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesAsset() {
        // Arrange
        var assetId = _defaultAssets[0].Id;
        _serverHttpClient.DeleteAssetAsync(Arg.Any<Guid>()).Returns(true);

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.Find($"#delete-asset-{assetId}").Click();

        // Assert
        var rows = cut.FindAll("#assets-table tr");
        rows.Count.Should().Be(2);
    }
}