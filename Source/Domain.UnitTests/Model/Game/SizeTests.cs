namespace VttTools.Model.Game;

public class SizeTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var size = new Size();

        // Assert
        size.Width.Should().Be(0);
        size.Height.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange & Act
        var size = new Size {
            Width = 100.5,
            Height = 200.5,
        };

        // Assert
        size.Width.Should().Be(100.5);
        size.Height.Should().Be(200.5);
    }
}