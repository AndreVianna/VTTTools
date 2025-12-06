namespace VttTools.Domain.Admin.ApiContracts;

public sealed record PasswordResetResponse : Response {
    public required bool Success { get; init; }
    public required bool EmailSent { get; init; }
}