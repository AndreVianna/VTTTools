namespace VttTools.Auth.ApiContracts;

public record UserInfo {
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public bool EmailConfirmed { get; init; }
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool IsAdministrator { get; init; }
    public bool TwoFactorEnabled { get; init; }
}