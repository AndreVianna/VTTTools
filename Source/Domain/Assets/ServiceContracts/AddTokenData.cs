namespace VttTools.Assets.ServiceContracts;

public sealed record AddTokenData
    : Data {
    [Required]
    public required Guid ResourceId { get; init; }
}
