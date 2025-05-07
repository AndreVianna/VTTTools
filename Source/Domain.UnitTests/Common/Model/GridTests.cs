namespace VttTools.Common.Model;

public class GridTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var grid = new Grid();

        // Assert
        grid.Offset.Should().NotBeNull();
        grid.Offset.Left.Should().Be(0);
        grid.Offset.Top.Should().Be(0);
        grid.CellSize.Should().NotBeNull();
        grid.CellSize.Width.Should().Be(0);
        grid.CellSize.Height.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var offset = new Position { Left = 25, Top = 30 };
        var cellSize = new Size { Width = 40, Height = 40 };

        // Act
        var grid = new Grid {
            Offset = offset,
            CellSize = cellSize,
        };

        // Assert
        grid.Offset.Should().Be(offset);
        grid.CellSize.Should().Be(cellSize);
    }
}