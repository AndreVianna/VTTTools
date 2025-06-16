namespace VttTools.Library.Adventures.ApiContracts;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Type = AdventureType.OpenWorld,
            IsPublished = false,
            IsPublic = false,
            CampaignId = Guid.NewGuid(),
            BackgroundId = Guid.NewGuid(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureType type = AdventureType.DungeonCrawl;
        const bool isVisible = true;
        const bool isPublic = true;
        var campaignId = Guid.NewGuid();
        var backgroundId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Type = type,
            IsPublished = isVisible,
            IsPublic = isPublic,
            CampaignId = campaignId,
            BackgroundId = backgroundId,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Description.Value.Should().Be(description);
        data.Type.Value.Should().Be(type);
        data.IsPublished.Value.Should().Be(isVisible);
        data.IsPublic.Value.Should().Be(isPublic);
        data.CampaignId.Value.Should().Be(campaignId);
        data.BackgroundId.Value.Should().Be(backgroundId);
    }
}