namespace VttTools.Common.Model;

public class CellSizeTests {
    [Fact]
    public void Constructor_WithValidValues_InitializesCorrectly() {
        // Arrange & Act
        var cellSize = new CellSize(100.5, 200.7);

        // Assert
        cellSize.Width.Should().Be(100.5);
        cellSize.Height.Should().Be(200.7);
    }

    [Fact]
    public void Constructor_WithNegativeWidth_ThrowsArgumentException() {
        // Arrange & Act
        var act = () => new CellSize(-1, 100);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Width cannot be negative*")
            .WithParameterName("width");
    }

    [Fact]
    public void Constructor_WithNegativeHeight_ThrowsArgumentException() {
        // Arrange & Act
        var act = () => new CellSize(100, -1);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Height cannot be negative*")
            .WithParameterName("height");
    }

    [Fact]
    public void Default_WhenAccessed_ReturnsDefaultSize() {
        // Arrange & Act
        var defaultSize = CellSize.Default;

        // Assert
        defaultSize.Width.Should().Be(50);
        defaultSize.Height.Should().Be(50);
    }

    [Fact]
    public void Zero_WhenAccessed_ReturnsZeroSize() {
        // Arrange & Act
        var zero = CellSize.Zero;

        // Assert
        zero.Width.Should().Be(0);
        zero.Height.Should().Be(0);
    }

    [Fact]
    public void Area_WithValidSize_ReturnsCorrectValue() {
        // Arrange
        var cellSize = new CellSize(10.5, 20.5);

        // Act
        var area = cellSize.Area;

        // Assert
        area.Should().Be(215.25);
    }

    [Fact]
    public void Area_WithZeroSize_ReturnsZero() {
        // Arrange
        var cellSize = CellSize.Zero;

        // Act
        var area = cellSize.Area;

        // Assert
        area.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CellSize(100.5, 200.7);

        // Act
        var updated = original with {
            Width = 150.3,
            Height = 250.9,
        };

        // Assert
        updated.Width.Should().Be(150.3);
        updated.Height.Should().Be(250.9);
        original.Width.Should().Be(100.5);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var cellSize1 = new CellSize(100.5, 200.7);
        var cellSize2 = new CellSize(100.5, 200.7);

        // Act & Assert
        cellSize1.Should().Be(cellSize2);
        (cellSize1 == cellSize2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var cellSize1 = new CellSize(100.5, 200.7);
        var cellSize2 = new CellSize(150.3, 250.9);

        // Act & Assert
        cellSize1.Should().NotBe(cellSize2);
        (cellSize1 != cellSize2).Should().BeTrue();
    }

    [Fact]
    public void ToString_WithValues_ReturnsFormattedString() {
        // Arrange
        var cellSize = new CellSize(100.5, 200.7);

        // Act
        var result = cellSize.ToString();

        // Assert
        result.Should().Be("100.50x200.70");
    }

    [Fact]
    public void ToString_WithZero_ReturnsFormattedString() {
        // Arrange
        var cellSize = CellSize.Zero;

        // Act
        var result = cellSize.ToString();

        // Assert
        result.Should().Be("0.00x0.00");
    }
}