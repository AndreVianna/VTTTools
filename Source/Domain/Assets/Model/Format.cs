namespace VttTools.Assets.Model;

public record Format {
    public FormatType Type { get; set; }
    public Guid? SourceId { get; set; }
    public Size Size { get; set; } = new();
}
