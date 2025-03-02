namespace Domain.Model;

public class UserProfile
    : NamedUserProfile {
    [ProtectedPersonalData]
    public string? PreferredName { get; set; }
}
