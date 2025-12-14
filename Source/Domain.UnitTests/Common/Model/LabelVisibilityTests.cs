namespace VttTools.Common.Model;

public class LabelVisibilityTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)LabelVisibility.Default).Should().Be(0);
        ((int)LabelVisibility.Always).Should().Be(1);
        ((int)LabelVisibility.OnHover).Should().Be(2);
        ((int)LabelVisibility.Never).Should().Be(3);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        nameof(
        // Act & Assert
        LabelVisibility.Default).Should().Be("Default");
        nameof(LabelVisibility.Always).Should().Be("Always");
        nameof(LabelVisibility.OnHover).Should().Be("OnHover");
        nameof(LabelVisibility.Never).Should().Be("Never");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<LabelVisibility>("Default").Should().Be(LabelVisibility.Default);
        Enum.Parse<LabelVisibility>("Always").Should().Be(LabelVisibility.Always);
        Enum.Parse<LabelVisibility>("OnHover").Should().Be(LabelVisibility.OnHover);
        Enum.Parse<LabelVisibility>("Never").Should().Be(LabelVisibility.Never);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<LabelVisibility>();

        // Act & Assert
        values.Should().HaveCount(4);
        values.Should().Contain(LabelVisibility.Default);
        values.Should().Contain(LabelVisibility.Always);
        values.Should().Contain(LabelVisibility.OnHover);
        values.Should().Contain(LabelVisibility.Never);
    }
}
