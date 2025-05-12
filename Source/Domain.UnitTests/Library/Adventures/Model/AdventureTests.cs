namespace VttTools.Library.Adventures.Model;

public class AdventureTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var adventure = new Adventure();

        // Assert
        adventure.Id.Should().NotBeEmpty();
        adventure.OwnerId.Should().BeEmpty();
        adventure.ParentId.Should().BeNull();
        adventure.Campaign.Should().BeNull();
        adventure.TemplateId.Should().BeNull();
        adventure.Scenes.Should().NotBeNull();
        adventure.Scenes.Should().BeEmpty();
        adventure.Name.Should().BeEmpty();
        adventure.Description.Should().BeEmpty();
        adventure.Type.Should().Be(AdventureType.OpenWorld);
        adventure.ImagePath.Should().BeNull();
        adventure.IsVisible.Should().BeFalse();
        adventure.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Adventure";
        const string description = "Adventure description";
        const AdventureType type = AdventureType.DungeonCrawl;
        const string imagePath = "path/to/image.jpg";
        const bool isVisible = true;
        const bool isPublic = true;
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var campaign = new Campaign {
            Id = parentId,
        };
        var scene = new Scene {
            Id = Guid.NewGuid(),
        };

        // Act
        var adventure = new Adventure {
            Id = id,
            Name = name,
            Description = description,
            Type = type,
            ImagePath = imagePath,
            IsVisible = isVisible,
            IsPublic = isPublic,
            OwnerId = ownerId,
            TemplateId = templateId,
            ParentId = parentId,
            Campaign = campaign,
            Scenes = [scene],
        };

        // Assert
        adventure.Id.Should().Be(id);
        adventure.Name.Should().Be(name);
        adventure.Description.Should().Be(description);
        adventure.Type.Should().Be(type);
        adventure.ImagePath.Should().Be(imagePath);
        adventure.IsVisible.Should().Be(isVisible);
        adventure.IsPublic.Should().Be(isPublic);
        adventure.OwnerId.Should().Be(ownerId);
        adventure.TemplateId.Should().Be(templateId);
        adventure.ParentId.Should().Be(parentId);
        adventure.Campaign.Should().Be(campaign);
        adventure.Scenes.Should().ContainSingle(e => e.Equals(scene));
    }
}