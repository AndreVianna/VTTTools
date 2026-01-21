namespace VttTools.Library.Stages.Model;

public class StageSoundTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var sound = new StageSound();

        // Assert
        sound.Index.Should().Be(0);
        sound.Name.Should().BeNull();
        sound.Media.Should().BeNull();
        sound.Position.Should().Be(Point.Zero);
        sound.Radius.Should().Be(10.0f);
        sound.Volume.Should().Be(1.0f);
        sound.Loop.Should().BeTrue();
        sound.IsPlaying.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var media = new ResourceMetadata { Id = resourceId };
        var position = new Point(100, 150);

        // Act
        var sound = new StageSound {
            Index = 2,
            Name = "Waterfall",
            Media = media,
            Position = position,
            Radius = 30f,
            Volume = 0.7f,
            Loop = true,
            IsPlaying = true,
        };

        // Assert
        sound.Index.Should().Be(2);
        sound.Name.Should().Be("Waterfall");
        sound.Media.Should().Be(media);
        sound.Media.Id.Should().Be(resourceId);
        sound.Position.Should().Be(position);
        sound.Radius.Should().Be(30f);
        sound.Volume.Should().Be(0.7f);
        sound.Loop.Should().BeTrue();
        sound.IsPlaying.Should().BeTrue();
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageSound {
            Index = 0,
            Name = "Original Sound",
            IsPlaying = false,
        };

        // Act
        var modified = original with { IsPlaying = true };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.IsPlaying.Should().BeTrue();
        modified.Name.Should().Be("Original Sound");
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var media = new ResourceMetadata { Id = resourceId };
        var sound1 = new StageSound {
            Index = 0,
            Name = "Test Sound",
            Media = media,
        };
        var sound2 = new StageSound {
            Index = 0,
            Name = "Test Sound",
            Media = media,
        };

        // Act & Assert
        sound1.Should().Be(sound2);
        (sound1 == sound2).Should().BeTrue();
    }

    [Theory]
    [InlineData(5f)]
    [InlineData(10f)]
    [InlineData(30f)]
    [InlineData(50f)]
    public void Radius_AcceptsValidValues(float radius) {
        // Arrange & Act
        var sound = new StageSound { Radius = radius };

        // Assert
        sound.Radius.Should().Be(radius);
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(0.25f)]
    [InlineData(0.5f)]
    [InlineData(0.75f)]
    [InlineData(1.0f)]
    public void Volume_AcceptsValidValues(float volume) {
        // Arrange & Act
        var sound = new StageSound { Volume = volume };

        // Assert
        sound.Volume.Should().Be(volume);
    }

    [Fact]
    public void LoopingSound_CanBeToggled() {
        // Arrange
        var sound = new StageSound {
            Name = "Ambient Music",
            Loop = true,
        };

        // Act
        var modified = sound with { Loop = false };

        // Assert
        sound.Loop.Should().BeTrue();
        modified.Loop.Should().BeFalse();
    }

    [Fact]
    public void PlayingState_CanBeToggled() {
        // Arrange
        var sound = new StageSound {
            Name = "Combat Music",
            IsPlaying = false,
        };

        // Act
        var playing = sound with { IsPlaying = true };
        var stopped = playing with { IsPlaying = false };

        // Assert
        sound.IsPlaying.Should().BeFalse();
        playing.IsPlaying.Should().BeTrue();
        stopped.IsPlaying.Should().BeFalse();
    }
}