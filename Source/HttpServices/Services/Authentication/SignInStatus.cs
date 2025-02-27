namespace HttpServices.Services.Authentication;

public enum SignInStatus {
    InvalidInput,
    AccountNotFound,
    BlockedAccount,
    LockedAccount,
    IncorrectLogin,
    EmailNotConfirmed,
    RequiresTwoFactor,
    Success,
}
