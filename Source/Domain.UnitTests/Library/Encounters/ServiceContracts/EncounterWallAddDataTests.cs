namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterWallAddDataTests {
    [Fact]
    public void Constructor_WithRequiredProperties_InitializesCorrectly() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1, StartPole = new Pole(0, 0, 0), EndPole = new Pole(5, 5, 0) },
            new() { Index = 2, StartPole = new Pole(5, 5, 0), EndPole = new Pole(10, 5, 0) },
        };

        // Act
        var data = new EncounterWallAddData {
            Segments = segments,
        };

        // Assert
        data.Segments.Should().HaveCount(2);
        data.Segments.Should().BeEquivalentTo(segments);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterWallAddData {
            Segments = [
                new() { Index = 1, StartPole = new Pole(0, 0, 0), EndPole = new Pole(5, 5, 0) },
            ],
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var segments = new List<EncounterWallSegment> {
            new() { Index = 1 },
        };
        var data1 = new EncounterWallAddData { Segments = segments };
        var data2 = new EncounterWallAddData { Segments = segments };

        // Act & Assert
        data1.Should().Be(data2);
        (data1 == data2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var data1 = new EncounterWallAddData {
            Segments = [new() { Index = 1 }],
        };
        var data2 = new EncounterWallAddData {
            Segments = [new() { Index = 2 }],
        };

        // Act & Assert
        data1.Should().NotBe(data2);
        (data1 != data2).Should().BeTrue();
    }
}
