namespace VttTools;

public class WeatherTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)Weather.Clear).Should().Be(0);
        ((int)Weather.PartlyCloudy).Should().Be(1);
        ((int)Weather.Overcast).Should().Be(2);
        ((int)Weather.Fog).Should().Be(3);
        ((int)Weather.LightRain).Should().Be(4);
        ((int)Weather.Rain).Should().Be(5);
        ((int)Weather.HeavyRain).Should().Be(6);
        ((int)Weather.Rainstorm).Should().Be(7);
        ((int)Weather.Thunderstorm).Should().Be(8);
        ((int)Weather.LightSnow).Should().Be(9);
        ((int)Weather.Snow).Should().Be(10);
        ((int)Weather.HeavySnow).Should().Be(11);
        ((int)Weather.Snowstorm).Should().Be(12);
        ((int)Weather.Hail).Should().Be(13);
        ((int)Weather.IceStorm).Should().Be(14);
        ((int)Weather.Breezy).Should().Be(15);
        ((int)Weather.Windy).Should().Be(16);
        ((int)Weather.Hurricane).Should().Be(17);
        ((int)Weather.Tornado).Should().Be(18);
        ((int)Weather.FireStorm).Should().Be(19);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        Weather.Clear.ToString().Should().Be("Clear");
        Weather.PartlyCloudy.ToString().Should().Be("PartlyCloudy");
        Weather.Overcast.ToString().Should().Be("Overcast");
        Weather.Fog.ToString().Should().Be("Fog");
        Weather.LightRain.ToString().Should().Be("LightRain");
        Weather.Rain.ToString().Should().Be("Rain");
        Weather.HeavyRain.ToString().Should().Be("HeavyRain");
        Weather.Rainstorm.ToString().Should().Be("Rainstorm");
        Weather.Thunderstorm.ToString().Should().Be("Thunderstorm");
        Weather.LightSnow.ToString().Should().Be("LightSnow");
        Weather.Snow.ToString().Should().Be("Snow");
        Weather.HeavySnow.ToString().Should().Be("HeavySnow");
        Weather.Snowstorm.ToString().Should().Be("Snowstorm");
        Weather.Hail.ToString().Should().Be("Hail");
        Weather.IceStorm.ToString().Should().Be("IceStorm");
        Weather.Breezy.ToString().Should().Be("Breezy");
        Weather.Windy.ToString().Should().Be("Windy");
        Weather.Hurricane.ToString().Should().Be("Hurricane");
        Weather.Tornado.ToString().Should().Be("Tornado");
        Weather.FireStorm.ToString().Should().Be("FireStorm");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<Weather>("Clear").Should().Be(Weather.Clear);
        Enum.Parse<Weather>("PartlyCloudy").Should().Be(Weather.PartlyCloudy);
        Enum.Parse<Weather>("Thunderstorm").Should().Be(Weather.Thunderstorm);
        Enum.Parse<Weather>("Hurricane").Should().Be(Weather.Hurricane);
        Enum.Parse<Weather>("FireStorm").Should().Be(Weather.FireStorm);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<Weather>();

        // Act & Assert
        values.Should().HaveCount(20);
        values.Should().Contain(Weather.Clear);
        values.Should().Contain(Weather.PartlyCloudy);
        values.Should().Contain(Weather.Overcast);
        values.Should().Contain(Weather.Fog);
        values.Should().Contain(Weather.LightRain);
        values.Should().Contain(Weather.Rain);
        values.Should().Contain(Weather.HeavyRain);
        values.Should().Contain(Weather.Rainstorm);
        values.Should().Contain(Weather.Thunderstorm);
        values.Should().Contain(Weather.LightSnow);
        values.Should().Contain(Weather.Snow);
        values.Should().Contain(Weather.HeavySnow);
        values.Should().Contain(Weather.Snowstorm);
        values.Should().Contain(Weather.Hail);
        values.Should().Contain(Weather.IceStorm);
        values.Should().Contain(Weather.Breezy);
        values.Should().Contain(Weather.Windy);
        values.Should().Contain(Weather.Hurricane);
        values.Should().Contain(Weather.Tornado);
        values.Should().Contain(Weather.FireStorm);
    }
}
