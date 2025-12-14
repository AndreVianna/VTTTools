namespace VttTools;

public class AmbientLightTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)AmbientLight.Black).Should().Be(-10);
        ((int)AmbientLight.Darkness).Should().Be(-5);
        ((int)AmbientLight.Nighttime).Should().Be(-3);
        ((int)AmbientLight.Dim).Should().Be(-2);
        ((int)AmbientLight.Twilight).Should().Be(-1);
        ((int)AmbientLight.Default).Should().Be(0);
        ((int)AmbientLight.Candlelight).Should().Be(1);
        ((int)AmbientLight.Torchlight).Should().Be(2);
        ((int)AmbientLight.Artificial).Should().Be(3);
        ((int)AmbientLight.Daylight).Should().Be(5);
        ((int)AmbientLight.Bright).Should().Be(10);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        nameof(
        // Act & Assert
        AmbientLight.Black).Should().Be("Black");
        nameof(AmbientLight.Darkness).Should().Be("Darkness");
        nameof(AmbientLight.Nighttime).Should().Be("Nighttime");
        nameof(AmbientLight.Dim).Should().Be("Dim");
        nameof(AmbientLight.Twilight).Should().Be("Twilight");
        nameof(AmbientLight.Default).Should().Be("Default");
        nameof(AmbientLight.Candlelight).Should().Be("Candlelight");
        nameof(AmbientLight.Torchlight).Should().Be("Torchlight");
        nameof(AmbientLight.Artificial).Should().Be("Artificial");
        nameof(AmbientLight.Daylight).Should().Be("Daylight");
        nameof(AmbientLight.Bright).Should().Be("Bright");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<AmbientLight>("Black").Should().Be(AmbientLight.Black);
        Enum.Parse<AmbientLight>("Darkness").Should().Be(AmbientLight.Darkness);
        Enum.Parse<AmbientLight>("Default").Should().Be(AmbientLight.Default);
        Enum.Parse<AmbientLight>("Daylight").Should().Be(AmbientLight.Daylight);
        Enum.Parse<AmbientLight>("Bright").Should().Be(AmbientLight.Bright);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<AmbientLight>();

        // Act & Assert
        values.Should().HaveCount(11);
        values.Should().Contain(AmbientLight.Black);
        values.Should().Contain(AmbientLight.Darkness);
        values.Should().Contain(AmbientLight.Nighttime);
        values.Should().Contain(AmbientLight.Dim);
        values.Should().Contain(AmbientLight.Twilight);
        values.Should().Contain(AmbientLight.Default);
        values.Should().Contain(AmbientLight.Candlelight);
        values.Should().Contain(AmbientLight.Torchlight);
        values.Should().Contain(AmbientLight.Artificial);
        values.Should().Contain(AmbientLight.Daylight);
        values.Should().Contain(AmbientLight.Bright);
    }

    [Fact]
    public void Enum_OrderedFromDarkestToBrightest() {
        // Act & Assert
        ((int)AmbientLight.Black).Should().BeLessThan((int)AmbientLight.Darkness);
        ((int)AmbientLight.Darkness).Should().BeLessThan((int)AmbientLight.Nighttime);
        ((int)AmbientLight.Nighttime).Should().BeLessThan((int)AmbientLight.Dim);
        ((int)AmbientLight.Dim).Should().BeLessThan((int)AmbientLight.Twilight);
        ((int)AmbientLight.Twilight).Should().BeLessThan((int)AmbientLight.Default);
        ((int)AmbientLight.Default).Should().BeLessThan((int)AmbientLight.Candlelight);
        ((int)AmbientLight.Candlelight).Should().BeLessThan((int)AmbientLight.Torchlight);
        ((int)AmbientLight.Torchlight).Should().BeLessThan((int)AmbientLight.Artificial);
        ((int)AmbientLight.Artificial).Should().BeLessThan((int)AmbientLight.Daylight);
        ((int)AmbientLight.Daylight).Should().BeLessThan((int)AmbientLight.Bright);
    }
}
