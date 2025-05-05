namespace VttTools.Model.Identity;

// Add profile data for application users by adding properties to the User class
public class User
    : IdentityUser<Guid> {
    public override Guid Id { get; set; } = Guid.CreateVersion7();

    [MaxLength(256)]
    [Required(AllowEmptyStrings = false)]
#pragma warning disable CS8765 // Nullability of type of parameter doesn't match overridden member (possibly because of nullability attributes).
    public override string Email { get; set; } = null!;
#pragma warning restore CS8765

    [MaxLength(128)]
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = null!;

    [MaxLength(32)]
    public string? DisplayName { get; set; }
}