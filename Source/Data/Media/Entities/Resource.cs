namespace VttTools.Data.Media.Entities;

public class Resource {
    public Guid Id { get; set; }
    [MaxLength(64)]
    public string ContentType { get; set; } = string.Empty;
    [MaxLength(512)]
    public string Path { get; set; } = string.Empty;
    [MaxLength(128)]
    public string FileName { get; set; } = string.Empty;
    public ulong FileSize { get; set; }
    public Size Dimensions { get; set; } = Size.Zero;
    public TimeSpan Duration { get; set; } = TimeSpan.Zero;
}
