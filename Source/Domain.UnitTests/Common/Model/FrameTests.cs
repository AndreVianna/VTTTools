namespace VttTools.Library.Encounters.Model;

public class FrameTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var frame = new Frame();

        // Assert
        frame.Shape.Should().Be(FrameShape.None);
        frame.BorderColor.Should().Be(Colors.Primary);
        frame.BorderThickness.Should().Be(1);
        frame.Background.Should().Be(Colors.Transparent);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange & Act
        var frame = new Frame {
            Shape = FrameShape.Circle,
            BorderColor = Colors.Red,
            BorderThickness = 3,
            Background = Colors.Blue,
        };

        // Assert
        frame.Shape.Should().Be(FrameShape.Circle);
        frame.BorderColor.Should().Be(Colors.Red);
        frame.BorderThickness.Should().Be(3);
        frame.Background.Should().Be(Colors.Blue);
    }

    [Fact]
    public void WithClause_WithChangedShape_UpdatesProperty() {
        // Arrange
        var original = new Frame();

        // Act
        var updated = original with { Shape = FrameShape.Square };

        // Assert
        updated.Shape.Should().Be(FrameShape.Square);
        original.Shape.Should().Be(FrameShape.None);
    }

    [Fact]
    public void WithClause_WithChangedBorderColor_UpdatesProperty() {
        // Arrange
        var original = new Frame();

        // Act
        var updated = original with { BorderColor = Colors.Green };

        // Assert
        updated.BorderColor.Should().Be(Colors.Green);
        original.BorderColor.Should().Be(Colors.Primary);
    }

    [Fact]
    public void WithClause_WithChangedBorderThickness_UpdatesProperty() {
        // Arrange
        var original = new Frame();

        // Act
        var updated = original with { BorderThickness = 5 };

        // Assert
        updated.BorderThickness.Should().Be(5);
        original.BorderThickness.Should().Be(1);
    }

    [Fact]
    public void WithClause_WithChangedBackground_UpdatesProperty() {
        // Arrange
        var original = new Frame();

        // Act
        var updated = original with { Background = Colors.White };

        // Assert
        updated.Background.Should().Be(Colors.White);
        original.Background.Should().Be(Colors.Transparent);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var frame1 = new Frame {
            Shape = FrameShape.Circle,
            BorderColor = Colors.Red,
            BorderThickness = 3,
            Background = Colors.Blue,
        };
        var frame2 = new Frame {
            Shape = FrameShape.Circle,
            BorderColor = Colors.Red,
            BorderThickness = 3,
            Background = Colors.Blue,
        };

        // Act & Assert
        frame1.Should().Be(frame2);
        (frame1 == frame2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var frame1 = new Frame { Shape = FrameShape.Circle };
        var frame2 = new Frame { Shape = FrameShape.Square };

        // Act & Assert
        frame1.Should().NotBe(frame2);
        (frame1 != frame2).Should().BeTrue();
    }
}
