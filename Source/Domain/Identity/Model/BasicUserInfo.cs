namespace VttTools.Identity.Model;

public record BasicUserInfo {
    public required Guid Id { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public bool IsAdministrator { get; set; }
}