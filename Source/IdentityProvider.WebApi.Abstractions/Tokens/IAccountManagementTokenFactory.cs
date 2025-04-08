namespace WebApi.Tokens;

/// <summary>
/// Extends the authentication token factory to include methods for creating
/// specific account management tokens (e.g., for 2FA, email confirmation).
/// </summary>
public interface IAccountManagementTokenFactory<in TUser>
    : ITokenFactory
    where TUser : User {
    /// <summary>
    /// Creates a token suitable for two-factor authentication verification.
    /// </summary>
    /// <param name="user">Owner of the token</param>
    /// <param name="options">Configuration options for the token (e.g., lifetime).</param>
    /// <returns>A <see cref="Token"/> object representing the two-factor token.</returns>
    Task<TemporaryToken> CreateTwoFactorToken(TUser user, TwoFactorTokenOptions options);

    /// <summary>
    /// Creates a token suitable for email confirmation verification.
    /// </summary>
    /// <param name="user">Owner of the token</param>
    /// <param name="options">Configuration options for the token (e.g., lifetime).</param>
    /// <returns>A <see cref="Token"/> object representing the email confirmation token.</returns>
    Task<TemporaryToken> CreateAccountConfirmationToken(TUser user, TemporaryTokenOptions options);
}
