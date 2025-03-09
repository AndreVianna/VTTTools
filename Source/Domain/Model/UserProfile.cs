namespace Domain.Model;

public class UserProfile {
    public string Id { get; set; } = null!;

    [MaxLength(250)]
    [ProtectedPersonalData]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    [ProtectedPersonalData]
    public string? PreferredName { get; set; }
}
