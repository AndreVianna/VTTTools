using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record AuthResponse : Response {
    public bool Success { get; init; }
    public string? Message { get; init; }
    public UserInfo? User { get; init; }
}

public record UserInfo {
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool IsAdministrator { get; init; }
}