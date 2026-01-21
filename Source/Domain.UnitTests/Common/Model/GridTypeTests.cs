namespace VttTools.Common.Model;

public class GridTypeTests {
    [Fact]
    public void GridType_HasExpectedValues()
        // Assert
        => Enum.GetValues<GridType>().Should().Contain([
            GridType.NoGrid,
            GridType.Square,
            GridType.HexH,
            GridType.HexV,
            GridType.Isometric,
        ]);
}