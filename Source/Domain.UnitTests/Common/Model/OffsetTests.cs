namespace VttTools.Common.Model;

public class OffsetTests {
    [Fact]
    public void Constructor_WithValues_InitializesCorrectly() {
        // Arrange & Act
        var offset = new Offset(10.5, 20.3);

        // Assert
        offset.Left.Should().Be(10.5);
        offset.Top.Should().Be(20.3);
    }

    [Fact]
    public void Constructor_WithNegativeValues_InitializesCorrectly() {
        // Arrange & Act
        var offset = new Offset(-5.5, -10.2);

        // Assert
        offset.Left.Should().Be(-5.5);
        offset.Top.Should().Be(-10.2);
    }

    [Fact]
    public void Zero_WhenAccessed_ReturnsZeroOffset() {
        // Arrange & Act
        var zero = Offset.Zero;

        // Assert
        zero.Left.Should().Be(0);
        zero.Top.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new Offset(10.5, 20.3);

        // Act
        var updated = original with {
            Left = 30.7,
            Top = 40.9,
        };

        // Assert
        updated.Left.Should().Be(30.7);
        updated.Top.Should().Be(40.9);
        original.Left.Should().Be(10.5);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var offset1 = new Offset(15.5, 25.5);
        var offset2 = new Offset(15.5, 25.5);

        // Act & Assert
        offset1.Should().Be(offset2);
        (offset1 == offset2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var offset1 = new Offset(15.5, 25.5);
        var offset2 = new Offset(30.7, 40.9);

        // Act & Assert
        offset1.Should().NotBe(offset2);
        (offset1 != offset2).Should().BeTrue();
    }

    [Fact]
    public void ToString_WithValues_ReturnsFormattedString() {
        // Arrange
        var offset = new Offset(10.5, 20.3);

        // Act
        var result = offset.ToString();

        // Assert
        result.Should().Be("(10.50, 20.30)");
    }

    [Fact]
    public void ToString_WithZero_ReturnsFormattedString() {
        // Arrange
        var offset = Offset.Zero;

        // Act
        var result = offset.ToString();

        // Assert
        result.Should().Be("(0.00, 0.00)");
    }
}