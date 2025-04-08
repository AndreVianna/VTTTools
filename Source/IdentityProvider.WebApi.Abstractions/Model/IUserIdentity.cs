namespace WebApi.Model;

public interface IUserIdentity
    : IBasicUserIdentity {
    bool AccountConfirmed { get; }
    TwoFactorType TwoFactorType { get; }
    string? PhoneNumber { get; }
}
