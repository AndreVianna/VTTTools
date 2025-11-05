namespace VttTools.Identity.Model;

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

    [NotNull]
    [MaxLength(32)]
    public string? DisplayName {
        get => string.IsNullOrEmpty(field)
            ? (Name?.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? Name ?? string.Empty)
            : field;
        set;
    }

    public Guid? AvatarId { get; set; }

    [NotMapped]
    public bool IsAdministrator { get; set; }
    [NotMapped]
    public bool HasPassword => !string.IsNullOrEmpty(PasswordHash);
}