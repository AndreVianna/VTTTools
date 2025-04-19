namespace VttTools.Model.Game;

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
            CellSize = cellSize
        };

        // Assert
        grid.Offset.Should().Be(offset);
        grid.CellSize.Should().Be(cellSize);
    }

    [Fact]
    public void Offset_WhenChanged_UpdatesCorrectly() {
        // Arrange
        var grid = new Grid();
        var newOffset = new Position { Left = 15, Top = 20 };

        // Act
        grid.Offset = newOffset;

        // Assert
        grid.Offset.Should().Be(newOffset);
        grid.Offset.Left.Should().Be(15);
        grid.Offset.Top.Should().Be(20);
    }

    [Fact]
    public void CellSize_WhenChanged_UpdatesCorrectly() {
        // Arrange
        var grid = new Grid();
        var newCellSize = new Size { Width = 64, Height = 48 };

        // Act
        grid.CellSize = newCellSize;

        // Assert
        grid.CellSize.Should().Be(newCellSize);
        grid.CellSize.Width.Should().Be(64);
        grid.CellSize.Height.Should().Be(48);
    }

    [Fact]
    public void Grid_WithZeroValues_IsValid() {
        // Arrange & Act
        var grid = new Grid {
            Offset = new Position { Left = 0, Top = 0 },
            CellSize = new Size { Width = 0, Height = 0 }
        };

        // Assert
        grid.Offset.Left.Should().Be(0);
        grid.Offset.Top.Should().Be(0);
        grid.CellSize.Width.Should().Be(0);
        grid.CellSize.Height.Should().Be(0);
    }

    [Fact]
    public void Grid_WithNegativeOffset_WorksAsExpected() {
        // Arrange & Act
        var grid = new Grid {
            Offset = new Position { Left = -10, Top = -15 },
            CellSize = new Size { Width = 32, Height = 32 }
        };

        // Assert
        grid.Offset.Left.Should().Be(-10);
        grid.Offset.Top.Should().Be(-15);
    }
}