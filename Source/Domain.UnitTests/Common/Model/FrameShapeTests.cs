namespace VttTools.Common.Model;

public class FrameShapeTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)FrameShape.None).Should().Be(0);
        ((int)FrameShape.Square).Should().Be(1);
        ((int)FrameShape.Circle).Should().Be(2);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        nameof(
        // Act & Assert
        FrameShape.None).Should().Be("None");
        nameof(FrameShape.Square).Should().Be("Square");
        nameof(FrameShape.Circle).Should().Be("Circle");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<FrameShape>("None").Should().Be(FrameShape.None);
        Enum.Parse<FrameShape>("Square").Should().Be(FrameShape.Square);
        Enum.Parse<FrameShape>("Circle").Should().Be(FrameShape.Circle);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<FrameShape>();

        // Act & Assert
        values.Should().HaveCount(3);
        values.Should().Contain(FrameShape.None);
        values.Should().Contain(FrameShape.Square);
        values.Should().Contain(FrameShape.Circle);
    }
}
