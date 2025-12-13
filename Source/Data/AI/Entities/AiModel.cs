namespace VttTools.Data.AI.Entities;

public sealed record AiModel {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ProviderId { get; set; }
    public Provider? Provider { get; set; }
    public GeneratedContentType ContentType { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(256)]
    public string Endpoint { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsEnabled { get; set; } = true;
}
