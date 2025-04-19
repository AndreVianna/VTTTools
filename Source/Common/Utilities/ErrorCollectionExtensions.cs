namespace VttTools.Utilities;

public static class ErrorCollectionExtensions {
    public static Dictionary<string, string[]> GroupedBySource(this IEnumerable<DotNetToolbox.Error> errors)
        => errors.SelectMany(e => e.Sources.Select(s => new { Source = s, e.Message }))
                 .GroupBy(x => x.Source)
                 .ToDictionary(g => g.Key, g => g.Select(x => x.Message).ToArray(), StringComparer.Ordinal);
}