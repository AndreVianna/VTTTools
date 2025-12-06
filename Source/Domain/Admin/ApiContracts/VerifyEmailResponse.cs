namespace VttTools.Domain.Admin.ApiContracts;

public sealed record VerifyEmailResponse : Response {
    public required bool Success { get; init; }
    public required bool EmailConfirmed { get; init; }
}