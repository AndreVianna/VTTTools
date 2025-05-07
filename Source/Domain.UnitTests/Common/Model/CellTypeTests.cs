namespace VttTools.Common.Model;

public class CellTypeTests {
    [Fact]
    public void CellType_HasExpectedValues()
        // Assert
        => Enum.GetValues<CellType>().Should().Contain([
            CellType.Square,
            CellType.VerticalHex,
            CellType.HorizontalHex,
            CellType.Isometric,
        ]);
}