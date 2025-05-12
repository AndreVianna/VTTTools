namespace VttTools.Common.ApiContracts;

public class RequestTests {
    private sealed record TestRequest
        : Request {
        public string? Name { get; init; }
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TestRequest {
            Name = "Title",
        };
        const string name = "Other Title";
        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
        };
        // Assert
        data.Name.Should().Be(name);
    }
}