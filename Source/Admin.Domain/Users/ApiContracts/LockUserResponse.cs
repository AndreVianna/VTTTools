namespace VttTools.Admin.Users.ApiContracts;

public sealed record LockUserResponse : Response {
    public required bool Success { get; init; }
    public DateTimeOffset? LockedUntil { get; init; }
}