namespace HttpServices.Abstractions.Model;

public class NamedUserProfile : IUserProfile {
    [ProtectedPersonalData]
    public virtual string Name { get; set; } = string.Empty;
}
