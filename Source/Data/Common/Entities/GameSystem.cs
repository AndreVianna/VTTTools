namespace VttTools.Data.Common.Entities;

public sealed record GameSystem {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(32)]
    public string Code { get; set; } = string.Empty;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(512)]
    public string? Description { get; set; }
    [MaxLength(256)]
    public string? IconUrl { get; set; }
}