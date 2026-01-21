namespace VttTools.Common.Model;

public class SizeTests {
    [Fact]
    public void Constructor_WithValidValues_InitializesCorrectly() {
        // Arrange & Act
        var size = new Size(100, 200);

        // Assert
        size.Width.Should().Be(100);
        size.Height.Should().Be(200);
    }

    [Fact]
    public void Constructor_WithNegativeWidth_ThrowsArgumentException() {
        // Arrange & Act
        var act = () => new Size(-1, 100);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Width cannot be negative*")
            .WithParameterName("width");
    }

    [Fact]
    public void Constructor_WithNegativeHeight_ThrowsArgumentException() {
        // Arrange & Act
        var act = () => new Size(100, -1);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Height cannot be negative*")
            .WithParameterName("height");
    }

    [Fact]
    public void Zero_WhenAccessed_ReturnsZeroSize() {
        // Arrange & Act
        var zero = Size.Zero;

        // Assert
        zero.Width.Should().Be(0);
        zero.Height.Should().Be(0);
    }

    [Fact]
    public void Area_WithValidSize_ReturnsCorrectValue() {
        // Arrange
        var size = new Size(10, 20);

        // Act
        var area = size.Area;

        // Assert
        area.Should().Be(200);
    }

    [Fact]
    public void Area_WithZeroSize_ReturnsZero() {
        // Arrange
        var size = Size.Zero;

        // Act
        var area = size.Area;

        // Assert
        area.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new Size(100, 200);

        // Act
        var updated = original with {
            Width = 150,
            Height = 250,
        };

        // Assert
        updated.Width.Should().Be(150);
        updated.Height.Should().Be(250);
        original.Width.Should().Be(100);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var size1 = new Size(100, 200);
        var size2 = new Size(100, 200);

        // Act & Assert
        size1.Should().Be(size2);
        (size1 == size2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var size1 = new Size(100, 200);
        var size2 = new Size(150, 250);

        // Act & Assert
        size1.Should().NotBe(size2);
        (size1 != size2).Should().BeTrue();
    }

    [Fact]
    public void ToString_WithValues_ReturnsFormattedString() {
        // Arrange
        var size = new Size(100, 200);

        // Act
        var result = size.ToString();

        // Assert
        result.Should().Be("100x200");
    }

    [Fact]
    public void ToString_WithZero_ReturnsFormattedString() {
        // Arrange
        var size = Size.Zero;

        // Act
        var result = size.ToString();

        // Assert
        result.Should().Be("0x0");
    }
}