namespace VttTools.Admin.ApiContracts;

public sealed record ConfigurationResponse : Response {
    public required string ServiceName { get; init; }
    public required IReadOnlyList<ConfigEntry> Entries { get; init; }
}