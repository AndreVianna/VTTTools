namespace VttTools.Admin.Users.ApiContracts;

public sealed record UserSearchResponse : Response {
    public required IReadOnlyList<UserListItem> Users { get; init; }
    public required int TotalCount { get; init; }
    public required bool HasMore { get; init; }
}

public sealed record UserListItem {
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string DisplayName { get; init; }
    public required bool EmailConfirmed { get; init; }
    public required bool LockoutEnabled { get; init; }
    public required bool IsLockedOut { get; init; }
    public required bool TwoFactorEnabled { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
}