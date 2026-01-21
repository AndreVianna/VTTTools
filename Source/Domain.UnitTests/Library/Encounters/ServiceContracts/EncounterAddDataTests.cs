namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterAddDataTests {
    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithNullName_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = null!,
            Description = "A dark cave",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "",
            Description = "A dark cave",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceName_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "   ",
            Description = "A dark cave",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithNullDescription_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = null!,
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The encounter description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithEmptyDescription_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The encounter description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceDescription_ReturnsError() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "   ",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The encounter description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithBothInvalid_ReturnsMultipleErrors() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "",
            Description = "",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
    }

    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new CreateEncounterData();

        // Assert
        data.Name.Should().BeEmpty();
        data.Description.Should().BeEmpty();
        data.StageId.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var stageId = Guid.CreateVersion7();

        // Act
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
            StageId = stageId,
        };

        // Assert
        data.Name.Should().Be("Goblin Cave");
        data.Description.Should().Be("A dark cave filled with goblins");
        data.StageId.Should().Be(stageId);
    }

    [Fact]
    public void Validate_WithNullStageId_ReturnsSuccess() {
        // Arrange - StageId is optional in CreateEncounterData
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
            StageId = null,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithAllValid_ReturnsSuccess() {
        // Arrange
        var data = new CreateEncounterData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
            StageId = Guid.CreateVersion7(),
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}