namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            Shape = new() {
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
            Type = MediaType.Image,
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
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Description.Should().Be(description);
        data.Shape.Should().BeEquivalentTo(newDisplay);
    }
}