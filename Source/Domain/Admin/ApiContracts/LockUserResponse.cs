namespace VttTools.Domain.Admin.ApiContracts;

public sealed record LockUserResponse : Response {
    public required bool Success { get; init; }
    public DateTimeOffset? LockedUntil { get; init; }
}