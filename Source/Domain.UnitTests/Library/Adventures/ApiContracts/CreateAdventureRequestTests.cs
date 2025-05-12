namespace VttTools.Library.Adventures.ApiContracts;

public class CreateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Type = AdventureType.OpenWorld,
            ImagePath = "path/to/image.jpg",
            IsVisible = false,
            IsPublic = false,
            CampaignId = Guid.NewGuid(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureType type = AdventureType.DungeonCrawl;
        const string imagePath = "path/to/other/image.jpg";
        const bool isVisible = true;
        const bool isPublic = true;
        var campaignId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Type = type,
            ImagePath = imagePath,
            IsVisible = isVisible,
            IsPublic = isPublic,
            CampaignId = campaignId
        };

        // Assert
        data.Name.Should().Be(name);
        data.Description.Should().Be(description);
        data.Type.Should().Be(type);
        data.ImagePath.Should().Be(imagePath);
        data.IsVisible.Should().Be(isVisible);
        data.IsPublic.Should().Be(isPublic);
        data.CampaignId.Should().Be(campaignId);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Description = "Adventure Description",
            Type = AdventureType.OpenWorld,
            ImagePath = "path/to/image.jpg",
            IsVisible = false,
            IsPublic = false,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsValidationError() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = string.Empty,
            Description = "Adventure Description",
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message.Contains(nameof(CreateAdventureRequest.Name), StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Validate_WithEmptyDescription_ReturnsValidationError() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Description = string.Empty,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message.Contains(nameof(CreateAdventureRequest.Description), StringComparison.OrdinalIgnoreCase));
    }
}