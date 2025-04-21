namespace VttTools.Contracts.Game;

public class CreateEpisodeRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateEpisodeRequest {
            Name = "Subject",
            Visibility = Visibility.Private,
        };
        const string name = "Other Subject";
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