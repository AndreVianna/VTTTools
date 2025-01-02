namespace HttpServices.Abstractions.Helpers;

public static partial class StringHelpers {
    private static readonly Random _randomizer = new((int)DateTimeOffset.UtcNow.Ticks);
    private const string _chars = ".abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+";
    private static readonly Regex _emailFormat = GenerateEmailFormatValidator();

    public static bool IsValidEmail(this string email, bool allowEmpty = true)
        => (allowEmpty || !string.IsNullOrWhiteSpace(email))
        && _emailFormat.IsMatch(email);

    [GeneratedRegex(@"^(?:[A-Za-z0-9_]+(?:(?:\.|\-)[A-Za-z0-9_]+)*)(?:\+[A-Za-z0-9_]+(?:(?:\.|\-)[A-Za-z0-9_]+)*)?\@(?:[A-Za-z0-9]+(?:(?:\.|\-)[A-Za-z0-9]+)*\.[A-Za-z]{2,})$", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-CA")]
    private static partial Regex GenerateEmailFormatValidator();

    public static string GenerateSecret(int size) {
        var builder = new StringBuilder();
        for (var i = 0; i < size; i++)
            builder.Append(_chars[_randomizer.Next(_chars.Length)]);
        return builder.ToString();
    }
}