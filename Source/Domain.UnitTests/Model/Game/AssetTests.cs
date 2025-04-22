namespace VttTools.Model.Game;

public class AssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new Asset();

        // Assert
        asset.Id.Should().NotBeEmpty();
        asset.OwnerId.Should().BeEmpty();
        asset.Name.Should().BeEmpty();
        asset.Source.Should().BeEmpty();
        asset.Type.Should().Be(AssetType.Placeholder);
        asset.Visibility.Should().Be(Visibility.Hidden);
        asset.Size.Should().NotBeNull();
        asset.Size.Width.Should().Be(0);
        asset.Size.Height.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        const string name = "Test Asset";
        const string source = "test.png";
        const AssetType type = AssetType.Character;
        const Visibility visibility = Visibility.Public;
        var size = new Size { Width = 100, Height = 200 };

        // Act
        var asset = new Asset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Source = source,
            Type = type,
            Visibility = visibility,
            Size = size,
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Source.Should().Be(source);
        asset.Type.Should().Be(type);
        asset.Visibility.Should().Be(visibility);
        asset.Size.Should().Be(size);
    }
}