namespace VttTools.Common.Model;

public record Display {
    public ResourceType Type { get; init; }
    [MaxLength(64)]
    public string? FileName { get; init; }
    public Size Size { get; init; }
}