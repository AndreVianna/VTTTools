using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record AuthResponse : Response {
    public bool Success { get; init; }
    public string? Message { get; init; }
    public UserInfo? User { get; init; }
}