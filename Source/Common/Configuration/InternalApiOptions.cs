namespace VttTools.Configuration;

public sealed class InternalApiOptions {
    public const string SectionName = "InternalApi";
    public string ApiKey { get; init; } = string.Empty;
    public string ServiceName { get; init; } = string.Empty;
}