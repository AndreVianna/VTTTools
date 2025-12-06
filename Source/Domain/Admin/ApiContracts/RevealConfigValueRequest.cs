namespace VttTools.Admin.ApiContracts;

public sealed record RevealConfigValueRequest {
    public required string ServiceName { get; init; }
    public required string Key { get; init; }
    public required string TotpCode { get; init; }
}