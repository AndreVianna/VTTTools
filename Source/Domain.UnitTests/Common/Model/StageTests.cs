namespace VttTools.Common.Model;

public class StageTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var stage = new Stage();

        // Assert
        stage.ZoomLevel.Should().Be(1.0f);
        stage.Shape.Should().NotBeNull();
        stage.Grid.Type.Should().Be(GridType.NoGrid);
        stage.Grid.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const float zoomLevel = 2.0f;
        var shape = new Shape {
            Type = MediaType.Image,
            SourceId = Guid.NewGuid(),
            Size = new(100, 100),
        };
        var grid = new Grid {
            Type = GridType.Square,
            Cell = new(),
        };

        // Act
        var stage = new Stage {
            ZoomLevel = zoomLevel,
            Shape = shape,
            Grid = grid,
        };

        // Assert
        stage.ZoomLevel.Should().Be(zoomLevel);
        stage.Shape.Should().BeEquivalentTo(shape);
        stage.Grid.Should().BeEquivalentTo(grid);
    }
}