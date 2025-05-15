namespace VttTools.Library.Scenes.ApiContracts;

public class AddNewSceneAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddNewSceneAssetRequest {
            Name = "Asset Name",
            Position = new() { Left = 10, Top = 20 },
            Scale = 1.5,
        };
        const string name = "Other Name";
        var position = new Position { Left = 10, Top = 20 };
        const double scale = 0.5;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Scale = scale,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Position.Should().Be(position);
        data.Scale.Should().Be(scale);
    }
}