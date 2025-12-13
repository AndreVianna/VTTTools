namespace VttTools.Admin.Users.ApiContracts;

public sealed record VerifyEmailResponse : Response {
    public required bool Success { get; init; }
    public required bool EmailConfirmed { get; init; }
}