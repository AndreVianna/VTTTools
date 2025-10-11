namespace VttTools.Library.Adventures.ApiContracts;

public class CreateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Type = AdventureType.OpenWorld,
            CampaignId = Guid.CreateVersion7(),
            BackgroundId = Guid.CreateVersion7(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureType type = AdventureType.DungeonCrawl;
        var campaignId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Type = type,
            CampaignId = campaignId,
            BackgroundId = backgroundId,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Description.Should().Be(description);
        data.Type.Should().Be(type);
        data.CampaignId.Should().Be(campaignId);
        data.BackgroundId.Should().Be(backgroundId);
    }
}