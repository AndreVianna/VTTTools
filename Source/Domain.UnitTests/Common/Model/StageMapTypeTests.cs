namespace VttTools.Common.Model;

public class StageMapTypeTests {
    [Fact]
    public void StageMapType_HasExpectedValues()
        // Assert
        => Enum.GetValues<GridType>().Should().Contain([
            GridType.NoGrid,
            GridType.Square,
            GridType.HexH,
            GridType.HexV,
            GridType.Isometric,
        ]);
}