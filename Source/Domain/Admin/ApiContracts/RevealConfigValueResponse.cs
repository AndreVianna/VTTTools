namespace VttTools.Admin.ApiContracts;

public sealed record RevealConfigValueResponse : Response {
    public required string Value { get; init; }
    public required DateTime RevealedAt { get; init; }
}