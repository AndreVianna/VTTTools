namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            Display = new Display {
                Type = DisplayType.Image,
                Id = Guid.NewGuid(),
                Size = new(10, 20),
            },
        };
        const string name = "Other Title";
        const AssetType type = AssetType.NPC;
        const string description = "Other Description";
        var newDisplay = new Display {
            Type = DisplayType.Video,
            Id = Guid.NewGuid(),
            Size = new(20, 40),
        };

        // Act
        var data = original with {
            Name = name,
            Type = type,
            Description = description,
            Display = newDisplay,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Description.Value.Should().Be(description);
        data.Display.Value.Should().BeEquivalentTo(newDisplay);
    }
}