namespace VttTools.Identity.Model;

public record User {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public required string Email { get; init; }
    public required string Name { get; init; }
    public string DisplayName {
        get => string.IsNullOrEmpty(field)
            ? (Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? Name)
            : field;
        init;
    } = string.Empty;
    public Guid? AvatarId { get; init; }
    public UnitSystem UnitSystem { get; init; } = UnitSystem.Imperial;
    public bool EmailConfirmed { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public bool LockoutEnabled { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public bool HasPassword { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = [];
    public bool IsAdministrator => Roles.Contains(nameof(RoleName.Administrator));
}