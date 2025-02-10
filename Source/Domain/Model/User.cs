namespace Domain.Model;

public class User
    : NamedUser {
    [ProtectedPersonalData]
    public string? PreferredName { get; set; }
}
