namespace VttTools.Library.Scenes.ApiContracts;

public class CreateSceneRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateSceneRequest {
            Name = "Title",
            Visibility = Visibility.Private,
        };
        const string name = "Other Title";
        const Visibility visibility = Visibility.Public;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Visibility.Should().Be(visibility);
    }
}