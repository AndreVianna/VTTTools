namespace VttTools.Library.Scenes.Model;

public class SceneTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var scene = new Scene();

        // Assert
        scene.Id.Should().NotBeEmpty();
        scene.OwnerId.Should().BeEmpty();
        scene.ParentId.Should().BeEmpty();
        scene.Adventure.Should().BeNull();
        scene.IsTemplate.Should().BeFalse();
        scene.TemplateId.Should().BeNull();
        scene.Name.Should().BeEmpty();
        scene.Visibility.Should().Be(Visibility.Hidden);
        scene.Stage.Should().NotBeNull();
        scene.SceneAssets.Should().NotBeNull();
        scene.SceneAssets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Scene";
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var adventure = new Adventure();
        var templateId = Guid.NewGuid();
        const bool isTemplate = true;
        var stage = new Stage();
        var sceneAsset = new SceneAsset();

        // Act
        var scene = new Scene {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            ParentId = parentId,
            Adventure = adventure,
            IsTemplate = isTemplate,
            TemplateId = templateId,
            Visibility = Visibility.Public,
            Stage = stage,
            SceneAssets = [sceneAsset],
        };

        // Assert
        scene.Id.Should().Be(id);
        scene.OwnerId.Should().Be(ownerId);
        scene.ParentId.Should().Be(parentId);
        scene.Adventure.Should().BeSameAs(adventure);
        scene.IsTemplate.Should().Be(isTemplate);
        scene.TemplateId.Should().Be(templateId);
        scene.Name.Should().Be(name);
        scene.Visibility.Should().Be(Visibility.Public);
        scene.Stage.Should().BeSameAs(stage);
        scene.SceneAssets.Should().ContainSingle(ea => ea.Equals(sceneAsset));
    }
}