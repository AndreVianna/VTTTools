namespace VttTools.Common.Model;

public class PointTests {
    [Fact]
    public void Constructor_WithCoordinates_InitializesCorrectly() {
        // Arrange & Act
        var point = new Point(10.5, 20.3);

        // Assert
        point.X.Should().Be(10.5);
        point.Y.Should().Be(20.3);
    }

    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var point = new Point(0, 0);

        // Assert
        point.X.Should().Be(0);
        point.Y.Should().Be(0);
    }

    [Fact]
    public void Zero_WhenAccessed_ReturnsOriginPoint() {
        // Arrange & Act
        var zero = Point.Zero;

        // Assert
        zero.X.Should().Be(0);
        zero.Y.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new Point(10.5, 20.3);

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
        var point1 = new Point(15.5, 25.5);
        var point2 = new Point(15.5, 25.5);

        // Act & Assert
        point1.Should().Be(point2);
        (point1 == point2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var point1 = new Point(15.5, 25.5);
        var point2 = new Point(30.7, 40.9);

        // Act & Assert
        point1.Should().NotBe(point2);
        (point1 != point2).Should().BeTrue();
    }

    [Fact]
    public void ToString_WithValues_ReturnsFormattedString() {
        // Arrange
        var point = new Point(10.5, 20.3);

        // Act
        var result = point.ToString();

        // Assert
        result.Should().Be("(10.50, 20.30)");
    }

    [Fact]
    public void ToString_WithZero_ReturnsFormattedString() {
        // Arrange
        var point = Point.Zero;

        // Act
        var result = point.ToString();

        // Assert
        result.Should().Be("(0.00, 0.00)");
    }
}
