namespace VttTools.Contracts.Game;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
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
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Source.Should().Be(source);
        data.Visibility.Should().Be(visibility);
    }
}