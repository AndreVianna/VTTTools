namespace HttpServices.Abstractions.Helpers;

public static partial class StringHelpers {
    private static readonly Random _randomizer = new((int)DateTimeOffset.UtcNow.Ticks);
    private const string _secretAllowedChars = ".abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+";
    private static readonly Regex _emailFormat = EmailValidator();
    private static readonly Regex _usernameFormat = UsernameValidator();
    private static readonly Regex _phoneNumber = PhoneNumberValidator();

    public static bool IsValidEmail(this string email, bool allowEmpty = false)
        => (allowEmpty || !string.IsNullOrWhiteSpace(email))
        && _emailFormat.IsMatch(email);

    public static bool IsValidUserName(this string username, bool allowEmpty = false)
        => (allowEmpty || !string.IsNullOrWhiteSpace(username))
        && _usernameFormat.IsMatch(username);

    public static bool IsValidPhoneNumber(this string phoneNumber, bool allowEmpty = false)
        => (allowEmpty || !string.IsNullOrWhiteSpace(phoneNumber))
        && _phoneNumber.IsMatch(phoneNumber);

    [GeneratedRegex(@"^(?:[a-z0-9_]+(?:(?:\.|\-)[a-z0-9_]+)*)(?:\+[a-z0-9_]+(?:(?:\.|\-)[a-z0-9_]+)*)?\@(?:[a-z0-9]+(?:(?:\.|\-)[a-z0-9]+)*\.[a-z]{2,})$", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-CA")]
    private static partial Regex EmailValidator();

    [GeneratedRegex("^(?!.*[_.-]{2})(?=.{3,}$)[a-z0-9_][a-z0-9_.-]+[a-z0-9_]$", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-CA")]
    private static partial Regex UsernameValidator();

    [GeneratedRegex(@"^(?:\+\d{1,4})?(?:\s*\(\s*\d+\s*\)|\d+)(?:\s*\-?\d+)*$", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-CA")]
    private static partial Regex PhoneNumberValidator();

    public static string GenerateSecret(int size) {
        var builder = new StringBuilder();
        for (var i = 0; i < size; i++)
            builder.Append(_secretAllowedChars[_randomizer.Next(_secretAllowedChars.Length)]);
        return builder.ToString();
    }
}