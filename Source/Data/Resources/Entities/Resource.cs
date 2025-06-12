namespace VttTools.Data.Resources.Entities;

public class Resource {
    public Guid Id { get; set; }
    [MaxLength(128)]
    public string Path { get; set; } = string.Empty;
    [MaxLength(64)]
    public string ContentType { get; set; } = string.Empty;
    [MaxLength(128)]
    public string? FileName { get; set; }
    public ulong? FileSize { get; set; }
    public Size? ImageSize { get; set; }
    public TimeSpan? Duration { get; set; }
}