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
        var size = new Vector2 { X = 20, Y = 20 };
        var offset = new Vector2 { X = 100, Y = 100 };
        const bool snap = true;

        // Act
        var grid = new Grid {
            Type = type,
            CellSize = size,
            Offset = offset,
            Snap = snap,
        };

        // Assert
        grid.Type.Should().Be(type);
        grid.CellSize.Should().BeEquivalentTo(size);
        grid.Offset.Should().BeEquivalentTo(offset);
        grid.Snap.Should().Be(snap);
    }
}