namespace WebApi.Model;

public interface IBasicUserIdentity {
    Guid Id { get; }
    string Identifier { get; }
    string? Email { get; }
}
