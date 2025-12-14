namespace VttTools.Library.Services;

public static partial class NamingHelper {
    [GeneratedRegex(@"^(.*?)\s*\((\d+)\)$")]
    private static partial Regex NumberSuffixPattern();

    public static (string newOriginalName, string cloneName) GenerateCloneNames(
        string originalName,
        IEnumerable<string> existingNamesInContainer) {

        (var baseName, var originalNumber) = ExtractBaseAndNumber(originalName);

        var existingNumbers = existingNamesInContainer
            .Select(ExtractBaseAndNumber)
            .Where(x => x.baseName.Equals(baseName, StringComparison.OrdinalIgnoreCase) && x.number.HasValue)
            .Select(x => x.number!.Value)
            .ToList();

        var highestNumber = existingNumbers.Count > 0 ? existingNumbers.Max() : 0;

        var newOriginalName = originalName;
        if (!originalNumber.HasValue) {
            newOriginalName = $"{baseName} (1)";
            highestNumber = Math.Max(highestNumber, 1);
        }
        else {
            highestNumber = Math.Max(highestNumber, originalNumber.Value);
        }

        var cloneName = $"{baseName} ({highestNumber + 1})";

        return (newOriginalName, cloneName);
    }

    private static (string baseName, int? number) ExtractBaseAndNumber(string name) {
        var match = NumberSuffixPattern().Match(name);
        if (match.Success) {
            var baseName = match.Groups[1].Value;
            var number = int.Parse(match.Groups[2].Value);
            return (baseName, number);
        }
        return (name, null);
    }
}