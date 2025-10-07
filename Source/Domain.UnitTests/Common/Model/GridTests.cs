namespace VttTools.Common.Model;

public class GridTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var grid = new Grid();

        // Assert
        grid.Type.Should().Be(GridType.NoGrid);
        grid.CellSize.Should().NotBeNull();
        grid.Offset.Should().NotBeNull();
        grid.Snap.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const GridType type = GridType.Square;
        var cellSize = new CellSize(20.0, 20.0);
        var offset = new Offset(100.0, 100.0);
        const bool snap = true;

        // Act
        var grid = new Grid {
            Type = type,
            CellSize = cellSize,
            Offset = offset,
            Snap = snap,
        };

        // Assert
        grid.Type.Should().Be(type);
        grid.CellSize.Should().BeEquivalentTo(cellSize);
        grid.Offset.Should().BeEquivalentTo(offset);
        grid.Snap.Should().Be(snap);
    }
}