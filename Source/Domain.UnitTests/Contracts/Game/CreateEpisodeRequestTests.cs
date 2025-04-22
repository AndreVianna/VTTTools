namespace VttTools.Contracts.Game;

public class CreateEpisodeRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateEpisodeRequest {
            Name = "Subject",
            Visibility = Visibility.Private,
            AdventureId = Guid.NewGuid(),
        };
        const string name = "Other Subject";
        const Visibility visibility = Visibility.Public;
        var adventureId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
            AdventureId = adventureId,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Visibility.Should().Be(visibility);
        data.AdventureId.Should().Be(adventureId);
    }
}