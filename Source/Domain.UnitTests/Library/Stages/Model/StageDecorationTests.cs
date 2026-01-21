namespace VttTools.Library.Stages.Model;

public class StageDecorationTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var decoration = new StageElement();

        // Assert
        decoration.Index.Should().Be(0);
        decoration.Name.Should().BeNull();
        decoration.Display.Should().BeNull();
        decoration.Size.Should().Be(Dimension.Zero);
        decoration.Position.Should().Be(Position.Zero);
        decoration.Rotation.Should().Be(0f);
        decoration.Elevation.Should().Be(0f);
        decoration.Opacity.Should().Be(1.0f);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var resource = new ResourceMetadata { Id = resourceId };
        var size = new Dimension(100, 100);
        var position = new Position(50, 75);

        // Act
        var decoration = new StageElement {
            Index = 4,
            Name = "Tree",
            Display = resource,
            Size = size,
            Position = position,
            Rotation = 45f,
            Elevation = 0f,
            Opacity = 0.8f,
        };

        // Assert
        decoration.Index.Should().Be(4);
        decoration.Name.Should().Be("Tree");
        decoration.Display.Should().Be(resource);
        decoration.Size.Should().Be(size);
        decoration.Position.Should().Be(position);
        decoration.Rotation.Should().Be(45f);
        decoration.Elevation.Should().Be(0f);
        decoration.Opacity.Should().Be(0.8f);
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageElement {
            Index = 0,
            Name = "Original Decoration",
            Opacity = 1.0f,
        };

        // Act
        var modified = original with { Opacity = 0.5f };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.Opacity.Should().Be(0.5f);
        modified.Name.Should().Be("Original Decoration");
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var decoration1 = new StageElement {
            Index = 0,
            Name = "Test Decoration",
            Opacity = 0.75f,
        };
        var decoration2 = new StageElement {
            Index = 0,
            Name = "Test Decoration",
            Opacity = 0.75f,
        };

        // Act & Assert
        decoration1.Should().Be(decoration2);
        (decoration1 == decoration2).Should().BeTrue();
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(45f)]
    [InlineData(90f)]
    [InlineData(180f)]
    [InlineData(270f)]
    [InlineData(360f)]
    public void Rotation_AcceptsValidDegreeValues(float rotation) {
        // Arrange & Act
        var decoration = new StageElement { Rotation = rotation };

        // Assert
        decoration.Rotation.Should().Be(rotation);
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(0.25f)]
    [InlineData(0.5f)]
    [InlineData(0.75f)]
    [InlineData(1.0f)]
    public void Opacity_AcceptsValidValues(float opacity) {
        // Arrange & Act
        var decoration = new StageElement { Opacity = opacity };

        // Assert
        decoration.Opacity.Should().Be(opacity);
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(5f)]
    [InlineData(10f)]
    [InlineData(20f)]
    public void Elevation_AcceptsValidValues(float elevation) {
        // Arrange & Act
        var decoration = new StageElement { Elevation = elevation };

        // Assert
        decoration.Elevation.Should().Be(elevation);
    }
}