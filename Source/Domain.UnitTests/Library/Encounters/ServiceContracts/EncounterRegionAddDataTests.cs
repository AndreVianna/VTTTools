namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterRegionAddDataTests {
    [Fact]
    public void Constructor_WithRequiredProperties_InitializesCorrectly() {
        // Arrange
        var vertices = new List<Point> {
            new(0, 0),
            new(10, 0),
            new(10, 10),
        };

        // Act
        var data = new EncounterRegionAddData {
            Vertices = vertices,
        };

        // Assert
        data.Name.Should().BeNull();
        data.Type.Should().Be(default);
        data.Vertices.Should().HaveCount(3);
        data.Value.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var vertices = new List<Point> {
            new(0, 0),
            new(10, 0),
            new(10, 10),
        };

        // Act
        var data = new EncounterRegionAddData {
            Name = "Difficult Terrain",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };

        // Assert
        data.Name.Should().Be("Difficult Terrain");
        data.Type.Should().Be(RegionType.Terrain);
        data.Vertices.Should().HaveCount(3);
        data.Value.Should().Be(5);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterRegionAddData {
            Name = "Region 1",
            Vertices = [new(0, 0), new(5, 5)],
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithNullName_ReturnsSuccess() {
        // Arrange
        var data = new EncounterRegionAddData {
            Name = null,
            Vertices = [new(0, 0)],
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithNameExceeding128Characters_ReturnsError() {
        // Arrange
        var longName = new string('A', 129);
        var data = new EncounterRegionAddData {
            Name = longName,
            Vertices = [new(0, 0)],
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("Name must not exceed 128 characters.");
    }

    [Fact]
    public void Validate_WithNameExactly128Characters_ReturnsSuccess() {
        // Arrange
        var exactName = new string('A', 128);
        var data = new EncounterRegionAddData {
            Name = exactName,
            Vertices = [new(0, 0)],
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var vertices = new List<Point> { new(0, 0) };
        var data1 = new EncounterRegionAddData {
            Name = "Region",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };
        var data2 = new EncounterRegionAddData {
            Name = "Region",
            Type = RegionType.Terrain,
            Vertices = vertices,
            Value = 5,
        };

        // Act & Assert
        data1.Should().Be(data2);
        (data1 == data2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var data1 = new EncounterRegionAddData {
            Name = "Region 1",
            Vertices = [new(0, 0)],
        };
        var data2 = new EncounterRegionAddData {
            Name = "Region 2",
            Vertices = [new(0, 0)],
        };

        // Act & Assert
        data1.Should().NotBe(data2);
        (data1 != data2).Should().BeTrue();
    }
}
