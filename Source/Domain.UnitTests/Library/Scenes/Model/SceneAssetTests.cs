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
        sceneAsset.Size.Width.Should().Be(0);
        sceneAsset.Size.Height.Should().Be(0);
        sceneAsset.Frame.Should().NotBeNull();
        sceneAsset.IsLocked.Should().BeFalse();
        sceneAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const string name = "Test Asset";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 1000, Height = 2000, IsSquare = false };
        var frame = new Frame {
            Shape = FrameShape.Square,
            BorderThickness = 2,
            BorderColor = "black",
            Background = "transparent"
        };
        const bool isLocked = true;
        var controlledBy = Guid.CreateVersion7();

        // Act
        var sceneAsset = new SceneAsset {
            Name = name,
            Position = position,
            Size = size,
            Frame = frame,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        sceneAsset.Name.Should().Be(name);
        sceneAsset.Position.Should().Be(position);
        sceneAsset.Size.Should().Be(size);
        sceneAsset.Frame.Should().BeEquivalentTo(frame);
        sceneAsset.IsLocked.Should().Be(isLocked);
        sceneAsset.ControlledBy.Should().Be(controlledBy);
    }
}