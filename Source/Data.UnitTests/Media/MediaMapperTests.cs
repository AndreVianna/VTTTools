namespace VttTools.Data.Media;

public class MediaMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        // Arrange
        var ownerId = Guid.CreateVersion7();
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Role = ResourceRole.Background,
            Path = "assets/backgrounds/cave.jpg",
            ContentType = "image/jpeg",
            FileName = "cave.jpg",
            FileSize = 250000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        // Act
        var result = entity.ToModel();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Role.Should().Be(ResourceRole.Background);
        result.Path.Should().Be("assets/backgrounds/cave.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("cave.jpg");
        result.FileSize.Should().Be(250000);
        result.Dimensions.Should().Be(new Size(1920, 1080));
        result.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        // Arrange
        Entities.Resource? entity = null;

        // Act
        var result = entity.ToModel();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithAudioResource_IncludesDuration() {
        // Arrange
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Path = "assets/audio/forest.mp3",
            ContentType = "audio/mpeg",
            FileName = "forest.mp3",
            FileSize = 1500000,
            Dimensions = new(0, 0),
            Duration = TimeSpan.FromMinutes(3),
        };

        // Act
        var result = entity.ToModel();

        // Assert
        result.Should().NotBeNull();
        result.Duration.Should().Be(TimeSpan.FromMinutes(3));
        result.ContentType.Should().Be("audio/mpeg");
    }

    [Fact]
    public void ToModel_WithVideoResource_IncludesDimensionsAndDuration() {
        // Arrange
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Path = "assets/video/intro.mp4",
            ContentType = "video/mp4",
            FileName = "intro.mp4",
            FileSize = 50000000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.FromMinutes(5),
        };

        // Act
        var result = entity.ToModel();

        // Assert
        result.Should().NotBeNull();
        result.Dimensions.Should().Be(new Size(1920, 1080));
        result.Duration.Should().Be(TimeSpan.FromMinutes(5));
        result.ContentType.Should().Be("video/mp4");
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        // Arrange
        var ownerId = Guid.CreateVersion7();
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Role = ResourceRole.Illustration,
            Path = "assets/backgrounds/throne.jpg",
            ContentType = "image/jpeg",
            FileName = "throne.jpg",
            FileSize = 300000,
            Dimensions = new(2560, 1440),
            Duration = TimeSpan.Zero,
        };

        // Act
        var result = model.ToEntity();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Role.Should().Be(ResourceRole.Illustration);
        result.Path.Should().Be("assets/backgrounds/throne.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("throne.jpg");
        result.FileSize.Should().Be(300000);
        result.Dimensions.Should().Be(new Size(2560, 1440));
        result.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void ToEntity_WithAudioModel_PreservesDuration() {
        // Arrange
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Path = "assets/audio/ambient.mp3",
            ContentType = "audio/mpeg",
            FileName = "ambient.mp3",
            FileSize = 2500000,
            Dimensions = new(0, 0),
            Duration = TimeSpan.FromMinutes(10),
        };

        // Act
        var result = model.ToEntity();

        // Assert
        result.Should().NotBeNull();
        result.Duration.Should().Be(TimeSpan.FromMinutes(10));
        result.ContentType.Should().Be("audio/mpeg");
    }

    [Fact]
    public void ToEntity_WithVideoModel_PreservesDimensionsAndDuration() {
        // Arrange
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Path = "assets/video/cutscene.mp4",
            ContentType = "video/mp4",
            FileName = "cutscene.mp4",
            FileSize = 100000000,
            Dimensions = new(3840, 2160),
            Duration = TimeSpan.FromMinutes(15),
        };

        // Act
        var result = model.ToEntity();

        // Assert
        result.Should().NotBeNull();
        result.Dimensions.Should().Be(new Size(3840, 2160));
        result.Duration.Should().Be(TimeSpan.FromMinutes(15));
        result.ContentType.Should().Be("video/mp4");
    }

    [Fact]
    public void UpdateFrom_UpdatesEntityFromModel() {
        // Arrange
        var ownerId = Guid.CreateVersion7();
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Role = ResourceRole.Token,
            Path = "old/path.jpg",
            ContentType = "image/jpeg",
            FileName = "old.jpg",
            FileSize = 100000,
            Dimensions = new(800, 600),
            Duration = TimeSpan.Zero,
        };

        var newOwnerId = Guid.CreateVersion7();
        var model = new ResourceMetadata {
            Id = entity.Id,
            OwnerId = newOwnerId,
            Role = ResourceRole.Background,
            Path = "new/path.png",
            ContentType = "image/png",
            FileName = "new.png",
            FileSize = 200000,
            Dimensions = new(1024, 1024),
            Duration = TimeSpan.FromSeconds(5),
        };

        // Act
        entity.UpdateFrom(model);

        // Assert - UpdateFrom updates all mutable properties from the model
        entity.OwnerId.Should().Be(newOwnerId);
        entity.Role.Should().Be(ResourceRole.Background);
        entity.Path.Should().Be("new/path.png");
        entity.ContentType.Should().Be("image/png");
        entity.FileName.Should().Be("new.png");
        entity.FileSize.Should().Be(200000UL);
        entity.Dimensions.Should().Be(new Size(1024, 1024));
        entity.Duration.Should().Be(TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void AsResource_Expression_MapsAllProperties() {
        // Arrange
        var ownerId = Guid.CreateVersion7();
        var id = Guid.CreateVersion7();
        var entity = new Entities.Resource {
            Id = id,
            OwnerId = ownerId,
            Role = ResourceRole.Portrait,
            Path = "assets/test/file.png",
            ContentType = "image/png",
            FileName = "file.png",
            FileSize = 50000,
            Dimensions = new(512, 512),
            Duration = TimeSpan.Zero,
        };

        // Act - compile and invoke the expression
        var func = Mapper.AsResource.Compile();
        var result = func(entity);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(id);
        result.OwnerId.Should().Be(ownerId);
        result.Role.Should().Be(ResourceRole.Portrait);
        result.Path.Should().Be("assets/test/file.png");
        result.ContentType.Should().Be("image/png");
        result.FileName.Should().Be("file.png");
        result.FileSize.Should().Be(50000);
        result.Dimensions.Should().Be(new Size(512, 512));
        result.Duration.Should().Be(TimeSpan.Zero);
    }
}