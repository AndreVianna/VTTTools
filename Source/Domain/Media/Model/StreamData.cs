namespace VttTools.Media.Model;

public record StreamData {
    public required Stream Content { get; init; }
    public required string Type { get; init; } = string.Empty;
    public required ulong Length { get; init; }
}
