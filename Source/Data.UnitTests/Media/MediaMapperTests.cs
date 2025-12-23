namespace VttTools.Data.Media;

public class MediaMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "assets/backgrounds/cave.jpg",
            ContentType = "image/jpeg",
            FileName = "cave.jpg",
            FileSize = 250000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Path.Should().Be("assets/backgrounds/cave.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("cave.jpg");
        result.FileSize.Should().Be(250000);
        result.Dimensions.Should().Be(new Size(1920, 1080));
        result.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.Resource? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithAudioResource_IncludesDuration() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "assets/audio/forest.mp3",
            ContentType = "audio/mpeg",
            FileName = "forest.mp3",
            FileSize = 1500000,
            Dimensions = new(0, 0),
            Duration = TimeSpan.FromMinutes(3),
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Duration.Should().Be(TimeSpan.FromMinutes(3));
        result.ContentType.Should().Be("audio/mpeg");
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "assets/backgrounds/throne.jpg",
            ContentType = "image/jpeg",
            FileName = "throne.jpg",
            FileSize = 300000,
            Dimensions = new(2560, 1440),
            Duration = TimeSpan.Zero,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.Path.Should().Be("assets/backgrounds/throne.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("throne.jpg");
        result.FileSize.Should().Be(300000);
        result.Dimensions.Should().Be(new Size(2560, 1440));
        result.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "old/path.jpg",
            ContentType = "image/jpeg",
            FileName = "old.jpg",
            FileSize = 100000,
            Dimensions = new(800, 600),
            Duration = TimeSpan.Zero,
        };

        var model = new ResourceMetadata {
            Id = entity.Id,
            Path = "new/path.png",
            ContentType = "image/png",
            FileName = "new.png",
            FileSize = 200000,
            Dimensions = new(1024, 1024),
            Duration = TimeSpan.FromSeconds(5),
        };

        entity.UpdateFrom(model);

        entity.Path.Should().Be("new/path.png");
        entity.ContentType.Should().Be("image/png");
        entity.FileName.Should().Be("new.png");
        entity.FileSize.Should().Be(200000);
        entity.Dimensions.Should().Be(new Size(1024, 1024));
        entity.Duration.Should().Be(TimeSpan.FromSeconds(5));
    }
}
