namespace VttTools.Contracts.Game;

public class ResponseTests {
    private sealed record TestResponse
        : Response {
        public string? Name { get; init; }
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TestResponse {
            Name = "Subject",
        };
        const string name = "Other Subject";
        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
        };
        // Assert
        data.Name.Should().Be(name);
    }
}