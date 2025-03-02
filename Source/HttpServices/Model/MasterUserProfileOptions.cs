namespace HttpServices.Model;

public record MasterUserProfileOptions
    : IUserProfile {
    public string Name { get; set; } = "Master";
}
