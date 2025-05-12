namespace VttTools.Library.Adventures.Model;

public class AdventureTypeTests {
    [Fact]
    public void AdventureType_ShouldHaveExpectedValues() {
        // Arrange
        var expectedValues = new[]
        {
            AdventureType.OpenWorld,
            AdventureType.DungeonCrawl,
            AdventureType.HackAndSlash,
            AdventureType.Survival,
            AdventureType.GoalDriven,
            AdventureType.RandomlyGenerated
        };

        // Act
        var actualValues = Enum.GetValues<AdventureType>();

        // Assert
        actualValues.Should().BeEquivalentTo(expectedValues);
    }

    [Fact]
    public void AdventureType_ShouldHaveDisplayAttribute() {
        // Arrange
        var type = typeof(AdventureType);

        // Act & Assert
        foreach (var value in Enum.GetValues<AdventureType>()) {
            var memberInfo = type.GetMember(value.ToString()).First();
            var displayAttribute = memberInfo.GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault() as DisplayAttribute;

            displayAttribute.Should().NotBeNull($"AdventureType.{value} should have DisplayAttribute");
            displayAttribute!.Name.Should().NotBeNullOrEmpty($"AdventureType.{value} DisplayAttribute Name should not be null or empty");
        }
    }
}