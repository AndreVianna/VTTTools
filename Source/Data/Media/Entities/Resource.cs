namespace VttTools.Data.Media.Entities;

public class Resource {
    public Guid Id { get; set; }
    public ResourceType Type { get; set; }
    [MaxLength(64)]
    public string ContentType { get; set; } = string.Empty;
    [MaxLength(128)]
    public string Path { get; set; } = string.Empty;
    [MaxLength(128)]
    public string FileName { get; set; } = string.Empty;
    public ulong FileLength { get; set; }
    public Size ImageSize { get; set; }
    public TimeSpan Duration { get; set; } = TimeSpan.Zero;
    public string[] Tags { get; set; } = [];
}