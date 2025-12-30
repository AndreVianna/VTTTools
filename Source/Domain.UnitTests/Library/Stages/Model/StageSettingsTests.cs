namespace VttTools.Library.Stages.Model;

public class StageSettingsTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var settings = new StageSettings();

        // Assert
        settings.MainBackground.Should().BeNull();
        settings.AlternateBackground.Should().BeNull();
        settings.ZoomLevel.Should().Be(1f);
        settings.Panning.Should().Be(Point.Zero);
        settings.AmbientLight.Should().Be(AmbientLight.Default);
        settings.AmbientSound.Should().BeNull();
        settings.AmbientSoundVolume.Should().Be(1.0f);
        settings.AmbientSoundLoop.Should().BeTrue();
        settings.AmbientSoundIsPlaying.Should().BeFalse();
        settings.Weather.Should().Be(Weather.Clear);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var mainBackgroundId = Guid.CreateVersion7();
        var mainBackground = new ResourceMetadata { Id = mainBackgroundId };
        var alternateBackgroundId = Guid.CreateVersion7();
        var alternateBackground = new ResourceMetadata { Id = alternateBackgroundId };
        var panning = new Point(100, 200);
        var soundId = Guid.CreateVersion7();
        var sound = new ResourceMetadata { Id = soundId };

        // Act
        var settings = new StageSettings {
            MainBackground = mainBackground,
            AlternateBackground = alternateBackground,
            ZoomLevel = 2.5f,
            Panning = panning,
            AmbientLight = AmbientLight.Daylight,
            AmbientSound = sound,
            AmbientSoundVolume = 0.75f,
            AmbientSoundLoop = false,
            AmbientSoundIsPlaying = true,
            Weather = Weather.Rain,
        };

        // Assert
        settings.MainBackground.Should().Be(mainBackground);
        settings.AlternateBackground.Should().Be(alternateBackground);
        settings.ZoomLevel.Should().Be(2.5f);
        settings.Panning.Should().Be(panning);
        settings.AmbientLight.Should().Be(AmbientLight.Daylight);
        settings.AmbientSound.Should().Be(sound);
        settings.AmbientSoundVolume.Should().Be(0.75f);
        settings.AmbientSoundLoop.Should().BeFalse();
        settings.AmbientSoundIsPlaying.Should().BeTrue();
        settings.Weather.Should().Be(Weather.Rain);
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageSettings {
            ZoomLevel = 1.0f,
            AmbientLight = AmbientLight.Dim,
        };

        // Act
        var modified = original with { ZoomLevel = 2.0f };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.ZoomLevel.Should().Be(2.0f);
        modified.AmbientLight.Should().Be(AmbientLight.Dim);
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var settings1 = new StageSettings {
            ZoomLevel = 1.5f,
            AmbientLight = AmbientLight.Torchlight,
        };
        var settings2 = new StageSettings {
            ZoomLevel = 1.5f,
            AmbientLight = AmbientLight.Torchlight,
        };

        // Act & Assert
        settings1.Should().Be(settings2);
        (settings1 == settings2).Should().BeTrue();
    }

    [Theory]
    [InlineData(0.5f)]
    [InlineData(1.0f)]
    [InlineData(2.0f)]
    [InlineData(5.0f)]
    public void ZoomLevel_AcceptsValidValues(float zoomLevel) {
        // Arrange & Act
        var settings = new StageSettings { ZoomLevel = zoomLevel };

        // Assert
        settings.ZoomLevel.Should().Be(zoomLevel);
    }

    [Theory]
    [InlineData(AmbientLight.Black)]
    [InlineData(AmbientLight.Darkness)]
    [InlineData(AmbientLight.Default)]
    [InlineData(AmbientLight.Daylight)]
    [InlineData(AmbientLight.Bright)]
    public void AmbientLight_AcceptsAllValues(AmbientLight ambientLight) {
        // Arrange & Act
        var settings = new StageSettings { AmbientLight = ambientLight };

        // Assert
        settings.AmbientLight.Should().Be(ambientLight);
    }

    [Theory]
    [InlineData(Weather.Clear)]
    [InlineData(Weather.Rain)]
    [InlineData(Weather.Snow)]
    [InlineData(Weather.Fog)]
    public void Weather_AcceptsAllWeatherValues(Weather weather) {
        // Arrange & Act
        var settings = new StageSettings { Weather = weather };

        // Assert
        settings.Weather.Should().Be(weather);
    }
}
