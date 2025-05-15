namespace VttTools.Assets.Model;

public record AssetDisplay {
    public DisplayType Type { get; set; }
    public Guid? SourceId { get; set; }
    public Size Size { get; set; } = new();
}
