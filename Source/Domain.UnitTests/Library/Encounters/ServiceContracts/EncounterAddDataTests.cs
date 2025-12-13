namespace VttTools.Library.Encounters.ServiceContracts;

public class EncounterAddDataTests {
    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterAddData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
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
        var data = new EncounterAddData {
            Name = null!,
            Description = "A dark cave",
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
        var data = new EncounterAddData {
            Name = "",
            Description = "A dark cave",
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
        var data = new EncounterAddData {
            Name = "   ",
            Description = "A dark cave",
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
        var data = new EncounterAddData {
            Name = "Goblin Cave",
            Description = null!,
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
        var data = new EncounterAddData {
            Name = "Goblin Cave",
            Description = "",
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
        var data = new EncounterAddData {
            Name = "Goblin Cave",
            Description = "   ",
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
        var data = new EncounterAddData {
            Name = "",
            Description = "",
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
        var data = new EncounterAddData();

        // Assert
        data.Name.Should().BeEmpty();
        data.Description.Should().BeEmpty();
        data.BackgroundId.Should().BeNull();
        data.Grid.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var backgroundId = Guid.CreateVersion7();
        var grid = new Grid { CellSize = new CellSize(50, 50) };

        // Act
        var data = new EncounterAddData {
            Name = "Goblin Cave",
            Description = "A dark cave filled with goblins",
            BackgroundId = backgroundId,
            Grid = grid,
        };

        // Assert
        data.Name.Should().Be("Goblin Cave");
        data.Description.Should().Be("A dark cave filled with goblins");
        data.BackgroundId.Should().Be(backgroundId);
        data.Grid.Should().Be(grid);
    }
}
