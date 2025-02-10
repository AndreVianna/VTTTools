namespace HttpServices.Abstractions.Model;

public interface IUserIdentity {
    string Id { get; set; }
    string? Email { get; set; }
    string? Name { get; set; }
}
