namespace VttTools.Admin.Users.ApiContracts;

public sealed record PasswordResetResponse : Response {
    public required bool Success { get; init; }
    public required bool EmailSent { get; init; }
}