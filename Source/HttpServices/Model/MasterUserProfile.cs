namespace HttpServices.Model;

public class MasterUserProfile
    : NamedUserProfile {
    public override required string Name { get; set; } = "Master";
}
