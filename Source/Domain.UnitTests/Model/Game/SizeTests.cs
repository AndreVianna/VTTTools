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
            Height = 200.5
        };

        // Assert
        size.Width.Should().Be(100.5);
        size.Height.Should().Be(200.5);
    }

    [Fact]
    public void Properties_WhenChanged_UpdateCorrectly() {
        // Arrange
        var size = new Size {
            // Act
            Width = 150.75,
            Height = 250.25
        };

        // Assert
        size.Width.Should().Be(150.75);
        size.Height.Should().Be(250.25);
    }

    [Fact]
    public void Size_WithNegativeValues_WorksAsExpected() {
        // Arrange & Act
        var size = new Size {
            Width = -100.5,
            Height = -200.75
        };

        // Assert
        size.Width.Should().Be(-100.5);
        size.Height.Should().Be(-200.75);
    }

    [Fact]
    public void Size_WithLargeValues_WorksAsExpected() {
        // Arrange & Act
        var size = new Size {
            Width = 10000.5,
            Height = 20000.25
        };

        // Assert
        size.Width.Should().Be(10000.5);
        size.Height.Should().Be(20000.25);
    }

    [Fact]
    public void Size_WithZeroDimensions_IsValid() {
        // Arrange & Act
        var size = new Size {
            Width = 0,
            Height = 0
        };

        // Assert
        size.Width.Should().Be(0);
        size.Height.Should().Be(0);
    }

    [Fact]
    public void Equality_SameValues_ShouldBeEqual() {
        // Arrange
        var size1 = new Size { Width = 100, Height = 200 };
        var size2 = new Size { Width = 100, Height = 200 };

        // Act & Assert
        size1.Should().BeEquivalentTo(size2);
    }

    [Fact]
    public void Equality_DifferentValues_ShouldNotBeEqual() {
        // Arrange
        var size1 = new Size { Width = 100, Height = 200 };
        var size2 = new Size { Width = 300, Height = 400 };

        // Act & Assert
        size1.Should().NotBeEquivalentTo(size2);
    }
}