namespace VttTools.Library.Encounters.Model;

public record Frame {
    public FrameShape Shape { get; init; } = FrameShape.None;
    public string BorderColor { get; init; } = Colors.Primary;
    public int BorderThickness { get; init; } = 1;
    public string Background { get; init; } = Colors.Transparent;
}