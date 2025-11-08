
namespace VttTools.Library.Scenes.Model;

public class SceneTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var scene = new Scene();

        // Assert
        scene.Id.Should().NotBeEmpty();
        scene.Name.Should().Be(Scene.NewSceneName);
        scene.Description.Should().BeEmpty();
        scene.Stage.Should().NotBeNull();
        scene.Assets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some Scene";
        const string description = "Some Description";
        var stage = new Stage {
            ZoomLevel = 1.5f,
            Panning = new Point(100, 200),
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "path/to/image.png",
                Metadata = new() {
                    ContentType = "image/png",
                    ImageSize = new Size(800, 600),
                },
                Tags = ["tag1", "tag2"],
            },
            Light = Light.Twilight,
            Weather = Weather.Clear,
            Elevation = 20.0f,
            Sound = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Audio,
                Path = "path/to/sound.mp3",
                Metadata = new() {
                    ContentType = "audio/mpeg",
                    Duration = TimeSpan.FromMinutes(3),
                },
                Tags = ["ambient", "background"],
            },
        };
        var sceneAsset = new SceneAsset();

        // Act
        var scene = new Scene {
            Id = id,
            Name = name,
            Description = description,
            Stage = stage,
            Assets = [sceneAsset],
        };

        // Assert
        scene.Id.Should().Be(id);
        scene.Name.Should().Be(name);
        scene.Description.Should().Be(description);
        scene.Stage.Should().BeEquivalentTo(stage);
        scene.Assets.Should().ContainSingle(ea => ea.Equals(sceneAsset));
    }
}