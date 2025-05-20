namespace VttTools.Common.Model;

public class GridTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var grid = new Grid();

        // Assert
        grid.Type.Should().Be(GridType.NoGrid);
        grid.Cell.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const GridType type = GridType.Square;
        var cell = new Cell {
            Size = 1.0f,
            Offset = new() { X = 0, Y = 0 },
            Scale = new() { X = 1.0f, Y = 1.0f },
        };

        // Act
        var grid = new Grid {
            Type = type,
            Cell = cell,
        };

        // Assert
        grid.Type.Should().Be(type);
        grid.Cell.Should().BeEquivalentTo(cell);
    }
}