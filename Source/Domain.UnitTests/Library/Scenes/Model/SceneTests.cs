namespace VttTools.Library.Scenes.Model;

public class SceneTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var scene = new Scene();

        // Assert
        scene.Id.Should().NotBeEmpty();
        scene.OwnerId.Should().BeEmpty();
        scene.AdventureId.Should().BeEmpty();
        scene.Adventure.Should().BeNull();
        scene.Name.Should().BeEmpty();
        scene.Description.Should().BeEmpty();
        scene.Stage.Should().NotBeNull();
        scene.SceneAssets.Should().BeEmpty();
        scene.IsPublic.Should().BeFalse();
        scene.IsListed.Should().BeFalse();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Scene";
        const string description = "Some Description";
        var ownerId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure();
        var stage = new Stage();
        var sceneAsset = new SceneAsset();

        // Act
        var scene = new Scene {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Description = description,
            AdventureId = adventureId,
            Adventure = adventure,
            Stage = stage,
            IsPublic = true,
            IsListed = true,
            SceneAssets = [sceneAsset],
        };

        // Assert
        scene.Id.Should().Be(id);
        scene.OwnerId.Should().Be(ownerId);
        scene.AdventureId.Should().Be(adventureId);
        scene.Adventure.Should().BeSameAs(adventure);
        scene.Name.Should().Be(name);
        scene.Description.Should().Be(description);
        scene.Stage.Should().BeSameAs(stage);
        scene.IsPublic.Should().BeTrue();
        scene.IsListed.Should().BeTrue();
        scene.SceneAssets.Should().ContainSingle(ea => ea.Equals(sceneAsset));
    }
}