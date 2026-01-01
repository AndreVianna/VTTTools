namespace VttTools.Library.Adventures.Model;

public class AdventureStyleTests {
    [Fact]
    public void AdventureType_ShouldHaveExpectedValues() {
        // Arrange
        var expectedValues = new[]
        {
            AdventureStyle.Generic,
            AdventureStyle.OpenWorld,
            AdventureStyle.DungeonCrawl,
            AdventureStyle.HackNSlash,
            AdventureStyle.Survival,
            AdventureStyle.GoalDriven,
            AdventureStyle.RandomlyGenerated,
        };

        // Act
        var actualValues = Enum.GetValues<AdventureStyle>();

        // Assert
        actualValues.Should().BeEquivalentTo(expectedValues);
    }

}