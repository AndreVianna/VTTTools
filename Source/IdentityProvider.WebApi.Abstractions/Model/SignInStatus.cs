namespace WebApi.Model;

public enum SignInStatus {
    InvalidInput,
    AccountNotFound,
    BlockedAccount,
    LockedAccount,
    IncorrectLogin,
    AccountConfirmationRequired,
    TwoFactorSetupIsPending,
    TwoFactorRequired,
    Success,
}
