namespace VttTools.Common.Model;

public class VisibilityTests {
    [Fact]
    public void Visibility_HasExpectedValues()
        // Assert
        => Enum.GetValues<Visibility>().Should().Contain([
            Visibility.Hidden,
            Visibility.Private,
            Visibility.Public,
        ]);
}