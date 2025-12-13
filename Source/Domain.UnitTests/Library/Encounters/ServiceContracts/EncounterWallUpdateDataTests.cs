namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterWallUpdateDataTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new EncounterWallUpdateData();

        // Assert
        data.Segments.IsSet.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithSetSegments_InitializesCorrectly() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1, StartPole = new Pole(0, 0, 0), EndPole = new Pole(5, 5, 0) },
        };

        // Act
        var data = new EncounterWallUpdateData {
            Segments = segments,
        };

        // Assert
        data.Segments.IsSet.Should().BeTrue();
        data.Segments.Value.Should().HaveCount(1);
        data.Segments.Value.Should().BeEquivalentTo(segments);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var segments = new List<EncounterWallSegment> { new() { Index = 1 } };
        var data = new EncounterWallUpdateData {
            Segments = segments,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void WithClause_WithChangedSegments_UpdatesProperty() {
        // Arrange
        var original = new EncounterWallUpdateData();
        var segments = new List<EncounterWallSegment> {
            new() { Index = 2 },
        };

        // Act
        var updated = original with { Segments = segments };

        // Assert
        updated.Segments.IsSet.Should().BeTrue();
        updated.Segments.Value.Should().HaveCount(1);
        original.Segments.IsSet.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1 },
        };
        var data1 = new EncounterWallUpdateData { Segments = segments };
        var data2 = new EncounterWallUpdateData { Segments = segments };

        // Act & Assert
        data1.Should().Be(data2);
        (data1 == data2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var segments1 = new List<EncounterWallSegment> { new() { Index = 1 } };
        var segments2 = new List<EncounterWallSegment> { new() { Index = 2 } };
        var data1 = new EncounterWallUpdateData {
            Segments = segments1,
        };
        var data2 = new EncounterWallUpdateData {
            Segments = segments2,
        };

        // Act & Assert
        data1.Should().NotBe(data2);
        (data1 != data2).Should().BeTrue();
    }
}
