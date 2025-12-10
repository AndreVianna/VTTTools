namespace VttTools.AI.ServiceContracts;

public sealed record AudioGenerationData
    : Data {
    public required string Prompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
    public AudioType Type { get; init; } = AudioType.SoundEffect;
}
