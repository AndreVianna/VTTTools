namespace VttTools.Common.ServiceContracts;

public class DataTests {
    private sealed record TestData
        : Data {
        public string? Name { get; init; }
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TestData {
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