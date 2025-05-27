namespace VttTools.Common.Model;

public record Display {
    public DisplayType Type { get; init; }
    public Guid? Id { get; init; }
    public Size Size { get; init; }
}
