namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            ResourceId = Guid.NewGuid(),
        };
        const string name = "Other Title";
        const AssetType type = AssetType.NPC;
        const string description = "Other Description";
        var newDisplayId = Guid.NewGuid();

        // Act
        var data = original with {
            Name = name,
            Type = type,
            Description = description,
            ResourceId = newDisplayId,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Description.Value.Should().Be(description);
        data.ResourceId.Value.Should().Be(newDisplayId);
    }
}