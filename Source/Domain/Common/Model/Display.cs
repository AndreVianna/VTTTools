namespace VttTools.Common.Model;

public record Display {
    [MaxLength(64)]
    public string Id { get; init; } = string.Empty;
    public ResourceType Type { get; init; }
    public Size Size { get; init; }
}