namespace VttTools.Library.Encounters.Model;

public class EncounterRegionTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var region = new EncounterRegion();

        // Assert
        region.Index.Should().Be(0);
        region.Name.Should().BeNull();
        region.Type.Should().Be(default);
        region.Vertices.Should().BeEmpty();
        region.Value.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var vertices = new List<Point> {
            new(0, 0),
            new(10, 0),
            new(10, 10),
            new(0, 10),
        };

        // Act
        var region = new EncounterRegion {
            Index = 1,
            Name = "Region 1",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };

        // Assert
        region.Index.Should().Be(1);
        region.Name.Should().Be("Region 1");
        region.Type.Should().Be(RegionType.Terrain);
        region.Vertices.Should().HaveCount(4);
        region.Vertices.Should().BeEquivalentTo(vertices);
        region.Value.Should().Be(5);
    }

    [Fact]
    public void WithClause_WithChangedIndex_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegion();

        // Act
        var updated = original with { Index = 5 };

        // Assert
        updated.Index.Should().Be(5);
        original.Index.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedName_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegion();

        // Act
        var updated = original with { Name = "Updated Region" };

        // Assert
        updated.Name.Should().Be("Updated Region");
        original.Name.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedType_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegion();

        // Act
        var updated = original with { Type = RegionType.Ilumination };

        // Assert
        updated.Type.Should().Be(RegionType.Ilumination);
        original.Type.Should().Be(default);
    }

    [Fact]
    public void WithClause_WithChangedVertices_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegion();
        var vertices = new List<Point> {
            new(0, 0),
            new(5, 5),
        };

        // Act
        var updated = original with { Vertices = vertices };

        // Assert
        updated.Vertices.Should().HaveCount(2);
        original.Vertices.Should().BeEmpty();
    }

    [Fact]
    public void WithClause_WithChangedValue_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegion();

        // Act
        var updated = original with { Value = 10 };

        // Assert
        updated.Value.Should().Be(10);
        original.Value.Should().Be(0);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var vertices = new List<Point> {
            new(0, 0),
            new(10, 10),
        };
        var region1 = new EncounterRegion {
            Index = 1,
            Name = "Region 1",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };
        var region2 = new EncounterRegion {
            Index = 1,
            Name = "Region 1",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };

        // Act & Assert
        region1.Should().Be(region2);
        (region1 == region2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var region1 = new EncounterRegion { Index = 1 };
        var region2 = new EncounterRegion { Index = 2 };

        // Act & Assert
        region1.Should().NotBe(region2);
        (region1 != region2).Should().BeTrue();
    }
}
