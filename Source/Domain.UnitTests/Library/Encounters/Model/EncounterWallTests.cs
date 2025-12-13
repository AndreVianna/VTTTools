namespace VttTools.Library.Encounters.Model;

public class EncounterWallTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var wall = new EncounterWall();

        // Assert
        wall.Index.Should().Be(0);
        wall.Segments.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1, StartPole = new Pole(0, 0, 0), EndPole = new Pole(5, 5, 0) },
            new() { Index = 2, StartPole = new Pole(5, 5, 0), EndPole = new Pole(10, 5, 0) },
        };

        // Act
        var wall = new EncounterWall {
            Index = 5,
            Segments = segments,
        };

        // Assert
        wall.Index.Should().Be(5);
        wall.Segments.Should().HaveCount(2);
        wall.Segments.Should().BeEquivalentTo(segments);
    }

    [Fact]
    public void WithClause_WithChangedIndex_UpdatesProperty() {
        // Arrange
        var original = new EncounterWall();

        // Act
        var updated = original with { Index = 10 };

        // Assert
        updated.Index.Should().Be(10);
        original.Index.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedSegments_UpdatesProperty() {
        // Arrange
        var original = new EncounterWall();
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1 },
        };

        // Act
        var updated = original with { Segments = segments };

        // Assert
        updated.Segments.Should().HaveCount(1);
        original.Segments.Should().BeEmpty();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1 },
        };
        var wall1 = new EncounterWall {
            Index = 5,
            Segments = segments,
        };
        var wall2 = new EncounterWall {
            Index = 5,
            Segments = segments,
        };

        // Act & Assert
        wall1.Should().Be(wall2);
        (wall1 == wall2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var wall1 = new EncounterWall { Index = 5 };
        var wall2 = new EncounterWall { Index = 10 };

        // Act & Assert
        wall1.Should().NotBe(wall2);
        (wall1 != wall2).Should().BeTrue();
    }
}
