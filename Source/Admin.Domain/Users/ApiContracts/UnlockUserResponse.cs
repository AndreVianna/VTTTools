namespace VttTools.Admin.Users.ApiContracts;

public sealed record UnlockUserResponse : Response {
    public required bool Success { get; init; }
}