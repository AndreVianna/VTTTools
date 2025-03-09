namespace HttpServices.Identity.Model;

public interface IBasicUserIdentity<TKey>
    where TKey : IEquatable<TKey> {
    TKey Id { get; set; }
    string Identifier { get; set; }
    IdentifierType IdentifierType { get; set; }
    string? UserName { get; set; }
    string? Email { get; set; }
    string? PhoneNumber { get; set; }
    string? PasswordHash { get; set; }
}
