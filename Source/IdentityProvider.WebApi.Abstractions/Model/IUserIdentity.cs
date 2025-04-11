namespace WebApi.Model;

public interface IUserIdentity
    : IBasicUserIdentity {
    bool EmailIsConfirmed { get; }
    bool TwoFactorIsSetup { get; }
}
