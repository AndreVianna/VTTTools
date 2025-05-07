namespace VttTools.Common.Model;

public class StageMapTypeTests {
    [Fact]
    public void StageMapType_HasExpectedValues()
        // Assert
        => Enum.GetValues<StageMapType>().Should().Contain([
            StageMapType.None,
            StageMapType.Square,
            StageMapType.HexH,
            StageMapType.HexV,
            StageMapType.Isometric,
        ]);
}