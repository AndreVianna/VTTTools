namespace VttTools.Library.Adventures.ApiContracts;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Style = AdventureStyle.OpenWorld,
            IsOneShot = false,
            IsPublished = false,
            IsPublic = false,
            CampaignId = Guid.CreateVersion7(),
            BackgroundId = Guid.CreateVersion7(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureStyle style = AdventureStyle.DungeonCrawl;
        const bool isVisible = true;
        const bool isPublic = true;
        const bool isOneShot = true;
        var campaignId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Style = style,
            IsOneShot = isOneShot,
            IsPublished = isVisible,
            IsPublic = isPublic,
            CampaignId = campaignId,
            BackgroundId = backgroundId,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Description.Value.Should().Be(description);
        data.Style.Value.Should().Be(style);
        data.IsOneShot.Value.Should().Be(isOneShot);
        data.IsPublished.Value.Should().Be(isVisible);
        data.IsPublic.Value.Should().Be(isPublic);
        data.CampaignId.Value.Should().Be(campaignId);
        data.BackgroundId.Value.Should().Be(backgroundId);
    }
}