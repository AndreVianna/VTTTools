
namespace VttTools.Library.Encounters.Model;

public class EncounterTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var encounter = new Encounter();

        // Assert
        encounter.Id.Should().NotBeEmpty();
        encounter.Name.Should().Be(Encounter.NewEncounterName);
        encounter.Description.Should().BeEmpty();
        encounter.Stage.Should().NotBeNull();
        encounter.Assets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some Encounter";
        const string description = "Some Description";
        var stage = new Stage {
            ZoomLevel = 1.5f,
            Panning = new Point(100, 200),
            Background = new ResourceInfo {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "path/to/image.png",
                ContentType = "image/png",
                Size = new Size(800, 600),
            },
            Light = AmbientLight.Twilight,
            Weather = Weather.Clear,
            Elevation = 20.0f,
            Sound = new ResourceInfo {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.AmbientSound,
                Path = "path/to/sound.mp3",
                ContentType = "audio/mpeg",
                Duration = TimeSpan.FromMinutes(3),
            },
        };
        var encounterAsset = new EncounterAsset();

        // Act
        var encounter = new Encounter {
            Id = id,
            Name = name,
            Description = description,
            Stage = stage,
            Assets = [encounterAsset],
        };

        // Assert
        encounter.Id.Should().Be(id);
        encounter.Name.Should().Be(name);
        encounter.Description.Should().Be(description);
        encounter.Stage.Should().BeEquivalentTo(stage);
        encounter.Assets.Should().ContainSingle(ea => ea.Equals(encounterAsset));
    }
}