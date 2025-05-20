namespace VttTools.Library.Scenes.Model;

public class SceneTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var scene = new Scene();

        // Assert
        scene.Id.Should().NotBeEmpty();
        scene.Name.Should().BeEmpty();
        scene.Description.Should().BeEmpty();
        scene.Stage.Should().NotBeNull();
        scene.SceneAssets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Scene";
        const string description = "Some Description";
        var stage = new Stage();
        var sceneAsset = new SceneAsset();

        // Act
        var scene = new Scene {
            Id = id,
            Name = name,
            Description = description,
            Stage = stage,
            SceneAssets = [sceneAsset],
        };

        // Assert
        scene.Id.Should().Be(id);
        scene.Name.Should().Be(name);
        scene.Description.Should().Be(description);
        scene.Stage.Should().BeSameAs(stage);
        scene.SceneAssets.Should().ContainSingle(ea => ea.Equals(sceneAsset));
    }
}