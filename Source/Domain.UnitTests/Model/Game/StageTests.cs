namespace VttTools.Model.Game;

public class StageTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var stage = new Stage();

        // Assert
        stage.MapType.Should().Be(StageMapType.None);
        stage.Source.Should().BeEmpty();
        stage.Size.Should().NotBeNull();
        stage.Size.Width.Should().Be(0);
        stage.Size.Height.Should().Be(0);
        stage.Grid.Should().NotBeNull();
        stage.Grid.Offset.Should().NotBeNull();
        stage.Grid.Offset.Left.Should().Be(0);
        stage.Grid.Offset.Top.Should().Be(0);
        stage.Grid.CellSize.Should().NotBeNull();
        stage.Grid.CellSize.Width.Should().Be(0);
        stage.Grid.CellSize.Height.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const StageMapType mapType = StageMapType.Square;
        const string source = "background.jpg";
        var size = new Size { Width = 1000, Height = 800 };
        var grid = new Grid {
            Offset = new Position { Left = 50, Top = 50 },
            CellSize = new Size { Width = 32, Height = 32 }
        };

        // Act
        var stage = new Stage {
            MapType = mapType,
            Source = source,
            Size = size,
            Grid = grid
        };

        // Assert
        stage.MapType.Should().Be(mapType);
        stage.Source.Should().Be(source);
        stage.Size.Should().Be(size);
        stage.Grid.Should().Be(grid);
    }

    [Fact]
    public void MapType_WhenChangingValues_UpdatesCorrectly() {
        // Arrange
        var stage = new Stage {
            // Act & Assert - Test all map types
            MapType = StageMapType.None
        };
        stage.MapType.Should().Be(StageMapType.None);

        stage.MapType = StageMapType.Square;
        stage.MapType.Should().Be(StageMapType.Square);

        stage.MapType = StageMapType.HexH;
        stage.MapType.Should().Be(StageMapType.HexH);

        stage.MapType = StageMapType.HexV;
        stage.MapType.Should().Be(StageMapType.HexV);

        stage.MapType = StageMapType.Isometric;
        stage.MapType.Should().Be(StageMapType.Isometric);
    }

    [Fact]
    public void Grid_WithDifferentCellSizes_StoresCorrectValues() {
        // Arrange
        var stage = new Stage();

        // Act - Try different grid sizes
        stage.Grid.CellSize = new Size { Width = 24, Height = 24 };

        // Assert
        stage.Grid.CellSize.Width.Should().Be(24);
        stage.Grid.CellSize.Height.Should().Be(24);

        // Act - Non-square grid for hex or isometric
        stage.Grid.CellSize = new Size { Width = 32, Height = 28 };

        // Assert
        stage.Grid.CellSize.Width.Should().Be(32);
        stage.Grid.CellSize.Height.Should().Be(28);
    }
}