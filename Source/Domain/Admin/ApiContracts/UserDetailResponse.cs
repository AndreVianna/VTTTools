namespace VttTools.Domain.Admin.ApiContracts;

public sealed record UserDetailResponse : Response {
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public string? PhoneNumber { get; init; }
    public required bool EmailConfirmed { get; init; }
    public required bool PhoneNumberConfirmed { get; init; }
    public required bool TwoFactorEnabled { get; init; }
    public required bool LockoutEnabled { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public required bool IsLockedOut { get; init; }
    public required int AccessFailedCount { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
    public required DateTime CreatedDate { get; init; }
    public DateTime? LastLoginDate { get; init; }
    public DateTime? LastModifiedDate { get; init; }
}