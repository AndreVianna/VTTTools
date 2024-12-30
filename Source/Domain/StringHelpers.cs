namespace Domain.Contracts.SignIn;

internal static partial class StringHelpers {
    private static readonly Regex _emailFormat = GenerateEmailFormatValidator();

    public static bool IsValidEmail(this string email, bool allowEmpty = true)
        => (allowEmpty || !string.IsNullOrWhiteSpace(email))
        && _emailFormat.IsMatch(email);

    [GeneratedRegex(@"^(?:[A-Za-z0-9_]+(?:(?:\.|\-)[A-Za-z0-9_]+)*)(?:\+[A-Za-z0-9_]+(?:(?:\.|\-)[A-Za-z0-9_]+)*)?\@(?:[A-Za-z0-9]+(?:(?:\.|\-)[A-Za-z0-9]+)*\.[A-Za-z]{2,})$", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-CA")]
    private static partial Regex GenerateEmailFormatValidator();
}