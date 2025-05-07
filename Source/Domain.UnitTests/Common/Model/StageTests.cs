namespace VttTools.Common.Model;

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
            Offset = new() { Left = 50, Top = 50 },
            CellSize = new() { Width = 32, Height = 32 }
        };

        // Act
        var stage = new Stage {
            MapType = mapType,
            Source = source,
            Size = size,
            Grid = grid,
        };

        // Assert
        stage.MapType.Should().Be(mapType);
        stage.Source.Should().Be(source);
        stage.Size.Should().Be(size);
        stage.Grid.Should().Be(grid);
    }
}