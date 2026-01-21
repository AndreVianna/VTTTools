namespace VttTools.Common.Model;

public class PositionTests {
    [Fact]
    public void Constructor_WithValues_InitializesCorrectly() {
        // Arrange & Act
        var position = new Position(10.5, 20.3);

        // Assert
        position.X.Should().Be(10.5);
        position.Y.Should().Be(20.3);
    }

    [Fact]
    public void Constructor_WithNegativeValues_InitializesCorrectly() {
        // Arrange & Act
        var position = new Position(-5.5, -10.2);

        // Assert
        position.X.Should().Be(-5.5);
        position.Y.Should().Be(-10.2);
    }

    [Fact]
    public void Zero_WhenAccessed_ReturnsOriginPosition() {
        // Arrange & Act
        var zero = Position.Zero;

        // Assert
        zero.X.Should().Be(0);
        zero.Y.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new Position(10.5, 20.3);

        // Act
        var updated = original with {
            X = 30.7,
            Y = 40.9,
        };

        // Assert
        updated.X.Should().Be(30.7);
        updated.Y.Should().Be(40.9);
        original.X.Should().Be(10.5);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var position1 = new Position(15.5, 25.5);
        var position2 = new Position(15.5, 25.5);

        // Act & Assert
        position1.Should().Be(position2);
        (position1 == position2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var position1 = new Position(15.5, 25.5);
        var position2 = new Position(30.7, 40.9);

        // Act & Assert
        position1.Should().NotBe(position2);
        (position1 != position2).Should().BeTrue();
    }

    [Fact]
    public void ToString_WithValues_ReturnsFormattedString() {
        // Arrange
        var position = new Position(10.5, 20.3);

        // Act
        var result = position.ToString();

        // Assert
        result.Should().Be("(10.5, 20.3)");
    }

    [Fact]
    public void ToString_WithZero_ReturnsFormattedString() {
        // Arrange
        var position = Position.Zero;

        // Act
        var result = position.ToString();

        // Assert
        result.Should().Be("(0, 0)");
    }
}