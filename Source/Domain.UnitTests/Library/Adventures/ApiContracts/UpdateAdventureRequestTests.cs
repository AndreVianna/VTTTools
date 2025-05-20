namespace VttTools.Library.Adventures.ApiContracts;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Type = AdventureType.OpenWorld,
            ImageId = Guid.NewGuid(),
            IsPublished = false,
            IsPublic = false,
            CampaignId = Guid.NewGuid(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureType type = AdventureType.DungeonCrawl;
        var imageId = Guid.NewGuid();
        const bool isVisible = true;
        const bool isPublic = true;
        var campaignId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Type = type,
            ImageId = imageId,
            IsPublished = isVisible,
            IsPublic = isPublic,
            CampaignId = campaignId
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Description.Value.Should().Be(description);
        data.Type.Value.Should().Be(type);
        data.ImageId.Value.Should().Be(imageId);
        data.IsPublished.Value.Should().Be(isVisible);
        data.IsPublic.Value.Should().Be(isPublic);
        data.CampaignId.Value.Should().Be(campaignId);
    }
}