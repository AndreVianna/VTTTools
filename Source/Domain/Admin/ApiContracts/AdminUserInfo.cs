namespace VttTools.Admin.ApiContracts;

public record AdminUserInfo {
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool IsAdmin { get; init; }
}
