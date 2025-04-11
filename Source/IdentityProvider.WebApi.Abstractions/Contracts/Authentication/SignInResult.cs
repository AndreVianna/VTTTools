namespace WebApi.Contracts.Authentication;

public enum SignInResult {
    AccountNotFound,
    Blocked,
    Locked,
    LoginProviderNotFound,
    InvalidSignIn,
    RequiresConfirmation,
    TwoFactorSetupPending,
    RequiresTwoFactor,
    Success,
}
