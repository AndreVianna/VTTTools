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
        scene.Assets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Scene";
        const string description = "Some Description";
        var display = new Display {
            FileName = "some_file.png",
            Type = ResourceType.Image,
            Size = new(800, 600),
        };
        var sceneAsset = new SceneAsset();

        // Act
        var scene = new Scene {
            Id = id,
            Name = name,
            Description = description,
            Stage = display,
            Assets = [sceneAsset],
        };

        // Assert
        scene.Id.Should().Be(id);
        scene.Name.Should().Be(name);
        scene.Description.Should().Be(description);
        scene.Stage.Should().BeEquivalentTo(display);
        scene.Assets.Should().ContainSingle(ea => ea.Equals(sceneAsset));
    }
}