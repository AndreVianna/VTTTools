namespace VttTools.Admin.Configuration.ApiContracts;

public sealed record RevealConfigValueResponse : Response {
    public required string Value { get; init; }
    public required DateTime RevealedAt { get; init; }
}