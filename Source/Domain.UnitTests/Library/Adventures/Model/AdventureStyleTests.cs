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

    [Fact]
    public void AdventureType_ShouldHaveDisplayAttribute() {
        // Arrange
        var type = typeof(AdventureStyle);

        // Act & Assert
        foreach (var value in Enum.GetValues<AdventureStyle>()) {
            var memberInfo = type.GetMember(value.ToString()).First();
            var displayAttribute = memberInfo.GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault() as DisplayAttribute;

            displayAttribute.Should().NotBeNull($"AdventureType.{value} should have DisplayAttribute");
            displayAttribute!.Name.Should().NotBeNullOrEmpty($"AdventureType.{value} DisplayAttribute Name should not be null or empty");
        }
    }
}