namespace VttTools.Common.Model;

public class StageTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var stage = new Stage();

        // Assert
        stage.Source.Should().BeEmpty();
        stage.Size.Should().NotBeNull();
        stage.Size.Width.Should().Be(0);
        stage.Size.Height.Should().Be(0);
        stage.Grid.Should().NotBeNull();
        stage.Grid.Type.Should().Be(GridType.None);
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
        const string source = "background.jpg";
        var size = new Size { Width = 1000, Height = 800 };
        var grid = new Grid {
            Type = GridType.Square,
            Offset = new() { Left = 50, Top = 50 },
            CellSize = new() { Width = 32, Height = 32 }
        };

        // Act
        var stage = new Stage {
            Source = source,
            Size = size,
            Grid = grid,
        };

        // Assert
        stage.Source.Should().Be(source);
        stage.Size.Should().BeEquivalentTo(size);
        stage.Grid.Should().BeEquivalentTo(grid);
    }
}