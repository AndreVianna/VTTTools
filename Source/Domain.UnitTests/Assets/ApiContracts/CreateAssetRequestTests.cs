namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            Display = new() {
                Type = DisplayType.Image,
                Id = Guid.NewGuid(),
                Size = new(10, 20),
            },
        };
        const string name = "Other Title";
        const AssetType type = AssetType.NPC;
        const string description = "Other Description";
        var newDisplay = new Display {
            Type = DisplayType.Image,
            Id = Guid.NewGuid(),
            Size = new(30, 40),
        };

        // Act
        var data = original with {
            Name = name,
            Type = type,
            Description = description,
            Display = newDisplay,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Description.Should().Be(description);
        data.Display.Should().BeEquivalentTo(newDisplay);
    }
}