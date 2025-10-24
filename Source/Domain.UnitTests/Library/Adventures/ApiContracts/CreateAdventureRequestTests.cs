namespace VttTools.Library.Adventures.ApiContracts;

public class CreateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Style = AdventureStyle.OpenWorld,
            IsOneShot = false,
            CampaignId = Guid.CreateVersion7(),
            BackgroundId = Guid.CreateVersion7(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureStyle style = AdventureStyle.DungeonCrawl;
        var campaignId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();
        const bool isOneShot = true;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Style = style,
            IsOneShot = isOneShot,
            CampaignId = campaignId,
            BackgroundId = backgroundId,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Description.Should().Be(description);
        data.Style.Should().Be(style);
        data.CampaignId.Should().Be(campaignId);
        data.BackgroundId.Should().Be(backgroundId);
    }
}