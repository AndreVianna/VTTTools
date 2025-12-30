namespace VttTools.Library.Stages.Model;

public class StageRegionTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var region = new StageRegion();

        // Assert
        region.Index.Should().Be(0);
        region.Name.Should().BeNull();
        region.Type.Should().Be(RegionType.Elevation);
        region.Vertices.Should().BeEmpty();
        region.Value.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var vertices = new List<StageRegionVertex> {
            new(0, 0),
            new(100, 0),
            new(100, 100),
            new(0, 100),
        };

        // Act
        var region = new StageRegion {
            Index = 3,
            Name = "Terrain Zone",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 10,
        };

        // Assert
        region.Index.Should().Be(3);
        region.Name.Should().Be("Terrain Zone");
        region.Type.Should().Be(RegionType.Terrain);
        region.Vertices.Should().HaveCount(4);
        region.Value.Should().Be(10);
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageRegion {
            Index = 0,
            Name = "Original Region",
            Type = RegionType.Terrain,
        };

        // Act
        var modified = original with { Type = RegionType.Illumination };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.Type.Should().Be(RegionType.Illumination);
        modified.Name.Should().Be("Original Region");
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        // Note: Records with List<T> properties use reference equality for lists.
        // Two separate StageRegion instances each create a new List<StageRegionVertex>,
        // so they won't be == equal even with identical scalar properties.
        // For value comparison, use BeEquivalentTo; for identity, check scalar properties.
        var region1 = new StageRegion {
            Index = 0,
            Name = "Test Region",
            Type = RegionType.Terrain,
        };
        var region2 = new StageRegion {
            Index = 0,
            Name = "Test Region",
            Type = RegionType.Terrain,
        };

        // Act & Assert
        // Use BeEquivalentTo for structural equality since List<T> doesn't support value equality
        region1.Should().BeEquivalentTo(region2);

        // Test that with expression creates proper equality for same reference
        var region3 = region1 with { };
        region3.Index.Should().Be(region1.Index);
        region3.Name.Should().Be(region1.Name);
        region3.Type.Should().Be(region1.Type);
    }

    [Theory]
    [InlineData(RegionType.Elevation)]
    [InlineData(RegionType.Terrain)]
    [InlineData(RegionType.Illumination)]
    [InlineData(RegionType.FogOfWar)]
    public void Type_AcceptsAllRegionTypeValues(RegionType type) {
        // Arrange & Act
        var region = new StageRegion { Type = type };

        // Assert
        region.Type.Should().Be(type);
    }

    [Fact]
    public void Vertices_AsPolygon_RepresentsShape() {
        // Arrange
        var vertices = new List<StageRegionVertex> {
            new(0, 0),
            new(50, 0),
            new(50, 50),
            new(0, 50),
        };

        // Act
        var region = new StageRegion {
            Name = "Square Region",
            Vertices = vertices,
        };

        // Assert
        region.Vertices.Should().HaveCount(4);
        region.Vertices[0].Should().Be(new StageRegionVertex(0, 0));
        region.Vertices[1].Should().Be(new StageRegionVertex(50, 0));
        region.Vertices[2].Should().Be(new StageRegionVertex(50, 50));
        region.Vertices[3].Should().Be(new StageRegionVertex(0, 50));
    }
}
