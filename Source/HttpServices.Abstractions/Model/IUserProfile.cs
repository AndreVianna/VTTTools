namespace HttpServices.Abstractions.Model;

public interface IUserProfile {
    [ProtectedPersonalData]
    string Name { get; set; }
}
