namespace VttTools.Model;

public class DiceRollTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithProvidedValues() {
        // Arrange
        const string expression = "2d6+3";
        var results = new[] { 4, 6 };
        const int total = 13;

        // Act
        var diceRoll = new DiceRoll {
            Expression = expression,
            Results = results,
            Total = total,
        };

        // Assert
        diceRoll.Expression.Should().Be(expression);
        diceRoll.Results.Should().BeEquivalentTo(results);
        diceRoll.Total.Should().Be(total);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new DiceRoll {
            Expression = string.Empty,
            Results = [],
            Total = 42,
        };
        const string expression = "2d6+3";
        var results = new[] { 4, 6 };
        const int total = 13;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Expression = expression,
            Results = results,
            Total = total,
        };

        // Assert
        data.Expression.Should().Be(expression);
        data.Results.Should().BeEquivalentTo(results);
        data.Total.Should().Be(total);
    }
}