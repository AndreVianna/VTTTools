namespace HttpServices.Identity.Model;

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
