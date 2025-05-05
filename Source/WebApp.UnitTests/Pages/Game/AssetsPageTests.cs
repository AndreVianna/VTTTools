namespace VttTools.WebApp.Pages.Game;

public class AssetsPageTests
    : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly Asset[] _defaultAssets = [
        new() {
            Name = "Asset 1",
            Type = AssetType.Character,
            Source = "https://example.com/asset1",
            Visibility = Visibility.Public,
        },
        new() {
            Name = "Asset 2",
            Type = AssetType.Creature,
            Source = "https://example.com/asset2",
            Visibility = Visibility.Private,
        }];

    public AssetsPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        _service.GetAssetsAsync().Returns(_defaultAssets);
        UseDefaultUser();
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _service.GetAssetsAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultAssets));

        // Act
        var cut = RenderComponent<AssetsPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Assets</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoAssets_RendersAsEmpty() {
        // Arrange
        _service.GetAssetsAsync().Returns([]);

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
        cut.Find("#assets-source-header").TextContent.Should().Be(nameof(Asset.Source));
        cut.Find("#assets-visibility-header").TextContent.Should().Be(nameof(Asset.Visibility));
        cut.Find("#assets-action-header").TextContent.Should().Be("Actions");

        cut.Find($"#asset-{_defaultAssets[0].Id}-name").TextContent.Should().Be(_defaultAssets[0].Name);
        cut.Find($"#asset-{_defaultAssets[0].Id}-type").TextContent.Should().Be(_defaultAssets[0].Type.ToString());
        cut.Find($"#asset-{_defaultAssets[0].Id}-source").InnerHtml.Should().Be($"""<a href="{_defaultAssets[0].Source}" target="_blank">Link</a>""");
        cut.Find($"#asset-{_defaultAssets[0].Id}-visibility").TextContent.Should().Be(_defaultAssets[0].Visibility.ToString());
        cut.Find($"#asset-{_defaultAssets[0].Id}-actions").TextContent.Should().Be("Delete");

        cut.Find($"#asset-{_defaultAssets[1].Id}-name").TextContent.Should().Be(_defaultAssets[1].Name);
        cut.Find($"#asset-{_defaultAssets[1].Id}-type").TextContent.Should().Be(_defaultAssets[1].Type.ToString());
        cut.Find($"#asset-{_defaultAssets[1].Id}-source").InnerHtml.Should().Be($"""<a href="{_defaultAssets[1].Source}" target="_blank">Link</a>""");
        cut.Find($"#asset-{_defaultAssets[1].Id}-visibility").TextContent.Should().Be(_defaultAssets[1].Visibility.ToString());
        cut.Find($"#asset-{_defaultAssets[1].Id}-actions").TextContent.Should().Be("Delete");
    }

    [Fact]
    public void WhenCreateButtonIsClicked_CreatesAssetMethod() {
        // Arrange
        var newAsset = new Asset {
            Name = "New Asset",
            Source = "https://example.com/new-asset",
            Type = AssetType.NPC,
        };
        _service.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        cut.Find("#name-input").Change(newAsset.Name);
        cut.Find("#source-input").Change(newAsset.Source);
        cut.Find("#type-input").Change(newAsset.Type.ToString());

        // Act
        cut.Find("#create-asset").Click();

        // Assert
        var rows = cut.FindAll("#assets-table tr");
        rows.Count.Should().Be(4);
        cut.Find($"#asset-{newAsset.Id}-name").TextContent.Should().Be(newAsset.Name);
        cut.Find($"#asset-{newAsset.Id}-type").TextContent.Should().Be(newAsset.Type.ToString());
        cut.Find($"#asset-{newAsset.Id}-source").InnerHtml.Should().Be($"""<a href="{newAsset.Source}" target="_blank">Link</a>""");
        cut.Find($"#asset-{newAsset.Id}-visibility").TextContent.Should().Be(newAsset.Visibility.ToString());
        cut.Find($"#asset-{newAsset.Id}-actions").TextContent.Should().Be("Delete");
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesAsset() {
        // Arrange
        var assetId = _defaultAssets[0].Id;
        _service.DeleteAssetAsync(Arg.Any<Guid>()).Returns(true);

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.Find($"#delete-asset-{assetId}").Click();

        // Assert
        var rows = cut.FindAll("#assets-table tr");
        rows.Count.Should().Be(2);
    }
}