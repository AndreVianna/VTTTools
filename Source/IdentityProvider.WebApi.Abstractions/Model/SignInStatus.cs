namespace WebApi.Model;

public enum SignInStatus {
    InvalidInput,
    AccountNotFound,
    AccountIsBlocked,
    AccountIsLocked,
    LoginProviderNotFound,
    Incorrect,
    AccountConfirmationRequired,
    TwoFactorIsNotSetup,
    TwoFactorRequired,
    Success,
}
