namespace VttTools.Contracts.Game;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Subject",
            Type = AssetType.Creature,
            Source = "http://sorce.net/image.png",
            Visibility = Visibility.Private,
        };
        const string name = "Other Subject";
        const AssetType type = AssetType.NPC;
        const string source = "http://sorce.net/other-image.png";
        const Visibility visibility = Visibility.Public;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Type = type,
            Source = source,
            Visibility = visibility,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Source.Value.Should().Be(source);
        data.Visibility.Value.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = "Updated Asset",
            Source = "updated -source.png",
            Type = AssetType.Character,
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}