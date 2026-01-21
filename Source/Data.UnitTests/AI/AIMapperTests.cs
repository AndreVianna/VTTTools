using PromptTemplateModel = VttTools.AI.Model.PromptTemplate;

namespace VttTools.Data.AI;

public class AiMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var referenceImage = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "test/reference",
            FileName = "reference.png",
            ContentType = "image/png",
            FileSize = 1000,
            Dimensions = new(100, 100),
            Duration = TimeSpan.Zero,
        };

        var entity = new Entities.PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "Test Template",
            Category = GeneratedContentType.ImagePortrait,
            Version = "1.0",
            SystemPrompt = "System prompt",
            UserPromptTemplate = "User prompt template",
            NegativePromptTemplate = "Negative prompt",
            ReferenceImageId = referenceImage.Id,
            ReferenceImage = referenceImage,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Name.Should().Be(entity.Name);
        result.Category.Should().Be(entity.Category);
        result.Version.Should().Be(entity.Version);
        result.SystemPrompt.Should().Be(entity.SystemPrompt);
        result.UserPromptTemplate.Should().Be(entity.UserPromptTemplate);
        result.NegativePromptTemplate.Should().Be(entity.NegativePromptTemplate);
        result.ReferenceImage.Should().NotBeNull();
        result.ReferenceImage!.Id.Should().Be(referenceImage.Id);
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.PromptTemplate? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithoutReferenceImage_ReturnsModelWithoutImage() {
        var entity = new Entities.PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "Test Template",
            Category = GeneratedContentType.ImageBackground,
            Version = "1.0",
            SystemPrompt = "System prompt",
            UserPromptTemplate = "User prompt template",
            NegativePromptTemplate = null,
            ReferenceImageId = null,
            ReferenceImage = null,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.ReferenceImage.Should().BeNull();
        result.NegativePromptTemplate.Should().BeNull();
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var referenceImage = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "test/reference",
            FileName = "reference.png",
            ContentType = "image/png",
            FileSize = 1000,
            Dimensions = new(100, 100),
            Duration = TimeSpan.Zero,
        };

        var model = new PromptTemplateModel {
            Id = Guid.CreateVersion7(),
            Name = "Test Model",
            Category = GeneratedContentType.TextDescription,
            Version = "2.0",
            SystemPrompt = "System prompt",
            UserPromptTemplate = "User prompt",
            NegativePromptTemplate = "Negative",
            ReferenceImage = referenceImage,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.Name.Should().Be(model.Name);
        result.Category.Should().Be(model.Category);
        result.Version.Should().Be(model.Version);
        result.SystemPrompt.Should().Be(model.SystemPrompt);
        result.UserPromptTemplate.Should().Be(model.UserPromptTemplate);
        result.NegativePromptTemplate.Should().Be(model.NegativePromptTemplate);
        result.ReferenceImageId.Should().Be(referenceImage.Id);
    }

    [Fact]
    public void ToEntity_WithoutReferenceImage_ReturnsEntityWithoutImageId() {
        var model = new PromptTemplateModel {
            Id = Guid.CreateVersion7(),
            Name = "Test Model",
            Category = GeneratedContentType.TextDescription,
            Version = "1.0",
            SystemPrompt = "System",
            UserPromptTemplate = "User",
            NegativePromptTemplate = null,
            ReferenceImage = null,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.ReferenceImageId.Should().BeNull();
        result.NegativePromptTemplate.Should().BeNull();
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "Old Name",
            Category = GeneratedContentType.ImagePortrait,
            Version = "1.0",
            SystemPrompt = "Old system",
            UserPromptTemplate = "Old user",
            NegativePromptTemplate = "Old negative",
            ReferenceImageId = Guid.CreateVersion7(),
        };

        var newReferenceImageId = Guid.CreateVersion7();
        var model = new PromptTemplateModel {
            Id = entity.Id,
            Name = "New Name",
            Category = GeneratedContentType.ImageBackground,
            Version = "2.0",
            SystemPrompt = "New system",
            UserPromptTemplate = "New user",
            NegativePromptTemplate = "New negative",
            ReferenceImage = new ResourceMetadata {
                Id = newReferenceImageId,
                Path = "test/path",
                FileName = "test.png",
                ContentType = "image/png",
                FileSize = 1000,
                Dimensions = new(100, 100),
                Duration = TimeSpan.Zero,
            },
        };

        entity.UpdateFrom(model);

        entity.Name.Should().Be("New Name");
        entity.Category.Should().Be(GeneratedContentType.ImageBackground);
        entity.Version.Should().Be("2.0");
        entity.SystemPrompt.Should().Be("New system");
        entity.UserPromptTemplate.Should().Be("New user");
        entity.NegativePromptTemplate.Should().Be("New negative");
        entity.ReferenceImageId.Should().Be(newReferenceImageId);
    }

    [Fact]
    public void UpdateFrom_WithNullReferenceImage_ClearsReferenceImageId() {
        var entity = new Entities.PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "Test",
            Category = GeneratedContentType.ImagePortrait,
            Version = "1.0",
            SystemPrompt = "System",
            UserPromptTemplate = "User",
            ReferenceImageId = Guid.CreateVersion7(),
        };

        var model = new PromptTemplateModel {
            Id = entity.Id,
            Name = "Updated Test",
            Category = GeneratedContentType.TextDescription,
            Version = "1.1",
            SystemPrompt = "Updated system",
            UserPromptTemplate = "Updated user",
            ReferenceImage = null,
        };

        entity.UpdateFrom(model);

        entity.ReferenceImageId.Should().BeNull();
    }
}