namespace VttTools.Library.Adventures.ApiContracts;

public class CreateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAdventureRequest {
            Name = "Title",
            Visibility = Visibility.Private,
            CampaignId = Guid.NewGuid(),
        };
        const string name = "Other Title";
        const Visibility visibility = Visibility.Public;
        var campaignId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
            CampaignId = campaignId
        };

        // Assert
        data.Name.Should().Be(name);
        data.Visibility.Should().Be(visibility);
        data.CampaignId.Should().Be(campaignId);
    }
}