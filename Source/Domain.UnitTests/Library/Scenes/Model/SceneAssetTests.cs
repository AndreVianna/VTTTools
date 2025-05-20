namespace VttTools.Library.Scenes.Model;

public class SceneAssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var sceneAsset = new SceneAsset();

        // Assert
        sceneAsset.Name.Should().BeEmpty();
        sceneAsset.Position.Should().NotBeNull();
        sceneAsset.Position.X.Should().Be(0);
        sceneAsset.Position.Y.Should().Be(0);
        sceneAsset.Scale.Should().Be(1.0);
        sceneAsset.IsLocked.Should().BeFalse();
        sceneAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const string name = "Test Asset";
        var position = new Vector2 { X = 10, Y = 20 };
        var scale = new Vector2 { X = 0.5f, Y = 0.5f };
        const bool isLocked = true;
        var controlledBy = Guid.NewGuid();

        // Act
        var sceneAsset = new SceneAsset {
            Name = name,
            Position = position,
            Scale = scale,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        sceneAsset.Name.Should().Be(name);
        sceneAsset.Position.Should().Be(position);
        sceneAsset.Scale.Should().Be(scale);
        sceneAsset.IsLocked.Should().Be(isLocked);
        sceneAsset.ControlledBy.Should().Be(controlledBy);
    }
}