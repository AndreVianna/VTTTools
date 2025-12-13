using VttTools.Admin.Configuration.Model;

namespace VttTools.Admin.Configuration.ApiContracts;

public sealed record ConfigurationResponse : Response {
    public required string ServiceName { get; init; }
    public required IReadOnlyList<ConfigurationEntry> Entries { get; init; }
}