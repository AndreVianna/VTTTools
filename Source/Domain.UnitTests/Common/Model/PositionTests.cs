namespace VttTools.Common.Model;

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
            Top = 20.5,
        };

        // Assert
        position.Left.Should().Be(10.5);
        position.Top.Should().Be(20.5);
    }
}