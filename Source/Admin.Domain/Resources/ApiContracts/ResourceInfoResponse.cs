namespace VttTools.Admin.Resources.ApiContracts;

public sealed record ResourceInfoResponse : Response {
    public required Guid Id { get; init; }
    public required string ContentType { get; init; }
    public required string Path { get; init; }
    public required string FileName { get; init; }
    public required ulong FileSize { get; init; }
    public Size Dimensions { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; } = TimeSpan.Zero;
}