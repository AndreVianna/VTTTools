namespace VttTools.Model.Game;

public class AssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new Asset();

        // Assert
        asset.Id.Should().BeEmpty();
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

    [Theory]
    [InlineData(AssetType.Placeholder)]
    [InlineData(AssetType.Object)]
    [InlineData(AssetType.Character)]
    [InlineData(AssetType.NPC)]
    [InlineData(AssetType.Creature)]
    [InlineData(AssetType.Overlay)]
    [InlineData(AssetType.Sound)]
    [InlineData(AssetType.Video)]
    public void Type_WhenSet_UpdatesCorrectly(AssetType type) {
        // Arrange
        var asset = new Asset {
            // Act
            Type = type
        };

        // Assert
        asset.Type.Should().Be(type);
    }

    [Theory]
    [InlineData(Visibility.Hidden)]
    [InlineData(Visibility.Private)]
    [InlineData(Visibility.Public)]
    public void Visibility_WhenSet_UpdatesCorrectly(Visibility visibility) {
        // Arrange
        var asset = new Asset {
            // Act
            Visibility = visibility
        };

        // Assert
        asset.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void Size_WhenModified_UpdatesDimensions() {
        // Arrange
        var asset = new Asset();

        // Act
        asset.Size.Width = 200;
        asset.Size.Height = 150;

        // Assert
        asset.Size.Width.Should().Be(200);
        asset.Size.Height.Should().Be(150);
    }

    [Fact]
    public void Size_WhenAssigned_RetainsValue() {
        // Arrange
        var asset = new Asset();
        var newSize = new Size { Width = 300, Height = 250 };

        // Act
        asset.Size = newSize;

        // Assert
        asset.Size.Should().BeSameAs(newSize);
        asset.Size.Width.Should().Be(300);
        asset.Size.Height.Should().Be(250);
    }

    [Fact]
    public void Name_WhenLongString_AcceptsFullLength() {
        // Arrange
        var asset = new Asset();
        var longName = new string('A', 128); // Max length is 128

        // Act
        asset.Name = longName;

        // Assert
        asset.Name.Should().Be(longName);
        asset.Name.Length.Should().Be(128);
    }

    [Fact]
    public void Source_WhenLongString_AcceptsFullLength() {
        // Arrange
        var asset = new Asset();
        var longSource = new string('A', 512); // Max length is 512

        // Act
        asset.Source = longSource;

        // Assert
        asset.Source.Should().Be(longSource);
        asset.Source.Length.Should().Be(512);
    }
}