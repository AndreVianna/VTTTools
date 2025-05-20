namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            Shape = new Shape {
                Type = MediaType.Image,
                SourceId = Guid.NewGuid(),
                Size = new() {
                    X = 10,
                    Y = 20,
                },
            },
        };
        const string name = "Other Title";
        const AssetType type = AssetType.NPC;
        const string description = "Other Description";
        var newDisplay = new Shape {
            Type = MediaType.Video,
            SourceId = Guid.NewGuid(),
            Size = new() {
                X = 30,
                Y = 40,
            },
        };

        // Act
        var data = original with {
            Name = name,
            Type = type,
            Description = description,
            Shape = newDisplay,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Description.Value.Should().Be(description);
        data.Shape.Value.Should().BeEquivalentTo(newDisplay);
    }
}