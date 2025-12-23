namespace VttTools.Library.Encounters.Model;

public class EncounterAssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var encounterAsset = new EncounterAsset();

        // Assert
        encounterAsset.Name.Should().BeNull();
        encounterAsset.Position.Should().NotBeNull();
        encounterAsset.Position.X.Should().Be(0);
        encounterAsset.Position.Y.Should().Be(0);
        encounterAsset.Size.Width.Should().Be(0);
        encounterAsset.Size.Height.Should().Be(0);
        encounterAsset.Frame.Should().NotBeNull();
        encounterAsset.IsLocked.Should().BeFalse();
        encounterAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const string name = "Test Asset";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 1000, Height = 2000 };
        var frame = new Frame {
            Shape = FrameShape.Square,
            BorderThickness = 2,
            BorderColor = "black",
            Background = "transparent"
        };
        const bool isLocked = true;
        var controlledBy = Guid.CreateVersion7();

        // Act
        var encounterAsset = new EncounterAsset {
            Name = name,
            Position = position,
            Size = size,
            Frame = frame,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        encounterAsset.Name.Should().Be(name);
        encounterAsset.Position.Should().Be(position);
        encounterAsset.Size.Should().Be(size);
        encounterAsset.Frame.Should().BeEquivalentTo(frame);
        encounterAsset.IsLocked.Should().Be(isLocked);
        encounterAsset.ControlledBy.Should().Be(controlledBy);
    }
}