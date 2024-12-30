namespace Domain.Auth;

public enum TwoFactorType
{
    None = 0,
    Email = 1,
    TextMessage = 2,
    PhoneCall = 3,
    Authenticator = 4,
}
