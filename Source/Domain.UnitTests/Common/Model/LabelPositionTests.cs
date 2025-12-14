namespace VttTools.Common.Model;

public class LabelPositionTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)LabelPosition.Default).Should().Be(0);
        ((int)LabelPosition.Top).Should().Be(1);
        ((int)LabelPosition.Middle).Should().Be(2);
        ((int)LabelPosition.Bottom).Should().Be(3);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        nameof(LabelPosition.Default).Should().Be("Default");
        nameof(LabelPosition.Top).Should().Be("Top");
        nameof(LabelPosition.Middle).Should().Be("Middle");
        nameof(LabelPosition.Bottom).Should().Be("Bottom");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<LabelPosition>("Default").Should().Be(LabelPosition.Default);
        Enum.Parse<LabelPosition>("Top").Should().Be(LabelPosition.Top);
        Enum.Parse<LabelPosition>("Middle").Should().Be(LabelPosition.Middle);
        Enum.Parse<LabelPosition>("Bottom").Should().Be(LabelPosition.Bottom);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<LabelPosition>();

        // Act & Assert
        values.Should().HaveCount(4);
        values.Should().Contain(LabelPosition.Default);
        values.Should().Contain(LabelPosition.Top);
        values.Should().Contain(LabelPosition.Middle);
        values.Should().Contain(LabelPosition.Bottom);
    }
}
