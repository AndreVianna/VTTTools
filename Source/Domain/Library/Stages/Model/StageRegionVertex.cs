namespace VttTools.Library.Stages.Model;

public record StageRegionVertex(double X, double Y) {
    public StageRegionVertex() : this(0, 0) { }
    public static StageRegionVertex Zero => new();
    public override string ToString() => $"({X:F2}, {Y:F2})";
}
