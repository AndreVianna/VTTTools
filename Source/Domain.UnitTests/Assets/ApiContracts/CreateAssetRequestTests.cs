namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
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
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Description.Should().Be(description);
        data.ResourceId.Should().Be(newDisplayId);
    }
}