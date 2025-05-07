namespace VttTools.Library.Scenes.Model;

public class SceneAssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var sceneAsset = new SceneAsset();

        // Assert
        sceneAsset.SceneId.Should().BeEmpty();
        sceneAsset.AssetId.Should().BeEmpty();
        sceneAsset.Scene.Should().BeNull();
        sceneAsset.Asset.Should().BeNull();
        sceneAsset.Name.Should().BeEmpty();
        sceneAsset.Position.Should().NotBeNull();
        sceneAsset.Position.Left.Should().Be(0);
        sceneAsset.Position.Top.Should().Be(0);
        sceneAsset.Scale.Should().Be(1.0);
        sceneAsset.IsLocked.Should().BeFalse();
        sceneAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var scene = new Scene();
        var asset = new Asset();
        const string name = "Test Asset";
        var position = new Position { Left = 10, Top = 20 };
        const double scale = 1.5;
        const bool isLocked = true;
        var controlledBy = Guid.NewGuid();

        // Act
        var sceneAsset = new SceneAsset {
            SceneId = sceneId,
            AssetId = assetId,
            Scene = scene,
            Asset = asset,
            Name = name,
            Position = position,
            Scale = scale,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        sceneAsset.SceneId.Should().Be(sceneId);
        sceneAsset.AssetId.Should().Be(assetId);
        sceneAsset.Scene.Should().BeSameAs(scene);
        sceneAsset.Asset.Should().BeSameAs(asset);
        sceneAsset.Name.Should().Be(name);
        sceneAsset.Position.Should().Be(position);
        sceneAsset.Scale.Should().Be(scale);
        sceneAsset.IsLocked.Should().Be(isLocked);
        sceneAsset.ControlledBy.Should().Be(controlledBy);
    }
}