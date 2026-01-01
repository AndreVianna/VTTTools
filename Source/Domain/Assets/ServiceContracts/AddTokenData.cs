namespace VttTools.Assets.ServiceContracts;

public sealed record AddTokenData
    : Data {
    public required Guid ResourceId { get; init; }
}
