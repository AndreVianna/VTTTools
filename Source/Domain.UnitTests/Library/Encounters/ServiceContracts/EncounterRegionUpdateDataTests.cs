namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterRegionUpdateDataTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new EncounterRegionUpdateData();

        // Assert
        data.Type.IsSet.Should().BeFalse();
        data.Name.IsSet.Should().BeFalse();
        data.Vertices.IsSet.Should().BeFalse();
        data.Value.IsSet.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithSetValues_InitializesCorrectly() {
        // Arrange
        var vertices = new List<Point> {
            new(0, 0),
            new(10, 10),
        };

        // Act
        var data = new EncounterRegionUpdateData {
            Type = RegionType.Ilumination,
            Name = "Updated Region",
            Vertices = vertices,
            Value = 10,
        };

        // Assert
        data.Type.IsSet.Should().BeTrue();
        data.Type.Value.Should().Be(RegionType.Ilumination);
        data.Name.IsSet.Should().BeTrue();
        data.Name.Value.Should().Be("Updated Region");
        data.Vertices.IsSet.Should().BeTrue();
        data.Vertices.Value.Should().HaveCount(2);
        data.Value.IsSet.Should().BeTrue();
        data.Value.Value.Should().Be(10);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterRegionUpdateData {
            Name = "Region 1",
            Type = RegionType.Terrain,
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
        var data = new EncounterRegionUpdateData {
            Name = (string?)null,
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
        var data = new EncounterRegionUpdateData {
            Name = longName,
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
        var data = new EncounterRegionUpdateData {
            Name = exactName,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void WithClause_WithChangedType_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegionUpdateData();

        // Act
        var updated = original with { Type = RegionType.Ilumination };

        // Assert
        updated.Type.IsSet.Should().BeTrue();
        updated.Type.Value.Should().Be(RegionType.Ilumination);
        original.Type.IsSet.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedName_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegionUpdateData();

        // Act
        var updated = original with { Name = "New Name" };

        // Assert
        updated.Name.IsSet.Should().BeTrue();
        updated.Name.Value.Should().Be("New Name");
        original.Name.IsSet.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedVertices_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegionUpdateData();
        var vertices = new List<Point> { new(5, 5) };

        // Act
        var updated = original with { Vertices = vertices };

        // Assert
        updated.Vertices.IsSet.Should().BeTrue();
        updated.Vertices.Value.Should().HaveCount(1);
        original.Vertices.IsSet.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedValue_UpdatesProperty() {
        // Arrange
        var original = new EncounterRegionUpdateData();

        // Act
        var updated = original with { Value = 15 };

        // Assert
        updated.Value.IsSet.Should().BeTrue();
        updated.Value.Value.Should().Be(15);
        original.Value.IsSet.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var data1 = new EncounterRegionUpdateData {
            Name = "Region",
            Type = RegionType.Terrain,
            Value = 5,
        };
        var data2 = new EncounterRegionUpdateData {
            Name = "Region",
            Type = RegionType.Terrain,
            Value = 5,
        };

        // Act & Assert
        data1.Should().Be(data2);
        (data1 == data2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var data1 = new EncounterRegionUpdateData { Name = "Region 1" };
        var data2 = new EncounterRegionUpdateData { Name = "Region 2" };

        // Act & Assert
        data1.Should().NotBe(data2);
        (data1 != data2).Should().BeTrue();
    }
}
