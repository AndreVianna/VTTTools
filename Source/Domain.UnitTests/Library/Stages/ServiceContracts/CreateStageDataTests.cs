namespace VttTools.Library.Stages.ServiceContracts;

public class CreateStageDataTests {
    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "A test stage for adventures",
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
        var data = new CreateStageData {
            Name = null!,
            Description = "A test stage",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsError() {
        // Arrange
        var data = new CreateStageData {
            Name = "",
            Description = "A test stage",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceName_ReturnsError() {
        // Arrange
        var data = new CreateStageData {
            Name = "   ",
            Description = "A test stage",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithNullDescription_ReturnsError() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = null!,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithEmptyDescription_ReturnsError() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceDescription_ReturnsError() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "   ",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("The stage description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithBothInvalid_ReturnsMultipleErrors() {
        // Arrange
        var data = new CreateStageData {
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
        var data = new CreateStageData();

        // Assert
        data.Name.Should().BeEmpty();
        data.Description.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "A test description",
        };

        // Assert
        data.Name.Should().Be("Test Stage");
        data.Description.Should().Be("A test description");
    }
}