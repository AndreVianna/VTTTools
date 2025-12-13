namespace VttTools.Library.Encounters.Model;

public class EncounterWallSegmentTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var segment = new EncounterWallSegment();

        // Assert
        segment.Index.Should().Be(0);
        segment.Name.Should().BeNull();
        segment.StartPole.Should().Be(new Pole(0, 0, 0));
        segment.EndPole.Should().Be(new Pole(0, 0, 0));
        segment.Type.Should().Be(default);
        segment.IsOpaque.Should().BeFalse();
        segment.State.Should().Be(default);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange & Act
        var segment = new EncounterWallSegment {
            Index = 1,
            Name = "Wall Segment 1",
            StartPole = new Pole(0, 0, 0),
            EndPole = new Pole(5, 5, 2),
            Type = SegmentType.Wall,
            IsOpaque = true,
            State = SegmentState.Closed,
        };

        // Assert
        segment.Index.Should().Be(1);
        segment.Name.Should().Be("Wall Segment 1");
        segment.StartPole.Should().Be(new Pole(0, 0, 0));
        segment.EndPole.Should().Be(new Pole(5, 5, 2));
        segment.Type.Should().Be(SegmentType.Wall);
        segment.IsOpaque.Should().BeTrue();
        segment.State.Should().Be(SegmentState.Closed);
    }

    [Fact]
    public void WithClause_WithChangedIndex_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();

        // Act
        var updated = original with { Index = 5 };

        // Assert
        updated.Index.Should().Be(5);
        original.Index.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedName_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();

        // Act
        var updated = original with { Name = "Updated Name" };

        // Assert
        updated.Name.Should().Be("Updated Name");
        original.Name.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedStartPole_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();
        var newPole = new Pole(10, 10, 5);

        // Act
        var updated = original with { StartPole = newPole };

        // Assert
        updated.StartPole.Should().Be(newPole);
        original.StartPole.Should().Be(new Pole(0, 0, 0));
    }

    [Fact]
    public void WithClause_WithChangedEndPole_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();
        var newPole = new Pole(20, 20, 10);

        // Act
        var updated = original with { EndPole = newPole };

        // Assert
        updated.EndPole.Should().Be(newPole);
        original.EndPole.Should().Be(new Pole(0, 0, 0));
    }

    [Fact]
    public void WithClause_WithChangedType_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();

        // Act
        var updated = original with { Type = SegmentType.Door };

        // Assert
        updated.Type.Should().Be(SegmentType.Door);
        original.Type.Should().Be(default);
    }

    [Fact]
    public void WithClause_WithChangedIsOpaque_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();

        // Act
        var updated = original with { IsOpaque = true };

        // Assert
        updated.IsOpaque.Should().BeTrue();
        original.IsOpaque.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedState_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallSegment();

        // Act
        var updated = original with { State = SegmentState.Open };

        // Assert
        updated.State.Should().Be(SegmentState.Open);
        original.State.Should().Be(default);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var segment1 = new EncounterWallSegment {
            Index = 1,
            Name = "Wall Segment 1",
            StartPole = new Pole(0, 0, 0),
            EndPole = new Pole(5, 5, 2),
        };
        var segment2 = new EncounterWallSegment {
            Index = 1,
            Name = "Wall Segment 1",
            StartPole = new Pole(0, 0, 0),
            EndPole = new Pole(5, 5, 2),
        };

        // Act & Assert
        segment1.Should().Be(segment2);
        (segment1 == segment2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var segment1 = new EncounterWallSegment { Index = 1 };
        var segment2 = new EncounterWallSegment { Index = 2 };

        // Act & Assert
        segment1.Should().NotBe(segment2);
        (segment1 != segment2).Should().BeTrue();
    }
}
