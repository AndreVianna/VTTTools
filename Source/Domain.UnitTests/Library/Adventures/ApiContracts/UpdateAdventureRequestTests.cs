namespace VttTools.Library.Adventures.ApiContracts;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
            Name = "Title",
            Description = "Description",
            Type = AdventureType.OpenWorld,
            Display = new(),
            IsPublished = false,
            IsPublic = false,
            CampaignId = Guid.NewGuid(),
        };

        const string name = "Other Title";
        const string description = "Other Description";
        const AdventureType type = AdventureType.DungeonCrawl;
        var display = new Display {
            Id = "some_file.png",
            Type = ResourceType.Image,
            Size = new(100, 100),
        };
        const bool isVisible = true;
        const bool isPublic = true;
        var campaignId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Description = description,
            Type = type,
            Display = display,
            IsPublished = isVisible,
            IsPublic = isPublic,
            CampaignId = campaignId,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Description.Value.Should().Be(description);
        data.Type.Value.Should().Be(type);
        data.Display.Value.Should().Be(display);
        data.IsPublished.Value.Should().Be(isVisible);
        data.IsPublic.Value.Should().Be(isPublic);
        data.CampaignId.Value.Should().Be(campaignId);
    }
}