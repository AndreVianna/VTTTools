namespace VttTools.Common.Model;

public class CellTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var cell = new Cell();

        // Assert
        cell.Offset.X.Should().Be(0);
        cell.Offset.Y.Should().Be(0);
        cell.Scale.X.Should().Be(1.0f);
        cell.Scale.Y.Should().Be(1.0f);
        cell.Size.Should().Be(50.0f);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var offset = new Vector2 { X = 25, Y = 30 };
        var scale = new Vector2 { X = 40, Y = 40 };
        const float size = 10.0f;

        // Act
        var cell = new Cell {
            Offset = offset,
            Scale = scale,
            Size = size,
        };

        // Assert
        cell.Offset.Should().BeEquivalentTo(offset);
        cell.Scale.Should().BeEquivalentTo(scale);
        cell.Size.Should().Be(size);
    }
}
