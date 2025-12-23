namespace VttTools.Media.ServiceContracts;

public sealed record UpdateResourceData
    : Data {
    public Optional<ResourceRole> Role { get; init; }
}
