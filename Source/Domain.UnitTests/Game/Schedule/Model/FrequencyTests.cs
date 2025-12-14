namespace VttTools.Game.Schedule.Model;

public class FrequencyTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)Frequency.Once).Should().Be(0);
        ((int)Frequency.Daily).Should().Be(1);
        ((int)Frequency.Weekly).Should().Be(2);
        ((int)Frequency.Monthly).Should().Be(3);
        ((int)Frequency.Yearly).Should().Be(4);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        nameof(
        // Act & Assert
        Frequency.Once).Should().Be("Once");
        nameof(Frequency.Daily).Should().Be("Daily");
        nameof(Frequency.Weekly).Should().Be("Weekly");
        nameof(Frequency.Monthly).Should().Be("Monthly");
        nameof(Frequency.Yearly).Should().Be("Yearly");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<Frequency>("Once").Should().Be(Frequency.Once);
        Enum.Parse<Frequency>("Daily").Should().Be(Frequency.Daily);
        Enum.Parse<Frequency>("Weekly").Should().Be(Frequency.Weekly);
        Enum.Parse<Frequency>("Monthly").Should().Be(Frequency.Monthly);
        Enum.Parse<Frequency>("Yearly").Should().Be(Frequency.Yearly);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<Frequency>();

        // Act & Assert
        values.Should().HaveCount(5);
        values.Should().Contain(Frequency.Once);
        values.Should().Contain(Frequency.Daily);
        values.Should().Contain(Frequency.Weekly);
        values.Should().Contain(Frequency.Monthly);
        values.Should().Contain(Frequency.Yearly);
    }
}
