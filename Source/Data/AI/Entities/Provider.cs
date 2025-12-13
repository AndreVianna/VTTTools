namespace VttTools.Data.AI.Entities;

public sealed record Provider {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(64)]
    public required string Name { get; set; }
    [MaxLength(512)]
    public string BaseUrl { get; set; } = string.Empty;
    [MaxLength(256)]
    public string HealthEndpoint { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public ICollection<AiModel>? Models { get; set; }
}
