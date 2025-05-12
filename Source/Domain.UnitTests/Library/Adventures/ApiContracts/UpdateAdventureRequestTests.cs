namespace VttTools.Library.Adventures.ApiContracts;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
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
        data.Name.Value.Should().Be(name);
        data.Description.Value.Should().Be(description);
        data.Type.Value.Should().Be(type);
        data.ImagePath.Value.Should().Be(imagePath);
        data.IsVisible.Value.Should().Be(isVisible);
        data.IsPublic.Value.Should().Be(isPublic);
        data.CampaignId.Value.Should().Be(campaignId);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new UpdateAdventureRequest {
            Name = "Updated Adventure",
            Description = "Updated Description",
            Type = AdventureType.DungeonCrawl,
            ImagePath = "path/to/new/image.jpg",
            IsVisible = true,
            IsPublic = true,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsValidationError() {
        // Arrange
        var request = new UpdateAdventureRequest {
            Name = string.Empty,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message.Contains(nameof(UpdateAdventureRequest.Name), StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Validate_WithEmptyDescription_ReturnsValidationError() {
        // Arrange
        var request = new UpdateAdventureRequest {
            Description = string.Empty,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message.Contains(nameof(UpdateAdventureRequest.Description), StringComparison.OrdinalIgnoreCase));
    }
}