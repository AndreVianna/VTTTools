namespace HttpServices.Abstractions.Model;

public interface IBasicUser<TKey, TProfile>
    where TKey : IEquatable<TKey>
    where TProfile : class, IUserProfile {
    TKey Id { get; set; }
    string Identifier { get; set; }
    IdentifierType IdentifierType { get; set; }
    string? UserName { get; set; }
    string? Email { get; set; }
    string? PhoneNumber { get; set; }
    string? PasswordHash { get; set; }
    TProfile? Profile { get; set; }
}
