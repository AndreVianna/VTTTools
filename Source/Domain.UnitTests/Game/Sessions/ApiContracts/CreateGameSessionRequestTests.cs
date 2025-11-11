namespace VttTools.Game.Sessions.ApiContracts;

public class CreateGameSessionRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateGameSessionRequest {
            Title = "Title",
            EncounterId = Guid.CreateVersion7(),
        };
        const string name = "Other Title";
        var encounterId = Guid.CreateVersion7();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Title = name,
            EncounterId = encounterId,
        };

        // Assert
        data.Title.Should().Be(name);
        data.EncounterId.Should().Be(encounterId);
    }
}