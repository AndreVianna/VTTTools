namespace VttTools.Library.Stages.Model;

public class StageTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var stage = new Stage();

        // Assert
        stage.Id.Should().NotBe(Guid.Empty);
        stage.OwnerId.Should().Be(Guid.Empty);
        stage.Name.Should().Be(Stage.NewStageName);
        stage.Description.Should().BeEmpty();
        stage.IsPublished.Should().BeFalse();
        stage.IsPublic.Should().BeFalse();
        stage.Settings.Should().NotBeNull();
        stage.Grid.Should().NotBeNull();
        stage.Walls.Should().BeEmpty();
        stage.Regions.Should().BeEmpty();
        stage.Lights.Should().BeEmpty();
        stage.Elements.Should().BeEmpty();
        stage.Sounds.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var settings = new StageSettings { ZoomLevel = 1.5f };
        var grid = new Grid { Type = GridType.HexV };
        var walls = new List<StageWall> { new() { Index = 0, Name = "Wall 1" } };
        var regions = new List<StageRegion> { new() { Index = 0, Name = "Region 1" } };
        var lights = new List<StageLight> { new() { Index = 0, Name = "AmbientLight 1" } };
        var elements = new List<StageElement> { new() { Index = 0, Name = "Decoration 1" } };
        var sounds = new List<StageSound> { new() { Index = 0, Name = "Sound 1" } };

        // Act
        var stage = new Stage {
            Id = id,
            OwnerId = ownerId,
            Name = "Test Stage",
            Description = "A test stage",
            IsPublished = true,
            IsPublic = true,
            Settings = settings,
            Grid = grid,
            Walls = walls,
            Regions = regions,
            Lights = lights,
            Elements = elements,
            Sounds = sounds,
        };

        // Assert
        stage.Id.Should().Be(id);
        stage.OwnerId.Should().Be(ownerId);
        stage.Name.Should().Be("Test Stage");
        stage.Description.Should().Be("A test stage");
        stage.IsPublished.Should().BeTrue();
        stage.IsPublic.Should().BeTrue();
        stage.Settings.Should().Be(settings);
        stage.Grid.Should().Be(grid);
        stage.Walls.Should().HaveCount(1);
        stage.Regions.Should().HaveCount(1);
        stage.Lights.Should().HaveCount(1);
        stage.Elements.Should().HaveCount(1);
        stage.Sounds.Should().HaveCount(1);
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new Stage {
            Name = "Original",
            Description = "Original Description",
            IsPublished = false,
        };

        // Act
        var modified = original with { Name = "Modified" };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.Name.Should().Be("Modified");
        modified.Description.Should().Be("Original Description");
        modified.IsPublished.Should().BeFalse();
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var stage1 = new Stage {
            Id = id,
            OwnerId = ownerId,
            Name = "Test Stage",
        };
        var stage2 = new Stage {
            Id = id,
            OwnerId = ownerId,
            Name = "Test Stage",
        };

        // Act & Assert
        stage1.Should().Be(stage2);
        (stage1 == stage2).Should().BeTrue();
    }

    [Fact]
    public void Record_Inequality_WorksCorrectly() {
        // Arrange
        var stage1 = new Stage {
            Id = Guid.CreateVersion7(),
            Name = "Stage 1",
        };
        var stage2 = new Stage {
            Id = Guid.CreateVersion7(),
            Name = "Stage 2",
        };

        // Act & Assert
        stage1.Should().NotBe(stage2);
        (stage1 != stage2).Should().BeTrue();
    }
}