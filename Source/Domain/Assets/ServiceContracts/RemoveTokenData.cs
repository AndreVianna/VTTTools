namespace VttTools.Assets.ServiceContracts;

public sealed record RemoveTokenData
    : Data {
    public required Guid ResourceId { get; init; }
}
