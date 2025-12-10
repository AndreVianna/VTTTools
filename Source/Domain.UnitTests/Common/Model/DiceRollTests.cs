namespace VttTools.Common.Model;

public class DiceRollTests {
    [Fact]
    public void Constructor_WithRequiredProperties_InitializesCorrectly() {
        // Arrange
        const string expression = "2d6+5";
        var results = new[] { 3, 4 };
        const int total = 12;

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
            Expression = "1d20",
            Results = [15],
            Total = 15,
        };

        // Act
        var updated = original with {
            Expression = "2d6+5",
            Results = [3, 4],
            Total = 12,
        };

        // Assert
        updated.Expression.Should().Be("2d6+5");
        updated.Results.Should().BeEquivalentTo([3, 4]);
        updated.Total.Should().Be(12);
        original.Expression.Should().Be("1d20");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var results = new[] { 5, 6 };
        var diceRoll1 = new DiceRoll {
            Expression = "2d6",
            Results = results,
            Total = 11,
        };
        var diceRoll2 = new DiceRoll {
            Expression = "2d6",
            Results = results,
            Total = 11,
        };

        // Act & Assert
        diceRoll1.Should().Be(diceRoll2);
        (diceRoll1 == diceRoll2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var diceRoll1 = new DiceRoll {
            Expression = "2d6",
            Results = [5, 6],
            Total = 11,
        };
        var diceRoll2 = new DiceRoll {
            Expression = "1d20",
            Results = [15],
            Total = 15,
        };

        // Act & Assert
        diceRoll1.Should().NotBe(diceRoll2);
        (diceRoll1 != diceRoll2).Should().BeTrue();
    }
}
