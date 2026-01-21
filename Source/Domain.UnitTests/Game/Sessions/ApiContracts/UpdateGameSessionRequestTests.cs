namespace VttTools.Game.Sessions.ApiContracts;

public class UpdateGameSessionRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateGameSessionRequest {
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
        data.Title.Value.Should().Be(name);
        data.EncounterId.Value.Should().Be(encounterId);
    }
}