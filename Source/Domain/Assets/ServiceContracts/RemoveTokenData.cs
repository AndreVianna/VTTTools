namespace VttTools.Assets.ServiceContracts;

public sealed record RemoveTokenData
    : Data {
    [Required]
    public required Guid ResourceId { get; init; }
}
