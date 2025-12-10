namespace VttTools.AI.ApiContracts;

public sealed record AudioGenerationRequest
    : Request {
    public required string Prompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
    public AudioType Type { get; init; } = AudioType.SoundEffect;
}
