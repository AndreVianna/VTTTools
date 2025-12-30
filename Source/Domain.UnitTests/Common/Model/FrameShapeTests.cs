namespace VttTools.Common.Model;

public class FrameShapeTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Arrange
        var values = Enum.GetValues<FrameShape>();

        // Act & Assert
        values.Should().HaveCount(6);
        ((int)FrameShape.None).Should().Be(0);
        ((int)FrameShape.Square).Should().Be(1);
        ((int)FrameShape.Hexagon).Should().Be(2);
        ((int)FrameShape.Octagon).Should().Be(3);
        ((int)FrameShape.Shield).Should().Be(4);
        ((int)FrameShape.Circle).Should().Be(5);
    }
}
