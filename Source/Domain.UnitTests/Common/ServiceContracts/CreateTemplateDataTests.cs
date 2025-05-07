namespace VttTools.Common.ServiceContracts;

public class CreateTemplateDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateTemplateData<Adventure> {
            Name = "Asset Name",
            Visibility = Visibility.Public,
        };
        const string name = "Other Name";
        const Visibility visibility = Visibility.Private;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateTemplateData<Adventure> {
            Name = "Asset Name",
            Visibility = Visibility.Public,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithInvalidData_ReturnsSuccess(string? name) {
        // Arrange
        var data = new CreateTemplateData<Adventure> {
            Name = name!,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message == "Adventure name cannot be empty.");
    }
}