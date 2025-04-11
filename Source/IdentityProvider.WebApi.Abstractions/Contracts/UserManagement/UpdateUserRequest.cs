namespace WebApi.Contracts.UserManagement;

/// <summary>
/// Represents the data allowed for updating an existing user's profile information.
/// </summary>
public record UpdateUserRequest
    : Request {
    /// <summary>
    /// Gets or initializes the primary identifier for the user.
    /// Must be unique.
    /// </summary>
    [Required(AllowEmptyStrings = false)]
    public required string Identifier { get; init; }
}