namespace VttTools.Auth.ApiContracts;

public record ProfileResponse : Response {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public Guid? AvatarResourceId { get; init; }
    public string? AvatarUrl { get; init; }
    public bool Success { get; init; }
    public string? Message { get; init; }
}