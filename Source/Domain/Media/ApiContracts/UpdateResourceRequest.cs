namespace VttTools.Media.ApiContracts;

public sealed record UpdateResourceRequest
    : Request {
    public Optional<ResourceRole> Role { get; init; }
}
