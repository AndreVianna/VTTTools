namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Title",
            Type = AssetType.Creature,
            Description = "Description",
            Format = new Format {
                Type = FormatType.Image,
                SourceId = Guid.NewGuid(),
                Size = new() {
                    Width = 10,
                    Height = 20,
                },
            },
        };
        const string name = "Other Title";
        const AssetType type = AssetType.NPC;
        const string description = "Other Description";
        var newDisplay = new Format {
            Type = FormatType.Video,
            SourceId = Guid.NewGuid(),
            Size = new() {
                Width = 30,
                Height = 40,
            },
        };

        // Act
        var data = original with {
            Name = name,
            Type = type,
            Description = description,
            Format = newDisplay,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Description.Value.Should().Be(description);
        data.Format.Value.Should().BeEquivalentTo(newDisplay);
    }
}