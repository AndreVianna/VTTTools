namespace VttTools.Admin.ApiContracts;

public record AdminLoginResponse : Response {
    public bool Success { get; init; }
    public bool RequiresTwoFactor { get; init; }
    public AdminUserInfo? User { get; init; }
    public string? Token { get; init; }
}