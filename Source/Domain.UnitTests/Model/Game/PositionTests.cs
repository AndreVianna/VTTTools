namespace VttTools.Model.Game;

public class PositionTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var position = new Position();

        // Assert
        position.Left.Should().Be(0);
        position.Top.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange & Act
        var position = new Position {
            Left = 10.5,
            Top = 20.5
        };

        // Assert
        position.Left.Should().Be(10.5);
        position.Top.Should().Be(20.5);
    }

    [Fact]
    public void Properties_WhenChanged_UpdateCorrectly() {
        // Arrange
        var position = new Position {
            // Act
            Left = 15.75,
            Top = 25.25
        };

        // Assert
        position.Left.Should().Be(15.75);
        position.Top.Should().Be(25.25);
    }

    [Fact]
    public void Position_WithNegativeValues_WorksAsExpected() {
        // Arrange & Act
        var position = new Position {
            Left = -100.5,
            Top = -200.75
        };

        // Assert
        position.Left.Should().Be(-100.5);
        position.Top.Should().Be(-200.75);
    }

    [Fact]
    public void Position_WithLargeValues_WorksAsExpected() {
        // Arrange & Act
        var position = new Position {
            Left = 10000.5,
            Top = 20000.25
        };

        // Assert
        position.Left.Should().Be(10000.5);
        position.Top.Should().Be(20000.25);
    }

    [Fact]
    public void Equality_SameValues_ShouldBeEqual() {
        // Arrange
        var position1 = new Position { Left = 10, Top = 20 };
        var position2 = new Position { Left = 10, Top = 20 };

        // Act & Assert
        position1.Should().BeEquivalentTo(position2);
    }

    [Fact]
    public void Equality_DifferentValues_ShouldNotBeEqual() {
        // Arrange
        var position1 = new Position { Left = 10, Top = 20 };
        var position2 = new Position { Left = 30, Top = 40 };

        // Act & Assert
        position1.Should().NotBeEquivalentTo(position2);
    }
}